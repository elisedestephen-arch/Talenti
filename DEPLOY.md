# 🚀 Déploiement de TalentAfrique IA

## Choix d'hébergement

TalentAfrique utilise **SQLite** comme base de données. Cela fonctionne bien sur un serveur classique (VPS) mais **pas sur Vercel** (sans adaptation).

### Option A (recommandée) : Railway — €5/mois

Railway héberge l'app complète avec stockage persistant. SQLite fonctionne parfaitement.

**Étapes :**
1. Crée un compte sur [railway.app](https://railway.app) (GitHub login)
2. Installe GitHub CLI ou pousse le code sur GitHub
3. Sur Railway, clique "New Project" → "Deploy from GitHub repo"
4. Sélectionne `talentafrique-ia`
5. Va dans l'onglet **Variables** et ajoute :
   - `OPENAI_API_KEY` = ta clé OpenAI
   - `JWT_SECRET` = une chaîne secrète longue
   - `WHATSAPP_API_KEY` = ton token Meta (optionnel pour commencer)
   - `WHATSAPP_PHONE_ID` = ton Phone ID (optionnel pour commencer)
6. Railway build et déploie automatiquement
7. Ton site est accessible sur `talentafrique-ia.up.railway.app`

### Option B : VPS (DigitalOcean / Hetzner) — €4-6/mois

Un petit VPS avec Ubuntu 22.04.

**Étapes :**
```bash
# 1. Se connecter au VPS
ssh root@ton-serveur

# 2. Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# 3. Cloner le projet
git clone https://github.com/ton-compte/talentafrique-ia.git
cd talentafrique-ia

# 4. Installer et build
npm install
npm run build

# 5. Créer le fichier .env avec tes clés
nano .env

# 6. Installer PM2 (gestionnaire de processus)
npm install -g pm2
pm2 start npm --name "talentafrique" -- start
pm2 save
pm2 startup
```

### Option C : Vercel + Turso (gratuit)

Si tu veux Vercel, il faut remplacer SQLite par Turso (SQLite compatible cloud).

**Adaptation nécessaire :**
1. Crée un compte sur [turso.tech](https://turso.tech)
2. Remplace `better-sqlite3` par `@libsql/client`
3. Modifie `src/lib/db.ts` pour utiliser Turso
4. Déploie sur Vercel avec `vercel --prod`

---

## Nom de domaine (optionnel)

Une fois déployé, tu peux ajouter un nom de domaine :
- **Railway** : Settings → Domains → Custom Domain
- **Vercel** : Domains → Add
- **VPS** : Configure Nginx + Cloudflare

Exemples : `talentafrique.com` ou `talentafrique.africa`

---

## Configuration minimale pour tester

Avant le déploiement, configure au moins :
```env
OPENAI_API_KEY=ta-cle-openai
JWT_SECRET=un-secret-tres-long-aleatoire
```

Les notifications WhatsApp peuvent attendre (le site fonctionne sans).

---

## Vérifier que tout marche

```bash
# En local
npm install
npm run dev
# → http://localhost:3000

# Test API
curl http://localhost:3000/api/auth/register -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'
```