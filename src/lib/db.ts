import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data.db");
const db = new Database(dbPath);

// Activer WAL mode pour les performances

db.pragma("journal_mode = WAL");

// Créer les tables

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cvs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    format TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS lettres (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    offre TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS entretiens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    poste TEXT NOT NULL,
    historique TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS job_offers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT DEFAULT 'Télétravail',
    url TEXT,
    source TEXT,
    salary TEXT,
    tags TEXT,
    posted_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    skills TEXT,
    sectors TEXT,
    target_countries TEXT,
    min_salary TEXT,
    experience_level TEXT,
    languages TEXT,
    availability TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    score REAL DEFAULT 0,
    saved INTEGER DEFAULT 0,
    applied INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES job_offers(id)
  );

  CREATE INDEX IF NOT EXISTS idx_job_offers_created ON job_offers(created_at);
  CREATE INDEX IF NOT EXISTS idx_user_jobs_user ON user_jobs(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_jobs_job ON user_jobs(job_id);

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'whatsapp',
    message TEXT NOT NULL,
    job_id TEXT,
    status TEXT DEFAULT 'pending',
    sent_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES job_offers(id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_reports_job ON reports(job_id);
  CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
  
  CREATE TABLE IF NOT EXISTS passports (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'francais',
    level TEXT,
    score INTEGER,
    questions_asked TEXT,
    answers_given TEXT,
    status TEXT DEFAULT 'pending',
    completed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_passports_user ON passports(user_id);
`);

// Ajouter les colonnes additionnelles
try { db.exec("ALTER TABLE users ADD COLUMN phone TEXT"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN stripe_customer_id TEXT"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'inactive'"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN subscription_end TEXT"); } catch {}
try { db.exec("ALTER TABLE user_preferences ADD COLUMN whatsapp_optin INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN referral_code TEXT"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN referred_by TEXT"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN referral_credits INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN free_until TEXT"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN passport_status TEXT DEFAULT 'none'"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN passport_level TEXT"); } catch {}
try { db.exec("ALTER TABLE job_offers ADD COLUMN verified INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE job_offers ADD COLUMN fraud_score INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE job_offers ADD COLUMN reports_count INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE job_offers ADD COLUMN hidden INTEGER DEFAULT 0"); } catch {}

export default db;