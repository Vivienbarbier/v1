// Service worker : transmet les fiches au serveur local, avec file d'attente si le serveur est éteint.
const DEFAULTS = { enabled: true, serverUrl: 'http://127.0.0.1:4317', token: '' };
const QUEUE_MAX = 1000;

const getCfg = async () => ({ ...DEFAULTS, ...(await chrome.storage.local.get(Object.keys(DEFAULTS))) });

async function post(cfg, profiles) {
  const r = await fetch(cfg.serverUrl.replace(/\/+$/, '') + '/api/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-token': cfg.token },
    body: JSON.stringify({ profiles }),
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
      const r = await post(cfg, batch.slice(i, i + 100));
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

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type === 'ingest' && Array.isArray(msg.profiles) && sender.url?.startsWith('https://www.linkedin.com/')) flush(msg.profiles);
  if (msg?.type === 'flush') flush();
});

chrome.alarms.create('retry', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((a) => { if (a.name === 'retry') flush(); });
