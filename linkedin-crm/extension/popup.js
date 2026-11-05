const $ = (id) => document.getElementById(id);
const DEFAULTS = { enabled: true, serverUrl: 'http://127.0.0.1:4317', token: '', dailyCap: 30, withContact: true };

async function render() {
  const s = { ...DEFAULTS, ...(await chrome.storage.local.get(null)) };
  if (document.activeElement?.tagName !== 'INPUT') {
    $('enabled').checked = s.enabled;
    $('serverUrl').value = s.serverUrl;
    $('token').value = s.token;
    $('dailyCap').value = s.dailyCap;
    $('withContact').checked = s.withContact;
  }
  const q = (s.queue || []).length;
  const st = $('state');
  st.className = s.lastOk === false ? 'bad' : '';
  st.textContent = s.lastOk === false
    ? `Serveur injoignable ou token invalide (${s.error || 'erreur'}). ${q} fiche(s) en attente.`
    : `${s.newCount || 0} nouveau(x) profil(s), ${s.total || 0} envoi(s) depuis l'installation.`;

  const c = s.crawl || { state: 'idle', queue: [], done: 0, total: 0, today: 0 };
  const cap = Math.min(s.dailyCap, 100);
  const label = { idle: 'Inactive.', running: 'En cours', paused: 'En pause', cap: 'Plafond du jour atteint', blocked: 'Arrêtée : LinkedIn demande une vérification', finished: 'Terminée' }[c.state] || c.state;
  const el = $('crawlState');
  el.className = c.state === 'blocked' ? 'bad' : c.state === 'cap' || c.state === 'paused' ? 'warn' : '';
  el.textContent = c.state === 'idle' && !c.note ? label
    : `${label}${c.total ? ` · ${c.done}/${c.total} · aujourd'hui ${c.today}/${cap}` : ''}${c.current ? ` · visite de ${c.current}` : ''}${c.note ? ' — ' + c.note : ''}`;
  $('crawlPause').hidden = c.state !== 'running';
  $('crawlResume').hidden = !['paused', 'cap', 'blocked'].includes(c.state);
  $('crawlStop').hidden = c.state === 'idle';
  $('crawlStart').disabled = c.state === 'blocked';
}

const crawl = (cmd, extra = {}) => chrome.runtime.sendMessage({ type: 'crawl', cmd, ...extra }).then(render);

$('crawlStart').onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.startsWith('https://www.linkedin.com/')) { $('crawlState').textContent = 'Ouvrez d’abord une page LinkedIn (liste de relations, recherche…).'; return; }
  let res;
  try { res = await chrome.tabs.sendMessage(tab.id, { type: 'listSlugs' }); } catch { res = null; }
  if (!res?.slugs?.length) { $('crawlState').textContent = 'Aucun profil détecté sur cette page (rechargez-la ?).'; return; }
  if (res.slugs.length > 100 && !confirm(`${res.slugs.length} profils détectés. Ils seront visités à raison de ${Math.min(+$('dailyCap').value || 30, 100)} maximum par jour. Continuer ?`)) return;
  await chrome.storage.local.set({ dailyCap: Math.min(Math.max(+$('dailyCap').value || 30, 1), 100), withContact: $('withContact').checked });
  crawl('start', { slugs: res.slugs });
};
$('crawlPause').onclick = () => crawl('pause');
$('crawlResume').onclick = () => crawl('resume');
$('crawlStop').onclick = () => crawl('stop');
$('dailyCap').onchange = () => chrome.storage.local.set({ dailyCap: Math.min(Math.max(+$('dailyCap').value || 30, 1), 100) });
$('withContact').onchange = () => chrome.storage.local.set({ withContact: $('withContact').checked });

$('save').onclick = async () => {
  await chrome.storage.local.set({ enabled: $('enabled').checked, serverUrl: $('serverUrl').value.trim(), token: $('token').value.trim() });
  chrome.runtime.sendMessage({ type: 'flush' });
  setTimeout(render, 600);
};
$('enabled').onchange = () => chrome.storage.local.set({ enabled: $('enabled').checked });
$('open').onclick = async () => {
  const { serverUrl, token } = { ...DEFAULTS, ...(await chrome.storage.local.get(['serverUrl', 'token'])) };
  chrome.tabs.create({ url: `${serverUrl.replace(/\/+$/, '')}/#token=${encodeURIComponent(token)}` });
};
render();
setInterval(render, 2000);
