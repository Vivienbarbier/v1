// Import du fichier "Connections.csv" de l'export officiel LinkedIn (FR ou EN).
// Usage CLI : npm run import -- chemin/vers/Connections.csv
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { upsertProfile } from './db.js';

/** Parseur CSV RFC 4180 (guillemets, virgules et retours à la ligne dans les champs). */
export function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false; }
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((x) => x.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}

const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const ALIASES = {
  first: ['first name', 'prenom'],
  last: ['last name', 'nom', 'nom de famille'],
  url: ['url', 'profile url', 'url du profil'],
  email: ['email address', 'adresse e-mail', 'adresse email', 'e-mail', 'email'],
  company: ['company', 'entreprise', 'societe'],
  position: ['position', 'poste', 'titre'],
  connected: ['connected on', 'connecte le', 'connecte(e) le', 'date de connexion'],
};

export function importConnections(text) {
  const rows = parseCsv(text);
  // L'export LinkedIn commence souvent par quelques lignes de notes avant l'en-tête.
  const headerIdx = rows.findIndex((r) => r.map(norm).some((h) => ALIASES.url.includes(h)) && r.map(norm).some((h) => ALIASES.first.includes(h)));
  if (headerIdx < 0) throw new Error("En-tête introuvable : ce fichier ne ressemble pas à Connections.csv (colonnes attendues : First Name / Prénom, URL…)");
  const header = rows[headerIdx].map(norm);
  const col = Object.fromEntries(Object.entries(ALIASES).map(([k, names]) => [k, header.findIndex((h) => names.includes(h))]));

  let created = 0, updated = 0, skipped = 0;
  for (const r of rows.slice(headerIdx + 1)) {
    const get = (k) => (col[k] >= 0 ? (r[col[k]] || '').trim() : '');
    const m = get('url').match(/linkedin\.com\/in\/([^/?#]+)/i);
    if (!m) { skipped++; continue; } // certains membres n'ont pas d'URL dans l'export
    const res = upsertProfile({
      slug: m[1], url: get('url').replace(/^http:/, 'https:'),
      name: [get('first'), get('last')].filter(Boolean).join(' '),
      headline: get('position'), company: get('company'), email: get('email'),
      connected_since: get('connected'), degree: '1er', page_type: 'csv',
    }, { fillOnly: true, seen: false });
    if (!res) skipped++; else res.created ? created++ : updated++;
  }
  return { created, updated, skipped };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('Usage : npm run import -- chemin/vers/Connections.csv'); process.exit(1); }
  console.log(importConnections(readFileSync(file, 'utf8')));
}
