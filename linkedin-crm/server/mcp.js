#!/usr/bin/env node
// Serveur MCP (stdio) minimal : donne à Claude (Claude Code / Claude Desktop) un accès à la base locale.
// Aucune dépendance : JSON-RPC 2.0 délimité par des retours à la ligne.
import { createInterface } from 'node:readline';
import { listProfiles, getProfile, updateProfile, stats } from './db.js';

const TOOLS = [
  {
    name: 'search_profiles',
    description: "Cherche dans les profils LinkedIn vus par l'utilisateur (nom, poste, entreprise, lieu, notes, tags). Plusieurs mots = tous doivent matcher.",
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Mots-clés (ex: "directeur maintenance lyon")' },
        status: { type: 'string', description: 'Filtre de statut (nouveau, à contacter, contacté, répondu, ignoré…)' },
        has_email: { type: 'boolean' },
        has_phone: { type: 'boolean' },
        limit: { type: 'number', description: 'Défaut 20, max 100' },
        offset: { type: 'number' },
        sort: { type: 'string', enum: ['last_seen', 'first_seen', 'name', 'seen_count'] },
      },
    },
  },
  {
    name: 'get_profile',
    description: "Fiche complète d'un profil (expériences, à propos, email, téléphone, notes) à partir de son slug LinkedIn.",
    inputSchema: { type: 'object', properties: { slug: { type: 'string' } }, required: ['slug'] },
  },
  {
    name: 'update_profile',
    description: "Met à jour le statut, les tags ou les notes d'un profil. Les notes remplacent les précédentes : lire la fiche avant pour les compléter.",
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string' }, status: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' } },
      required: ['slug'],
    },
  },
  { name: 'stats', description: 'Statistiques globales de la base (total, avec email/téléphone, par statut).', inputSchema: { type: 'object', properties: {} } },
];

// Version compacte pour les listes (évite d'inonder le contexte du modèle)
const brief = (p) => ({
  slug: p.slug, name: p.name, headline: p.headline, company: p.company, location: p.location,
  email: p.email, phone: p.phone, status: p.status, tags: p.tags, last_seen: p.last_seen, url: p.url,
});

function call(name, a = {}) {
  switch (name) {
    case 'search_profiles': {
      const r = listProfiles({ q: a.query, status: a.status, hasEmail: a.has_email, hasPhone: a.has_phone, limit: Math.min(a.limit || 20, 100), offset: a.offset, sort: a.sort });
      return { total: r.total, returned: r.profiles.length, profiles: r.profiles.map(brief) };
    }
    case 'get_profile': return getProfile(a.slug) || { error: 'profil introuvable' };
    case 'update_profile': return updateProfile(a.slug, a) || { error: 'profil introuvable' };
    case 'stats': return stats();
    default: throw new Error('outil inconnu : ' + name);
  }
}

const out = (m) => process.stdout.write(JSON.stringify(m) + '\n');
createInterface({ input: process.stdin }).on('line', (line) => {
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  const { id, method, params } = msg;
  if (id === undefined) return; // notification (ex: notifications/initialized)
  try {
    if (method === 'initialize') {
      out({ jsonrpc: '2.0', id, result: { protocolVersion: params?.protocolVersion || '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'linkedin-crm', version: '0.1.0' } } });
    } else if (method === 'tools/list') {
      out({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
    } else if (method === 'tools/call') {
      try {
        const r = call(params.name, params.arguments);
        out({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(r, null, 2) }] } });
      } catch (e) {
        out({ jsonrpc: '2.0', id, result: { isError: true, content: [{ type: 'text', text: String(e.message || e) }] } });
      }
    } else if (method === 'ping') {
      out({ jsonrpc: '2.0', id, result: {} });
    } else {
      out({ jsonrpc: '2.0', id, error: { code: -32601, message: 'method not found' } });
    }
  } catch (e) {
    out({ jsonrpc: '2.0', id, error: { code: -32603, message: String(e.message || e) } });
  }
});
