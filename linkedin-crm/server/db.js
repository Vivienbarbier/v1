// Base SQLite locale (module natif node:sqlite, Node >= 22.13, aucune dépendance)
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = process.env.LCRM_DATA_DIR || resolve(here, '..', 'data');
mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(resolve(DATA_DIR, 'profiles.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS profiles (
    slug         TEXT PRIMARY KEY,
    url          TEXT,
    name         TEXT,
    headline     TEXT,
    company      TEXT,
    location     TEXT,
    about        TEXT,
    email        TEXT,
    phone        TEXT,
    websites     TEXT DEFAULT '[]',
    experience   TEXT DEFAULT '[]',
    degree       TEXT,
    connected_since TEXT,
    sources      TEXT DEFAULT '[]',
    first_seen   TEXT,
    last_seen    TEXT,
    seen_count   INTEGER DEFAULT 0,
    status       TEXT DEFAULT 'nouveau',
    tags         TEXT DEFAULT '[]',
    notes        TEXT DEFAULT ''
  );
  CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON profiles(last_seen);
`);

const TEXT_FIELDS = ['url', 'name', 'headline', 'company', 'location', 'about', 'email', 'phone', 'degree', 'connected_since'];
const JSON_FIELDS = ['websites', 'experience'];

const clean = (v, max = 4000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const parse = (s, fb) => { try { return JSON.parse(s); } catch { return fb; } };

export function normalizeSlug(s) {
  try { s = decodeURIComponent(String(s || '')); } catch { s = String(s || ''); }
  return s.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
}

function hydrate(r) {
  if (!r) return null;
  return {
    ...r,
    websites: parse(r.websites, []),
    experience: parse(r.experience, []),
    sources: parse(r.sources, []),
    tags: parse(r.tags, []),
  };
}

/** Insère ou fusionne un profil : une valeur vide ne remplace jamais une valeur connue. */
export function upsertProfile(p, { fillOnly = false, seen = true } = {}) {
  const slug = normalizeSlug(p.slug);
  if (!slug || slug.length > 200) return null;
  const now = new Date().toISOString();
  const old = db.prepare('SELECT * FROM profiles WHERE slug = ?').get(slug);

  // fillOnly (import CSV) : ne complète que les champs vides, n'écrase jamais une donnée déjà capturée.
  const next = {};
  for (const f of TEXT_FIELDS) {
    const incoming = clean(p[f], f === 'about' ? 6000 : 500);
    const prev = old?.[f] ?? '';
    next[f] = fillOnly ? (prev || incoming) : (incoming || prev);
  }
  if (!next.url) next.url = `https://www.linkedin.com/in/${encodeURIComponent(slug)}/`;
  for (const f of JSON_FIELDS) {
    const incoming = Array.isArray(p[f]) ? p[f].slice(0, 30) : [];
    const prev = parse(old?.[f], []);
    next[f] = JSON.stringify(fillOnly ? (prev.length ? prev : incoming) : (incoming.length ? incoming : prev));
  }
  if (!next.company) {
    const exp = parse(next.experience, []);
    if (exp[0]?.company) next.company = clean(exp[0].company, 200);
  }
  const sources = new Set(parse(old?.sources, []));
  if (p.page_type) sources.add(clean(p.page_type, 40));

  if (old) {
    db.prepare(`UPDATE profiles SET url=?, name=?, headline=?, company=?, location=?, about=?, email=?, phone=?,
      websites=?, experience=?, degree=?, connected_since=?, sources=?, last_seen=?, seen_count=seen_count+? WHERE slug=?`)
      .run(next.url, next.name, next.headline, next.company, next.location, next.about, next.email, next.phone,
        next.websites, next.experience, next.degree, next.connected_since, JSON.stringify([...sources]),
        seen ? now : old.last_seen, seen ? 1 : 0, slug);
  } else {
    db.prepare(`INSERT INTO profiles (slug,url,name,headline,company,location,about,email,phone,websites,experience,
      degree,connected_since,sources,first_seen,last_seen,seen_count) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(slug, next.url, next.name, next.headline, next.company, next.location, next.about, next.email, next.phone,
        next.websites, next.experience, next.degree, next.connected_since, JSON.stringify([...sources]), now, now, seen ? 1 : 0);
  }
  return { slug, created: !old };
}

export function listProfiles({ q = '', status = '', hasEmail = false, hasPhone = false, limit = 50, offset = 0, sort = 'last_seen' } = {}) {
  const where = [];
  const args = [];
  for (const term of String(q).split(/\s+/).filter(Boolean).slice(0, 8)) {
    where.push(`(name LIKE ? OR headline LIKE ? OR company LIKE ? OR location LIKE ? OR about LIKE ? OR email LIKE ? OR notes LIKE ? OR tags LIKE ? OR experience LIKE ?)`);
    const like = `%${term}%`;
    args.push(like, like, like, like, like, like, like, like, like);
  }
  if (status) { where.push('status = ?'); args.push(status); }
  if (hasEmail) where.push("email != ''");
  if (hasPhone) where.push("phone != ''");
  const orderBy = { last_seen: 'last_seen DESC', first_seen: 'first_seen DESC', name: 'name COLLATE NOCASE ASC', seen_count: 'seen_count DESC' }[sort] || 'last_seen DESC';
  const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const lim = Math.min(Math.max(+limit || 50, 1), 500);
  const off = Math.max(+offset || 0, 0);
  const total = db.prepare(`SELECT COUNT(*) c FROM profiles ${w}`).get(...args).c;
  const rows = db.prepare(`SELECT * FROM profiles ${w} ORDER BY ${orderBy} LIMIT ? OFFSET ?`).all(...args, lim, off);
  return { total, profiles: rows.map(hydrate) };
}

export function getProfile(slug) {
  return hydrate(db.prepare('SELECT * FROM profiles WHERE slug = ?').get(normalizeSlug(slug)));
}

export function updateProfile(slug, patch) {
  slug = normalizeSlug(slug);
  if (!getProfile(slug)) return null;
  if (typeof patch.notes === 'string') db.prepare('UPDATE profiles SET notes=? WHERE slug=?').run(patch.notes.slice(0, 20000), slug);
  if (typeof patch.status === 'string') db.prepare('UPDATE profiles SET status=? WHERE slug=?').run(patch.status.slice(0, 40), slug);
  if (Array.isArray(patch.tags)) db.prepare('UPDATE profiles SET tags=? WHERE slug=?').run(JSON.stringify(patch.tags.map(t => String(t).slice(0, 40)).slice(0, 30)), slug);
  return getProfile(slug);
}

export function deleteProfile(slug) {
  return db.prepare('DELETE FROM profiles WHERE slug = ?').run(normalizeSlug(slug)).changes > 0;
}

/** Parmi ces slugs, ceux dont la page profil complète a déjà été capturée (inutile de les rouvrir). */
export function completeSlugs(slugs) {
  const list = [...new Set(slugs.map(normalizeSlug).filter(Boolean))].slice(0, 1000);
  if (!list.length) return [];
  const q = list.map(() => '?').join(',');
  return db.prepare(`SELECT slug FROM profiles WHERE slug IN (${q}) AND sources LIKE '%"profile"%'`).all(...list).map(r => r.slug);
}

export function stats() {
  const one = (sql) => db.prepare(sql).get();
  return {
    total: one('SELECT COUNT(*) c FROM profiles').c,
    with_email: one("SELECT COUNT(*) c FROM profiles WHERE email != ''").c,
    with_phone: one("SELECT COUNT(*) c FROM profiles WHERE phone != ''").c,
    seen_today: one("SELECT COUNT(*) c FROM profiles WHERE last_seen >= date('now')").c,
    by_status: db.prepare('SELECT status, COUNT(*) c FROM profiles GROUP BY status ORDER BY c DESC').all(),
  };
}

export function toCsv() {
  const cols = ['slug', 'name', 'headline', 'company', 'location', 'email', 'phone', 'url', 'status', 'tags', 'notes', 'first_seen', 'last_seen', 'seen_count'];
  // Neutralise l'injection de formules quand le CSV est ouvert dans Excel / Sheets
  const esc = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = listProfiles({ limit: 500, sort: 'name' });
  const all = [];
  for (let off = 0; off < rows.total; off += 500) all.push(...listProfiles({ limit: 500, offset: off, sort: 'name' }).profiles);
  return [cols.join(','), ...all.map(p => cols.map(c => esc(c === 'tags' ? p.tags.join(';') : p[c])).join(','))].join('\n');
}
