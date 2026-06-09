import { v4 as uuidv4 } from "uuid";
import db from "./db";

/**
 * Service d'envoi de notifications WhatsApp
 * Utilise l'API WhatsApp Business Cloud (Meta) ou Twilio
 * 
 * Configuration requise dans .env :
 * - WHATSAPP_API_KEY (Token d'accès API Meta)
 * - WHATSAPP_PHONE_ID (ID du numéro de téléphone WhatsApp Business)
 * - WHATSAPP_FROM (Numéro WhatsApp Business, format international)
 */

const WHATSAPP_API_URL =
  "https://graph.facebook.com/v22.0";

export interface NotificationJob {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  score: number;
  url: string;
  userName: string;
  phone: string;
  skills: string;
}

/**
 * Envoie un message WhatsApp via l'API Meta
 */
export async function sendWhatsApp(
  to: string,
  message: string
): Promise<boolean> {
  const apiKey = process.env.WHATSAPP_API_KEY;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!apiKey || !phoneId) {
    console.warn("⚠️ WhatsApp non configuré. Définissez WHATSAPP_API_KEY et WHATSAPP_PHONE_ID dans .env");
    return false;
  }

  try {
    // Format du numéro : supprimer les espaces, ajouter le code pays si besoin
    const cleanNumber = to.replace(/[\s\-\(\)]/g, "");
    const formattedNumber = cleanNumber.startsWith("+") ? cleanNumber : `+${cleanNumber}`;

    const res = await fetch(`${WHATSAPP_API_URL}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedNumber,
        type: "text",
        text: { body: message },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Erreur WhatsApp:", text);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur envoi WhatsApp:", error);
    return false;
  }
}

/**
 * Crée une notification d'offre d'emploi et l'envoie par WhatsApp
 */
export async function notifyJobMatch(job: NotificationJob): Promise<boolean> {
  const message = formatJobMessage(job);
  const notifId = uuidv4();

  // Sauvegarder la notification dans la DB
  db.prepare(
    "INSERT INTO notifications (id, user_id, type, message, job_id, status) VALUES (?, ?, 'whatsapp', ?, ?, 'pending')"
  ).run(notifId, job.userId, message, job.jobId);

  // Envoyer par WhatsApp
  const sent = await sendWhatsApp(job.phone, message);

  // Mettre à jour le statut
  db.prepare(
    "UPDATE notifications SET status = ?, sent_at = datetime('now') WHERE id = ?"
  ).run(sent ? "sent" : "failed", notifId);

  return sent;
}

/**
 * Formate le message WhatsApp pour une offre d'emploi
 */
function formatJobMessage(job: NotificationJob): string {
  return `🎯 *TalentAfrique IA* — Nouvelle opportunité pour vous !

Bonjour ${job.userName},

Nous avons trouvé une offre qui correspond à votre profil :

📌 *${job.jobTitle}*
🏢 ${job.company}
🔗 ${job.url}

Score de correspondance : ${Math.round(job.score)}%

👉 Postulez maintenant sur TalentAfrique IA pour maximiser vos chances avec un CV et une lettre personnalisés.

—
Vous recevez cette alerte car vous êtes inscrit sur TalentAfrique IA. Pour vous désabonner, désactivez les alertes WhatsApp dans votre profil.`;
}

/**
 * Trouve les nouveaux matchs pour un utilisateur et envoie des notifications
 */
export async function processUserNotifications(userId: string): Promise<number> {
  const user = db.prepare(
    "SELECT u.id, u.name, u.phone, p.skills, p.whatsapp_optin FROM users u LEFT JOIN user_preferences p ON u.id = p.user_id WHERE u.id = ?"
  ).get(userId) as any;

  // Vérifier que l'utilisateur a un téléphone et a activé WhatsApp
  if (!user?.phone || !user?.whatsapp_optin) {
    return 0;
  }

  // Récupérer les offres non encore notifiées
  const newJobs = db.prepare(
    `SELECT j.id, j.title, j.company, j.url, uj.score
     FROM job_offers j
     JOIN user_jobs uj ON j.id = uj.job_id
     WHERE uj.user_id = ? AND uj.score > 0
     AND j.id NOT IN (SELECT job_id FROM notifications WHERE user_id = ? AND job_id IS NOT NULL)
     ORDER BY uj.score DESC
     LIMIT 5`
  ).all(userId, userId) as any[];

  if (newJobs.length === 0) return 0;

  let sent = 0;
  for (const job of newJobs) {
    const ok = await notifyJobMatch({
      id: uuidv4(),
      userId,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      score: job.score,
      url: job.url || "",
      userName: user.name,
      phone: user.phone,
      skills: user.skills || "",
    });
    if (ok) sent++;
  }

  return sent;
}

/**
 * Récupère l'historique des notifications d'un utilisateur
 */
export function getUserNotifications(userId: string, limit: number = 20): any[] {
  return db.prepare(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
  ).all(userId, limit) as any[];
}