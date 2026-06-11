# 🚀 Déploiement de TalentAfrique IA

## Déploiement Railway (recommandé)

### Prérequis
1. Compte [Railway.app](https://railway.app) (via GitHub)
2. Repo GitHub avec le code

### Étapes de déploiement

1. **Poussez le code sur GitHub**
   ```bash
   git push origin main
   ```

2. **Créez le projet Railway**
   - Allez sur [railway.app/dashboard](https://railway.app/dashboard)
   - Cliquez "New Project" → "Deploy from GitHub repo"
   - Sélectionnez le dépôt Talenti

3. **Ajoutez les variables d'environnement** (onglet Variables) :
   | Variable | Requis | Description |
   |----------|--------|-------------|
   | `JWT_SECRET` | ✅ | Secret JWT (générez avec `openssl rand -hex 32`) |
   | `OPENAI_API_KEY` | ✅ | Clé API OpenAI |
   | `NEXT_PUBLIC_URL` | ✅ | URL de l'app (ex: `https://talenti.up.railway.app`) |
   | `STRIPE_SECRET_KEY` | ❌ | Pour les abonnements Stripe |
   | `STRIPE_WEBHOOK_SECRET` | ❌ | Webhook Stripe |
   | `WHATSAPP_API_KEY` | ❌ | Pour les notifications WhatsApp |
   | `WHATSAPP_PHONE_ID` | ❌ | ID téléphone WhatsApp |

4. **Railway build et déploie automatiquement**
   - Le build utilise `NODE_OPTIONS=--max-old-space-size=1024` pour éviter les OOM
   - `better-sqlite3` est compilé via Nixpacks (build-essential automatique)

5. **Votre site est en ligne** sur `https://talenti.up.railway.app`

### Résolution des problèmes Railway

#### ❌ Build échoue (OOM / SIGBUS)
```bash
# Dans railway.json, le build utilise build:railway qui limite la mémoire
# Si le build échoue encore, réduisez à 768MB :
NODE_OPTIONS=--max-old-space-size=768
```

#### ❌ better-sqlite3 ne compile pas
- Vérifiez que `nixpacks.toml` est présent à la racine
- Railway installe automatiquement python3, gcc, g++, make via Nixpacks
- La commande `postinstall` rebuild better-sqlite3 automatiquement

#### ❌ Healthcheck échoue
- Le healthcheck timeout est configuré à 120s dans railway.json
- Si votre app met plus de temps à démarrer, augmentez cette valeur

#### ❌ Port non trouvé
- Railway définit automatiquement `PORT` et Next.js l'écoute
- Vérifiez que votre app écoute sur `0.0.0.0` (pas localhost)

### Structure des fichiers de déploiement

```
├── railway.json          # Configuration Railway
├── nixpacks.toml         # Outils de compilation (better-sqlite3)
├── next.config.ts        # Configuration Next.js
└── DEPLOY.md             # Ce fichier
```

---

## Installation locale (développement)

```bash
# 1. Cloner
git clone https://github.com/elisedestephen-arch/Talenti.git
cd Talenti

# 2. Variables d'environnement
cp .env.example .env
# Éditez .env avec vos clés (au moins JWT_SECRET et OPENAI_API_KEY)

# 3. Installer et lancer
npm install
npm run dev
# → http://localhost:3000

# 4. Build production
npm run build
npm start
```

---

## Déploiement VPS alternatif

```bash
# 1. VPS avec Ubuntu 22.04 (DigitalOcean / Hetzner)
ssh root@ton-serveur

# 2. Installer Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs build-essential python3

# 3. Cloner et déployer
git clone https://github.com/elisedestephen-arch/Talenti.git
cd Talenti
cp .env.example .env
nano .env  # Configurez vos clés
npm install
npm run build

# 4. Lancer avec PM2
npm install -g pm2
pm2 start npm --name "talenti" -- start
pm2 save
pm2 startup
```