// Service worker : (1) transmet les fiches au serveur local, avec file d'attente si le serveur est éteint ;
// (2) exploration limitée : ouvre un par un, en arrière-plan, les profils listés sur la page courante.
const DEFAULTS = { enabled: true, serverUrl: 'http://127.0.0.1:4317', token: '', dailyCap: 30, withContact: true };
const QUEUE_MAX = 1000;
const DAILY_HARD_MAX = 100;     // plafond non contournable depuis le popup
const MIN_DELAY_MIN = 0.5;      // 30 s minimum entre deux profils
const MAX_DELAY_MIN = 1.25;     // 75 s maximum
const VISIT_TIMEOUT_MS = 35000;

const getCfg = async () => ({ ...DEFAULTS, ...(await chrome.storage.local.get(Object.keys(DEFAULTS))) });
const today = () => new Date().toLocaleDateString('sv'); // AAAA-MM-JJ en heure locale

// ====================== Envoi au serveur ======================
async function api(cfg, path, body) {
  const r = await fetch(cfg.serverUrl.replace(/\/+$/, '') + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-token': cfg.token },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

async function setStatus(ok, extra = {}) {
  await chrome.storage.local.set({ lastOk: ok, lastAt: Date.now(), ...extra });
  const { queue = [] } = await chrome.storage.local.get('queue');
  chrome.action.setBadgeText({ text: ok ? '' : queue.length ? String(Math.min(queue.length, 99)) : '!' });
  chrome.action.setBadgeBackgroundColor({ color: '#d93025' });
}

async function flush(newProfiles = []) {
  const cfg = await getCfg();
  if (!cfg.enabled) return;
  const { queue = [] } = await chrome.storage.local.get('queue');
  const batch = [...queue, ...newProfiles];
  if (!batch.length) return;
  try {
    if (!cfg.token) throw new Error('token manquant');
    let created = 0, updated = 0;
    for (let i = 0; i < batch.length; i += 100) {
      const r = await api(cfg, '/api/ingest', { profiles: batch.slice(i, i + 100) });
      created += r.created; updated += r.updated;
    }
    const { total = 0, newCount = 0 } = await chrome.storage.local.get(['total', 'newCount']);
    await chrome.storage.local.set({ queue: [], total: total + created + updated, newCount: newCount + created });
    await setStatus(true, { error: '' });
  } catch (e) {
    await chrome.storage.local.set({ queue: batch.slice(-QUEUE_MAX) });
    await setStatus(false, { error: String(e.message || e) });
  }
}

// ====================== Exploration limitée ======================
// État dans chrome.storage (le service worker peut être arrêté à tout moment) :
// crawl = { state: idle|running|paused|cap|blocked|finished, queue: [slugs], done, total, today, day, current, busy, note }
const EMPTY = { state: 'idle', queue: [], done: 0, total: 0, today: 0, day: today(), current: '', busy: 0, note: '' };
const getCrawl = async () => ({ ...EMPTY, ...((await chrome.storage.local.get('crawl')).crawl || {}) });
const setCrawl = (c) => chrome.storage.local.set({ crawl: c });
const waiters = new Map(); // tabId -> { resolve, gotProfile, gotContact, withContact }

function scheduleNext() {
  chrome.alarms.create('crawl', { delayInMinutes: MIN_DELAY_MIN + Math.random() * (MAX_DELAY_MIN - MIN_DELAY_MIN) });
}

async function startCrawl(slugs) {
  const cfg = await getCfg();
  let list = [...new Set((slugs || []).map((s) => String(s).toLowerCase()))];
  try { // on saute les profils déjà capturés en détail
    const { complete } = await api(cfg, '/api/known', { slugs: list });
    const known = new Set(complete);
    list = list.filter((s) => !known.has(s));
  } catch (e) {
    await setCrawl({ ...(await getCrawl()), note: 'Serveur injoignable : exploration non démarrée.' });
    return;
  }
  const c = await getCrawl();
  const queue = [...new Set([...c.queue, ...list])];
  const day = today();
  await setCrawl({ ...c, state: queue.length ? 'running' : 'finished', queue, total: c.state === 'running' || c.state === 'paused' ? c.total + list.length : queue.length, done: c.state === 'running' || c.state === 'paused' ? c.done : 0, day, today: c.day === day ? c.today : 0, note: queue.length ? '' : 'Tous ces profils sont déjà dans la base.' });
  if (queue.length) scheduleNext();
}

async function tick() {
  const c = await getCrawl();
  if (c.state !== 'running') return;
  if (c.busy && Date.now() - c.busy < 90000) return; // une visite est déjà en cours
  const cfg = await getCfg();
  const day = today();
  if (c.day !== day) { c.day = day; c.today = 0; }
  const cap = Math.min(Math.max(+cfg.dailyCap || 30, 1), DAILY_HARD_MAX);
  if (c.today >= cap) { await setCrawl({ ...c, state: 'cap', note: `Plafond du jour atteint (${cap}). Reprenez demain.` }); return; }
  const slug = c.queue.shift();
  if (!slug) { await setCrawl({ ...c, state: 'finished', current: '', note: 'Exploration terminée.' }); return; }
  await setCrawl({ ...c, current: slug, busy: Date.now() });

  let outcome = 'error';
  try { outcome = await visit(slug, cfg.withContact); } catch { /* compté comme erreur */ }

  const after = await getCrawl(); // l'utilisateur a pu mettre en pause / arrêter pendant la visite
  after.busy = 0; after.current = '';
  after.done += 1; after.today = (after.day === day ? after.today : 0) + 1; after.day = day;
  if (outcome === 'blocked') { after.state = 'blocked'; after.note = 'LinkedIn affiche une vérification ou une limite. Exploration arrêtée : ouvrez LinkedIn à la main et attendez avant de reprendre.'; }
  await setCrawl(after);
  if (after.state === 'running') scheduleNext();
}

/** Ouvre le profil dans un onglet d'arrière-plan, attend la capture du content script, puis ferme l'onglet. */
async function visit(slug, withContact) {
  const url = `https://www.linkedin.com/in/${encodeURIComponent(slug)}/` + (withContact ? 'overlay/contact-info/' : '');
  const tab = await chrome.tabs.create({ url, active: false });
  try {
    return await new Promise((resolve) => {
      const w = { gotProfile: false, gotContact: false, withContact, resolve: (v) => { clearTimeout(t); clearTimeout(w.settle); waiters.delete(tab.id); resolve(v); } };
      const t = setTimeout(() => w.resolve(w.gotProfile ? 'ok' : 'timeout'), VISIT_TIMEOUT_MS);
      waiters.set(tab.id, w);
    });
  } finally {
    try { await chrome.tabs.remove(tab.id); } catch { /* déjà fermé */ }
  }
}

function onTabMessage(msg, tabId) {
  const w = waiters.get(tabId);
  if (!w) return;
  if (msg.type === 'blocked') return w.resolve('blocked');
  for (const p of msg.profiles || []) {
    if (p.page_type !== 'profile') continue;
    w.gotProfile = true;
    if (p.email || p.phone || p.websites?.length) w.gotContact = true;
  }
  if (!w.gotProfile) return;
  // Profil capturé. Si on attend aussi les coordonnées, on laisse jusqu'à 8 s pour la fenêtre ; sinon on termine vite.
  clearTimeout(w.settle);
  w.settle = setTimeout(() => w.resolve('ok'), !w.withContact || w.gotContact ? 1500 : 8000);
}

async function crawlCommand(cmd, data) {
  const c = await getCrawl();
  if (cmd === 'start') return startCrawl(data.slugs);
  if (cmd === 'pause' && c.state === 'running') return setCrawl({ ...c, state: 'paused', note: 'En pause.' });
  if (cmd === 'resume' && ['paused', 'cap', 'blocked'].includes(c.state)) {
    await setCrawl({ ...c, state: 'running', note: '', busy: 0 });
    return scheduleNext();
  }
  if (cmd === 'stop') { chrome.alarms.clear('crawl'); return setCrawl({ ...EMPTY, note: 'Arrêtée.' }); }
}

// ====================== Messages & alarmes ======================
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  const fromLinkedIn = sender.url?.startsWith('https://www.linkedin.com/');
  if (sender.tab && fromLinkedIn) onTabMessage(msg, sender.tab.id);
  if (msg?.type === 'ingest' && Array.isArray(msg.profiles) && fromLinkedIn) flush(msg.profiles);
  if (msg?.type === 'blocked' && fromLinkedIn) {
    // Même hors d'un onglet d'exploration : on coupe tout si une exploration est en cours.
    getCrawl().then((c) => { if (c.state === 'running') setCrawl({ ...c, state: 'blocked', note: 'LinkedIn affiche une vérification ou une limite. Exploration arrêtée.' }); });
  }
  if (msg?.type === 'flush') flush();
  if (msg?.type === 'crawl') { crawlCommand(msg.cmd, msg).then(() => reply({ ok: true })); return true; }
});

chrome.alarms.create('retry', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === 'retry') flush();
  if (a.name === 'crawl') tick();
});
