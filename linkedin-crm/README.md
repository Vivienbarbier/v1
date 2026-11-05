# LinkedIn Local CRM

Une extension Chrome qui enregistre, dans une base SQLite sur votre ordinateur, chaque profil LinkedIn que vous affichez. Un petit serveur local expose cette base à une interface web, à une API et à Claude (via MCP).

```
Chrome (LinkedIn)  →  extension  →  serveur local 127.0.0.1:4317  →  data/profiles.db
                                          ├─ interface web (recherche, statuts, notes, export CSV)
                                          └─ serveur MCP → Claude
```

L'extension est **passive** : elle lit la page que vous regardez, sans cliquer, sans défiler et sans envoyer de requête à LinkedIn. Rien ne quitte votre machine.

## Ce qui est capturé

| Page visitée | Données |
|---|---|
| Profil (`/in/xxx`) | nom, titre, lieu, à propos, 10 dernières expériences |
| Fenêtre « Coordonnées » du profil | email, téléphone, sites web, date de connexion (seulement si vous l'ouvrez) |
| Recherche, mes relations, suggestions, feed | une fiche par personne visible : nom, titre, lieu, degré |

Si vous revoyez une personne, la fiche est complétée. Une valeur vide n'écrase jamais une valeur déjà connue, et le compteur de passages augmente.
Les statuts, tags et notes que vous ajoutez ne sont jamais écrasés.

## Installation

Prérequis : Node.js ≥ 22.13 (SQLite est intégré, aucun `npm install`).

1. **Serveur** :
   ```bash
   cd linkedin-crm && npm start
   ```
   Il affiche l'URL de l'interface et un **token**. La base est créée dans `linkedin-crm/data/`.
2. **Extension** : `chrome://extensions` → activer le mode développeur → *Charger l'extension non empaquetée* → dossier `linkedin-crm/extension`.
3. Cliquez sur l'icône de l'extension, collez le token, *Enregistrer*.
4. Naviguez sur LinkedIn. Ouvrez l'interface avec le bouton *Ouvrir ma base*.

Si le serveur est éteint, l'extension met les fiches en file d'attente (1000 max) et les renvoie dès qu'il redémarre. Un badge rouge sur l'icône signale le problème.

## Utilisation avec Claude

**Claude Code** :
```bash
claude mcp add linkedin-crm -- node --disable-warning=ExperimentalWarning /chemin/vers/linkedin-crm/server/mcp.js
```

**Claude Desktop** (`claude_desktop_config.json`) :
```json
{ "mcpServers": { "linkedin-crm": { "command": "node", "args": ["--disable-warning=ExperimentalWarning", "/chemin/vers/linkedin-crm/server/mcp.js"] } } }
```

Outils exposés : `search_profiles`, `get_profile`, `update_profile` (statut, tags, notes), `stats`.
Exemple : « Parmi les gens que j'ai vus, liste les responsables maintenance à Lyon avec un email, et prépare un message d'approche pour chacun. »

Le MCP lit directement `data/profiles.db`. Le serveur web n'a pas besoin d'être lancé pour que Claude y accède.

## API (token requis dans l'en-tête `x-token`)

`GET /api/profiles?q=&status=&has_email=1&has_phone=1&sort=&limit=&offset=` · `GET|PATCH|DELETE /api/profiles/:slug` · `GET /api/export.csv` · `GET /api/stats` · `POST /api/ingest`

## Sécurité

- Le serveur n'écoute que sur `127.0.0.1`, vérifie l'en-tête `Host` (anti DNS-rebinding) et exige le token sur toutes les routes `/api`. Le token est stocké dans `data/token`.
- L'extension n'envoie des données qu'à l'adresse du serveur configurée.
- L'export CSV neutralise les formules (`=`, `+`, `-`, `@`) pour éviter les injections dans Excel ou Sheets.

## Limites à connaître

- **LinkedIn change son HTML régulièrement.** L'extraction s'appuie sur le texte visible et sur les liens `/in/…` avec des sélecteurs de repli, mais elle peut dériver. Quand un champ est mal rempli, ajustez `parseProfilePage` ou `parseCards` dans `extension/content.js`. Les tests ont été faits sur des pages simulées, pas sur LinkedIn en direct.
- **Conditions d'utilisation de LinkedIn.** Elles interdisent la collecte automatisée de données, même passive, et LinkedIn peut restreindre un compte qui en fait un usage visible. Cet outil ne déclenche aucune action pour limiter le risque, mais il n'est pas nul.
- **RGPD.** Vous constituez un fichier de prospects. En B2B, l'intérêt légitime est possible, à condition d'informer les personnes lors du premier contact et de supprimer une fiche sur demande (bouton *Supprimer* ou `DELETE /api/profiles/:slug`).
