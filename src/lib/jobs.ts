import { v4 as uuidv4 } from "uuid";
import db from "./db";
import { verifyJobOffer } from "./openai";

const RSS_FEEDS = [
  "https://remoteok.com/remote-jobs.rss",
  "https://weworkremotely.com/remote-jobs.rss",
  "https://remotive.com/feed/",
];

interface RawJob {
  title: string;
  company: string;
  description: string;
  url: string;
  salary?: string;
  tags?: string;
  posted_at?: string;
}

/**
 * Collecte les offres depuis les flux RSS
 * Version simplifiée — utilise le parsing XML basique
 */
export async function collectJobs(): Promise<number> {
  let count = 0;

  for (const feedUrl of RSS_FEEDS) {
    try {
      const jobs = await fetchFeed(feedUrl);
      for (const job of jobs) {
        const existing = db
          .prepare("SELECT id FROM job_offers WHERE url = ?")
          .get(job.url) as any;

        if (!existing) {
          const id = uuidv4();
          db.prepare(
            `INSERT INTO job_offers (id, title, company, description, url, source, salary, tags, posted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).run(
            id,
            job.title,
            job.company,
            job.description.substring(0, 2000),
            job.url,
            feedUrl,
            job.salary || null,
            job.tags || null,
            job.posted_at || new Date().toISOString()
          );
          count++;

          // Vérification IA de l'offre (asynchrone, ne bloque pas la collecte)
          verifyJobOffer({
            title: job.title,
            company: job.company,
            description: job.description.substring(0, 2000),
          }).then((result) => {
            db.prepare(`
              UPDATE job_offers 
              SET verified = ?, fraud_score = ?, updated_at = datetime('now')
              WHERE id = ?
            `).run(result.verified ? 1 : 0, result.fraudScore, id);
          }).catch((err) => {
            console.error(`Erreur vérification offre ${id}:`, err);
          });
        }
      }
    } catch (e) {
      console.error(`Erreur feed ${feedUrl}:`, e);
    }
  }

  return count;
}

async function fetchFeed(url: string): Promise<RawJob[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TalentAfriqueBot/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    const xml = await res.text();

    // Parsing RSS simple
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    return items.map((item) => ({
      title: extractXml(item, "title"),
      company: extractXml(item, "dc:creator") || extractXml(item, "company") || extractXml(item, "author") || "Entreprise",
      description: extractXml(item, "description"),
      url: extractXml(item, "link"),
      salary: extractXml(item, "salary") || extractXml(item, "remotive:salary"),
      tags: extractXml(item, "category"),
      posted_at: extractXml(item, "pubDate"),
    }));
  } catch {
    return [];
  }
}

function extractXml(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "is"));
  return match ? match[1].trim().replace(/<[^>]+>/g, "").replace(/&[^;]+;/g, " ") : "";
}

/**
 * Calcule un score de matching entre une offre et un profil utilisateur
 */
export function matchJobToUser(
  job: { title: string; description: string; tags?: string },
  prefs: { skills?: string; sectors?: string; target_countries?: string; languages?: string }
): number {
  let score = 0;
  const text = `${job.title} ${job.description} ${job.tags || ""}`.toLowerCase();

  // Compétences
  if (prefs.skills) {
    const skills = prefs.skills.split(",").map((s) => s.trim().toLowerCase());
    for (const skill of skills) {
      if (text.includes(skill)) score += 5;
    }
  }

  // Secteurs
  if (prefs.sectors) {
    const sectors = prefs.sectors.split(",").map((s) => s.trim().toLowerCase());
    for (const sector of sectors) {
      if (text.includes(sector)) score += 3;
    }
  }

  // Pays cibles / langues -> on regarde si le nom du pays est mentionné
  if (prefs.target_countries) {
    const countries = prefs.target_countries.split(",").map((c) => c.trim().toLowerCase());
    for (const country of countries) {
      if (text.includes(country)) score += 2;
    }
  }

  // Langues
  if (prefs.languages) {
    const langs = prefs.languages.split(",").map((l) => l.trim().toLowerCase());
    for (const lang of langs) {
      if (text.includes(lang)) score += 2;
    }
  }

  return score;
}

/**
 * Trouve les meilleures offres pour un utilisateur et les associe
 */
export function matchUserJobs(userId: string, limit: number = 15): any[] {
  const prefs = db
    .prepare("SELECT * FROM user_preferences WHERE user_id = ?")
    .get(userId) as any;

  if (!prefs) return [];

  // Récupérer les offres récentes
  const jobs = db
    .prepare(
      `SELECT * FROM job_offers
       WHERE id NOT IN (SELECT job_id FROM user_jobs WHERE user_id = ?)
       ORDER BY created_at DESC
       LIMIT 100`
    )
    .all(userId) as any[];

  // Calculer les scores et trier
  const scored = jobs.map((job) => ({
    ...job,
    score: matchJobToUser(job, prefs),
  }));

  scored.sort((a: any, b: any) => b.score - a.score);

  // Prendre les meilleures
  const top = scored.slice(0, limit);

  // Sauvegarder les associations
  for (const job of top) {
    const id = uuidv4();
    db.prepare(
      "INSERT OR IGNORE INTO user_jobs (id, user_id, job_id, score) VALUES (?, ?, ?, ?)"
    ).run(id, userId, job.id, job.score);
  }

  return top;
}

/**
 * Récupère les offres recommandées pour un utilisateur
 */
export function getUserJobs(userId: string, limit: number = 15): any[] {
  return db
    .prepare(
      `SELECT j.*, uj.score, uj.saved, uj.applied
       FROM job_offers j
       JOIN user_jobs uj ON j.id = uj.job_id
       WHERE uj.user_id = ?
       ORDER BY uj.score DESC, j.created_at DESC
       LIMIT ?`
    )
    .all(userId, limit) as any[];
}

/**
 * Récupère les offres récentes (pour les utilisateurs sans préférences)
 */
export function getRecentJobs(limit: number = 20): any[] {
  return db
    .prepare(
      `SELECT * FROM job_offers
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .all(limit) as any[];
}
