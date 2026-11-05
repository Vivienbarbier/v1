const $ = (id) => document.getElementById(id);
const DEFAULTS = { enabled: true, serverUrl: 'http://127.0.0.1:4317', token: '' };

async function render() {
  const s = { ...DEFAULTS, ...(await chrome.storage.local.get(null)) };
  $('enabled').checked = s.enabled;
  $('serverUrl').value = s.serverUrl;
  $('token').value = s.token;
  const q = (s.queue || []).length;
  const st = $('state');
  st.className = s.lastOk === false ? 'bad' : '';
  st.textContent = s.lastOk === false
    ? `Serveur injoignable ou token invalide (${s.error || 'erreur'}). ${q} fiche(s) en attente.`
    : `${s.newCount || 0} nouveau(x) profil(s), ${s.total || 0} envoi(s) depuis l'installation.`;
}

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
