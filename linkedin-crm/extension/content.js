// Content script : lit passivement ce qui est affiché sur LinkedIn (aucun clic, aucune requête vers LinkedIn)
// et envoie des fiches au service worker. Le DOM de LinkedIn change souvent : l'extraction repose sur
// le texte visible et la structure des liens /in/<slug>, avec des sélecteurs de repli.
(() => {
  if (window.__lcrmLoaded) return;
  window.__lcrmLoaded = true;

  const NOISE = /^(se connecter|connect|suivre|follow|following|abonné\(e\)|message|envoyer un message|en attente|pending|plus|more|voir plus|see more|…plus|\.\.\.plus|enregistrer|save|invitation envoy[ée]e?|ignorer|accepter|retirer|remove|premium|ouvert aux opportunités|open to work|\d+ relations? en commun.*|\d+ mutual connections?.*|.*et \d+ autres? relations? en commun.*|voir le profil.*|view .*profile.*|statut\s*:.*|status is.*)$/i;
  const DEGREE = /^[•·]?\s*(1er|1st|2e|2nd|3e|3rd)(\s*et\s*\+|\+)?\s*$/i;
  const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const PHONE = /(\+?\d[\d\s().-]{7,}\d)/;

  const txt = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const slugFrom = (href) => {
    try {
      const u = new URL(href, location.origin);
      if (!/(^|\.)linkedin\.com$/.test(u.hostname)) return '';
      const m = u.pathname.match(/^\/in\/([^/]+)/);
      return m ? decodeURIComponent(m[1]).toLowerCase() : '';
    } catch { return ''; }
  };
  const profileUrl = (slug) => `https://www.linkedin.com/in/${encodeURIComponent(slug)}/`;

  // Lignes de texte visibles, sans doublons consécutifs (LinkedIn répète le texte pour les lecteurs d'écran)
  function linesOf(el) {
    const out = [];
    for (const raw of (el?.innerText || '').split('\n')) {
      const s = raw.replace(/\s+/g, ' ').trim();
      if (s && s !== out[out.length - 1]) out.push(s);
    }
    return out;
  }
  const cleanName = (s) => s.replace(/^(voir le profil de|view)\s+/i, '').replace(/(’s|'s)? profile$/i, '')
    .replace(/\s*[•·]\s*(1er|1st|2e|2nd|3e|3rd).*$/i, '').replace(/,\s*(premium|ouvert.*)$/i, '').trim();

  /** Pose les premières lignes utiles d'un bloc : nom, titre, lieu. */
  function fromLines(lines, nameHint) {
    let name = nameHint ? cleanName(nameHint) : '';
    const rest = [];
    let degree = '';
    for (const l of lines) {
      if (DEGREE.test(l)) { degree = l.replace(/[•·]/g, '').trim(); continue; }
      if (NOISE.test(l)) continue;
      if (/^[•·]$/.test(l)) continue;
      rest.push(l);
    }
    if (!name) name = cleanName(rest.shift() || '');
    else if (rest[0] && cleanName(rest[0]) === name) rest.shift();
    // Certains blocs répètent le nom dans une variante "Prénom Nom, Certification"
    while (rest[0] && rest[0].startsWith(name)) rest.shift();
    return { name, degree, headline: rest[0] || '', location: rest[1] || '' };
  }

  // ---------- Page profil complet ----------
  function parseProfilePage() {
    const m = location.pathname.match(/^\/in\/([^/]+)\/?(overlay\/contact-info\/?)?$/);
    if (!m) return null;
    const slug = decodeURIComponent(m[1]).toLowerCase();
    const main = document.querySelector('main') || document.body;
    const h1 = main.querySelector('h1');
    let name = cleanName(txt(h1) || document.title.replace(/^\(\d+\)\s*/, '').split(/\s[|–-]\s/)[0]);
    if (!name) return null;

    // Titre et lieu : sélecteurs connus, sinon premières lignes après le h1
    let headline = txt(main.querySelector('div.text-body-medium'));
    let location_ = txt(main.querySelector('span.text-body-small.inline, div.text-body-small.inline-block span'));
    if (!headline && h1) {
      const block = h1.closest('section') || h1.parentElement?.parentElement;
      const f = fromLines(linesOf(block), name);
      headline = f.headline; location_ ||= f.location;
    }
    const degree = (txt(main.querySelector('.distance-badge, span.dist-value')) || '').replace(/[•·]/g, '').trim();

    const sectionOf = (id) => document.getElementById(id)?.closest('section');
    const visible = (root) => [...(root?.querySelectorAll('span[aria-hidden="true"]') || [])].map(txt).filter(Boolean);

    const about = (() => {
      const s = sectionOf('about');
      if (!s) return '';
      const parts = visible(s).filter((t) => !/^(à propos|about)$/i.test(t));
      return parts.sort((a, b) => b.length - a.length)[0] || '';
    })();

    const experience = [];
    for (const li of (sectionOf('experience')?.querySelectorAll('li') || [])) {
      if (li.closest('li') !== li) continue;
      const v = visible(li);
      if (v[0] && !experience.some((e) => e.title === v[0])) {
        experience.push({ title: v[0], company: (v[1] || '').split('·')[0].trim(), dates: v[2] || '' });
      }
      if (experience.length >= 10) break;
    }

    const prof = { slug, url: profileUrl(slug), name, headline, location: location_, degree, about, experience, page_type: 'profile' };

    // Fenêtre "Coordonnées" (ouverte par l'utilisateur) : email, téléphone, sites
    const dlg = document.querySelector('[role="dialog"], .artdeco-modal');
    if (dlg && /coordonn|contact info/i.test(dlg.innerText || '')) {
      const mail = dlg.querySelector('a[href^="mailto:"]');
      prof.email = mail ? decodeURIComponent(mail.getAttribute('href').slice(7)).split('?')[0] : (EMAIL.exec(dlg.innerText) || [''])[0];
      const phoneBlock = [...dlg.querySelectorAll('section, div')].find((n) => /^(t[ée]l[ée]phone|phone)/i.test(txt(n.querySelector('h3, header'))) );
      const ph = PHONE.exec(phoneBlock ? phoneBlock.innerText : '');
      if (ph) prof.phone = ph[1].trim();
      prof.websites = [...dlg.querySelectorAll('a[href^="http"]')]
        .map((a) => a.href).filter((h) => !/linkedin\.com\/(in|help|legal)/.test(h)).slice(0, 5);
      const since = /(connect[ée]+\(?e?\)? depuis|connected since)\s*[:\s]\s*([^\n]+)/i.exec(dlg.innerText);
      if (since) prof.connected_since = since[2].trim();
    } else {
      const mail = main.querySelector('a[href^="mailto:"]');
      if (mail) prof.email = decodeURIComponent(mail.getAttribute('href').slice(7)).split('?')[0];
    }
    return prof;
  }

  // ---------- Cartes de profils (recherche, relations, "personnes que vous connaissez", feed, etc.) ----------
  function parseCards() {
    const bySlug = new Map();
    for (const a of document.querySelectorAll('a[href*="/in/"]')) {
      const slug = slugFrom(a.href);
      if (!slug || bySlug.has(slug)) continue;
      // On remonte tant que le conteneur ne mêle pas plusieurs profils distincts
      let card = a;
      for (let i = 0; i < 8; i++) {
        const parent = card.parentElement;
        if (!parent || parent === document.body) break;
        const slugs = new Set([...parent.querySelectorAll('a[href*="/in/"]')].map((x) => slugFrom(x.href)).filter(Boolean));
        if (slugs.size > 1) break;
        card = parent;
        if (card.tagName === 'LI') break;
      }
      if (card === a) continue;
      const named = a.querySelector('span[aria-hidden="true"]') || a.querySelector('span') || a;
      const f = fromLines(linesOf(card), txt(named).split('\n')[0]);
      if (!f.name || f.name.length > 80 || /^(afficher|voir|show|see)\b/i.test(f.name)) continue;
      bySlug.set(slug, {
        slug, url: profileUrl(slug), name: f.name, headline: f.headline, location: f.location, degree: f.degree,
        page_type: /\/search\//.test(location.pathname) ? 'search' : /connections/.test(location.pathname) ? 'connections' : 'list',
      });
    }
    return [...bySlug.values()];
  }

  // ---------- Envoi ----------
  const sentHash = new Map(); // slug -> hash du dernier envoi, évite le spam
  const hash = (o) => JSON.stringify([o.name, o.headline, o.location, o.email, o.phone, o.about, o.experience?.length, o.websites?.length]);

  function scan() {
    if (checkBlocked()) return;
    const found = [];
    const prof = parseProfilePage();
    if (prof) found.push(prof);
    for (const c of parseCards()) if (!prof || c.slug !== prof.slug) found.push(c);

    const fresh = found.filter((p) => {
      const h = hash(p);
      if (sentHash.get(p.slug) === h) return false;
      sentHash.set(p.slug, h);
      return true;
    });
    if (!fresh.length) return;
    try { chrome.runtime.sendMessage({ type: 'ingest', profiles: fresh }); } catch { /* extension rechargée : ignorer */ }
  }
  window.__lcrmScan = scan;

  // ---------- Exploration : liste des profils de la page + détection de blocage ----------
  try {
    chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
      if (msg?.type === 'listSlugs') {
        const slugs = parseCards().map((c) => c.slug);
        reply({ slugs, count: slugs.length });
      }
    });
  } catch { /* hors extension (tests) */ }

  // Page de vérification / limite : on prévient le service worker, qui arrête l'exploration.
  const BLOCK_PATH = /^\/(checkpoint|authwall|uas\/|login|signup)/;
  const BLOCK_TEXT = /activit[ée] inhabituelle|unusual activity|v[ée]rification de s[ée]curit[ée]|security verification|limite.{0,40}(consultations|visites|profils)|(reached|atteint).{0,40}(limit|limite)|temporarily restricted|temporairement restreint/i;
  let blockedSent = false;
  /** Vrai si la page est une vérification / limite LinkedIn : on n'en extrait alors rien. */
  function checkBlocked() {
    let reason = BLOCK_PATH.test(location.pathname) ? location.pathname : '';
    if (!reason) {
      const probe = [...document.querySelectorAll('h1, h2, [role="dialog"], .artdeco-modal, [role="alert"]')].map(txt).join(' ').slice(0, 3000);
      if (BLOCK_TEXT.test(probe)) reason = 'texte d’alerte LinkedIn';
    }
    if (reason && !blockedSent) {
      blockedSent = true;
      try { chrome.runtime.sendMessage({ type: 'blocked', reason }); } catch { /* ignoré */ }
    }
    if (!reason) blockedSent = false;
    return !!reason;
  }

  // LinkedIn est une SPA : on scanne après chaque pause de mutations DOM et à chaque changement d'URL.
  let timer;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(scan, 1500); };
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  let lastUrl = location.href;
  setInterval(() => { if (location.href !== lastUrl) { lastUrl = location.href; schedule(); } }, 1000);
  schedule();
})();
