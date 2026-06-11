import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function generateCV(data: {
  name: string;
  studies: string;
  experience: string;
  languages: string;
  skills: string;
  format: "moderne" | "europeen" | "canadien";
}): Promise<string> {
  const prompt = `Tu es un expert en recrutement et en rédaction de CV.

Génère un CV professionnel au format ${data.format} pour :

Nom : ${data.name}
Études : ${data.studies}
Expérience : ${data.experience}
Langues : ${data.languages}
Compétences : ${data.skills}

Rédige un CV structuré, moderne et professionnel en français, prêt à être exporté.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "Erreur lors de la génération du CV.";
}

export async function generateLettre(offre: string): Promise<string> {
  const prompt = `Tu es un expert en candidature professionnelle.

Voici une offre d'emploi :
${offre}

Rédige une lettre de motivation personnalisée, convaincante et professionnelle en français. Adapte-la à l'offre et mets en valeur les compétences du candidat.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "Erreur lors de la génération de la lettre.";
}

export async function simulateEntretien(poste: string, historique: string[] = []): Promise<{ question: string }> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Tu es un recruteur professionnel spécialisé dans le recrutement pour le poste de ${poste}. 
Pose des questions pertinentes pour évaluer le candidat. Sois exigeant mais constructif.
Après chaque réponse du candidat, donne un retour et pose la question suivante.`,
    },
  ];

  for (const msg of historique) {
    messages.push({ role: "assistant" as const, content: msg });
  }

  if (messages.length === 1) {
    messages.push({
      role: "user",
      content: `Commence l'entretien pour le poste de ${poste}. Pose la première question.`,
    });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
  });

  return { question: response.choices[0]?.message?.content || "Erreur lors de la simulation." };
}

export async function translateDocument(
  content: string,
  targetLang: string
): Promise<string> {
  const prompt = `Traduis le texte suivant en ${targetLang}. Garde le format professionnel :

${content}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || "Erreur lors de la traduction.";
}

/**
 * Analyse une offre d'emploi pour détecter les signes d'arnaque
 * Retourne un score de fiabilité (0-100) et les raisons
 */
export async function verifyJobOffer(offer: {
  title: string;
  company: string;
  description: string;
}): Promise<{ verified: boolean; fraudScore: number; reasons: string[] }> {
  const prompt = `Tu es un expert en détection d'arnaques à l'emploi. Analyse cette offre et détecte les drapeaux rouges.

Offre :
Titre : ${offer.title}
Entreprise : ${offer.company}
Description : ${offer.description}

Drapeaux rouges à chercher :
- Demande de paiement ou d'investissement
- Email ou site suspect (Gmail, Yahoo, etc. pour une entreprise)
- Promesses de salaire irréaliste
- Fautes d'orthographe nombreuses
- Manque de détails sur le poste
- Demande d'informations personnelles bancaires
- "Nul besoin d'expérience" avec salaire très élevé
- Offre trop belle pour être vraie

Réponds UNIQUEMENT au format JSON :
{"verified": true/false, "fraudScore": 0-100, "reasons": ["raison1", "raison2"]}
Où fraudScore = 0 (totalement fiable) à 100 (arnaque certaine).`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch {
    return { verified: false, fraudScore: 50, reasons: ["Erreur d'analyse"] };
  }
}

/**
 * Évalue le niveau de français d'un candidat pour le Talenti Passport
 */
export async function assessFrenchLevel(
  answers: { question: string; answer: string }[]
): Promise<{ level: string; score: number; feedback: string }> {
  const conversation = answers
    .map((a) => `Q: ${a.question}\nR: ${a.answer}`)
    .join("\n\n");

  const prompt = `Tu es un examinateur de français langue étrangère (FLE). Évalue le niveau du candidat basé sur ses réponses.

Conversation :
${conversation}

Évalue sur :
- Grammaire et conjugaison
- Vocabulaire et expressions
- Compréhension et cohérence
- Aisance et naturel

Niveaux possibles : A1, A2, B1, B2, C1, C2
Score sur 100.

Réponds UNIQUEMENT au format JSON :
{"level": "B1", "score": 65, "feedback": "Commentaire constructif en français..."}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch {
    return { level: "A1", score: 0, feedback: "Erreur d'évaluation" };
  }
}

/**
 * Évalue les compétences et niveaux de langue d'un candidat pour le Talenti Passport
 */
export async function assessPassport(
  skills: string,
  french_level: string,
  english_level: string
): Promise<{
  french_level: string;
  english_level: string;
  skills_verified: string;
  overall_score: number;
  feedback: string;
}> {
  const prompt = `Tu es un expert en évaluation de compétences professionnelles et linguistiques.

Évalue le profil suivant pour le Talenti Passport :
- Compétences déclarées : ${skills}
- Niveau de français déclaré : ${french_level}
- Niveau d'anglais déclaré : ${english_level}

Attribue un score global sur 100 et valide les compétences.

Réponds UNIQUEMENT au format JSON :
{
  "french_level": "niveau validé (A1/A2/B1/B2/C1/C2)",
  "english_level": "niveau validé (A1/A2/B1/B2/C1/C2)",
  "skills_verified": "liste des compétences validées séparées par des virgules",
  "overall_score": 75,
  "feedback": "Commentaire constructif en français sur le profil du candidat..."
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch {
    return {
      french_level,
      english_level,
      skills_verified: skills,
      overall_score: 50,
      feedback: "Erreur lors de l'évaluation du passeport.",
    };
  }
}

/**
 * Génère une question pour le Talenti Passport (évaluation de compétence)
 */
export async function generatePassportQuestion(
  type: string,
  previousQuestions: string[] = []
): Promise<{ question: string }> {
  const prompt = `Tu es un examinateur professionnel. Tu fais passer un test de certification "${type}".

${
  previousQuestions.length > 0
    ? `Questions déjà posées :\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
    : "C'est la première question."
}

Pose une question pertinente pour évaluer le niveau du candidat en ${type}.
La question doit être en français clair et progresser en difficulté.

Réponds UNIQUEMENT au format JSON :
{"question": "Ta question ici..."}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch {
    return { question: "Parlez-moi de votre expérience professionnelle." };
  }
}