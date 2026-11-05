// Serveur local : reçoit les profils de l'extension, expose une API + une petite interface web.
// Écoute uniquement sur 127.0.0.1 et exige un token pour tout (même pour l'interface).
import http from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATA_DIR, upsertProfile, listProfiles, getProfile, updateProfile, deleteProfile, stats, toCsv } from './db.js';

const here = dirname(fileURLToPath(import.meta.url));
const PORT = +process.env.PORT || 4317;
const HOST = '127.0.0.1';

const tokenFile = resolve(DATA_DIR, 'token');
if (!existsSync(tokenFile)) writeFileSync(tokenFile, randomBytes(24).toString('hex'), { mode: 0o600 });
const TOKEN = readFileSync(tokenFile, 'utf8').trim();

const sameToken = (t) => {
  const a = Buffer.from(String(t || '')), b = Buffer.from(TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
};

const send = (res, code, body, type = 'application/json; charset=utf-8') => {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
};

const readBody = (req, max = 5_000_000) => new Promise((ok, ko) => {
  let size = 0; const chunks = [];
  req.on('data', (c) => { size += c.length; if (size > max) { ko(new Error('too large')); req.destroy(); } else chunks.push(c); });
  req.on('end', () => { try { ok(chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}); } catch (e) { ko(e); } });
  req.on('error', ko);
});

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${HOST}`);
    // Protection DNS-rebinding : on n'accepte que les Host locaux
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host || '')) return send(res, 403, { error: 'bad host' });

    if (url.pathname === '/' && req.method === 'GET') {
      return send(res, 200, readFileSync(resolve(here, 'ui.html'), 'utf8'), 'text/html; charset=utf-8');
    }
    if (!url.pathname.startsWith('/api/')) return send(res, 404, { error: 'not found' });
    if (!sameToken(req.headers['x-token'] || url.searchParams.get('token'))) return send(res, 401, { error: 'unauthorized' });

    const p = url.pathname;
    if (p === '/api/ping') return send(res, 200, { ok: true });
    if (p === '/api/stats') return send(res, 200, stats());

    if (p === '/api/ingest' && req.method === 'POST') {
      const body = await readBody(req);
      const items = Array.isArray(body.profiles) ? body.profiles.slice(0, 200) : [];
      let created = 0, updated = 0;
      for (const it of items) {
        const r = upsertProfile(it);
        if (r) r.created ? created++ : updated++;
      }
      return send(res, 200, { created, updated });
    }

    if (p === '/api/export.csv') {
      res.writeHead(200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="linkedin-profiles.csv"' });
      return res.end('﻿' + toCsv());
    }

    if (p === '/api/profiles' && req.method === 'GET') {
      const g = (k) => url.searchParams.get(k) || '';
      return send(res, 200, listProfiles({
        q: g('q'), status: g('status'), hasEmail: g('has_email') === '1', hasPhone: g('has_phone') === '1',
        limit: g('limit'), offset: g('offset'), sort: g('sort'),
      }));
    }

    const m = p.match(/^\/api\/profiles\/([^/]+)$/);
    if (m) {
      const slug = decodeURIComponent(m[1]);
      if (req.method === 'GET') { const r = getProfile(slug); return r ? send(res, 200, r) : send(res, 404, { error: 'not found' }); }
      if (req.method === 'PATCH') { const r = updateProfile(slug, await readBody(req)); return r ? send(res, 200, r) : send(res, 404, { error: 'not found' }); }
      if (req.method === 'DELETE') return send(res, deleteProfile(slug) ? 200 : 404, { ok: true });
    }
    send(res, 404, { error: 'not found' });
  } catch (e) {
    send(res, 400, { error: String(e.message || e) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`LinkedIn CRM local prêt : http://${HOST}:${PORT}/#token=${TOKEN}`);
  console.log(`Token (à coller dans l'extension) : ${TOKEN}`);
  console.log(`Base de données : ${resolve(DATA_DIR, 'profiles.db')}`);
});
