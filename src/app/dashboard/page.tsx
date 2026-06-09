"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
}

interface JobOffer {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  url: string;
  salary: string | null;
  tags: string | null;
  score: number;
  saved: number;
  applied: number;
  posted_at: string;
  verified: number;
  fraud_score: number;
  reports_count: number;
  hidden: number;
}

interface Preferences {
  skills: string;
  sectors: string;
  target_countries: string;
  min_salary: string;
  experience_level: string;
  languages: string;
  availability: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("offres");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    skills: "", sectors: "", target_countries: "",
    min_salary: "", experience_level: "", languages: "", availability: ""
  });
  const [phone, setPhone] = useState("");
  const [whatsappOptin, setWhatsappOptin] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [notifSending, setNotifSending] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [referralInfo, setReferralInfo] = useState<any>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportModal, setReportModal] = useState<{ jobId: string; show: boolean }>({ jobId: "", show: false });
  const [reportReason, setReportReason] = useState("");
  const [passportInfo, setPassportInfo] = useState<any>(null);
  const [passportActive, setPassportActive] = useState(false);
  const [passportQuestion, setPassportQuestion] = useState("");
  const [passportAnswer, setPassportAnswer] = useState("");
  const [passportQNumber, setPassportQNumber] = useState(1);
  const [passportResult, setPassportResult] = useState<any>(null);
  const [passportHistory, setPassportHistory] = useState<any[]>([]);
  const router = useRouter();

  // État pour les formulaires
  const [cvForm, setCvForm] = useState({ name: "", studies: "", experience: "", languages: "", skills: "", format: "moderne" });
  const [lettreForm, setLettreForm] = useState({ offre: "" });
  const [entretienForm, setEntretienForm] = useState({ poste: "", historique: [] as string[], reponse: "" });
  const [traductionForm, setTraductionForm] = useState({ content: "", targetLang: "anglais" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    loadJobs();
    loadPreferences();
    loadPhone();
    loadBilling();
    loadReferral();
    loadPassport();
  }, [router]);

  const tokenHeader = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const loadJobs = async () => {
    try {
      const res = await fetch("/api/jobs/mine", {
        headers: tokenHeader(),
      });
      const data = await res.json();
      if (data.jobs) setJobs(data.jobs);
    } catch {}
  };

  const loadPreferences = async () => {
    try {
      const res = await fetch("/api/preferences", {
        headers: tokenHeader(),
      });
      const data = await res.json();
      if (data.preferences) {
        setPreferences(data.preferences);
      }
      setPrefsLoaded(true);
    } catch {}
  };

  const loadPhone = async () => {
    try {
      const res = await fetch("/api/phone", { headers: tokenHeader() });
      const data = await res.json();
      if (data.phone) setPhone(data.phone);
    } catch {}
  };

  const sendTestNotification = async () => {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: tokenHeader(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setResult(data.message || "✅ Notification envoyée !");
      }
    } catch {
      setError("Erreur de connexion");
    }
    setLoading(false);
  };

  const handleCV = () => api("/api/cv", cvForm);
  const handleLettre = () => api("/api/lettre", lettreForm);
  const handleEntretien = () =>
    api("/api/entretien", { poste: entretienForm.poste, historique: entretienForm.historique });
  const handleTraduction = () => api("/api/traduction", traductionForm);

  const api = async (url: string, body: any) => {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: tokenHeader(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur");
      } else {
        setResult(typeof data === "string" ? data : JSON.stringify(data, null, 2));
      }
    } catch {
      setError("Erreur de connexion");
    }
    setLoading(false);
  };

  // --- Billing & Subscription ---

  const loadBilling = async () => {
    try {
      const res = await fetch("/api/billing", { headers: tokenHeader() });
      const data = await res.json();
      if (data.plan) setSubscriptionInfo(data);
    } catch {}
  };

  const handleCheckout = async (plan: string, interval: string) => {
    setBillingLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: tokenHeader(),
        body: JSON.stringify({ plan, interval }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Erreur de paiement");
      }
    } catch {
      setError("Erreur de connexion");
    }
    setBillingLoading(false);
  };

  const handleCancelSubscription = async () => {
    setBillingLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: tokenHeader(),
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.message);
        loadBilling();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Erreur de connexion");
    }
    setBillingLoading(false);
  };

  const handleReactivateSubscription = async () => {
    setBillingLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: tokenHeader(),
        body: JSON.stringify({ action: "reactivate" }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.message);
        loadBilling();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Erreur de connexion");
    }
    setBillingLoading(false);
  };

  // --- Referral ---

  const loadReferral = async () => {
    try {
      const res = await fetch("/api/referral", { headers: tokenHeader() });
      const data = await res.json();
      if (data.referralCode) setReferralInfo(data);
    } catch {}
  };

  const copyReferralLink = () => {
    if (referralInfo?.referralLink && typeof window !== "undefined") {
      navigator.clipboard.writeText(referralInfo.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- Talenti Passport ---

  const loadPassport = async () => {
    try {
      const res = await fetch("/api/passport", { headers: tokenHeader() });
      const data = await res.json();
      if (data.status) {
        setPassportInfo(data);
        setPassportHistory(data.history || []);
      }
    } catch {}
  };

  const handleReportJob = async (jobId: string) => {
    if (!reportReason.trim()) return;
    try {
      const res = await fetch("/api/jobs/report", {
        method: "POST",
        headers: tokenHeader(),
        body: JSON.stringify({ jobId, reason: reportReason }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.message);
        setReportModal({ jobId: "", show: false });
        setReportReason("");
        loadJobs();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Erreur lors du signalement");
    }
  };

  const handleStartPassport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/passport", {
        method: "POST",
        headers: tokenHeader(),
        body: JSON.stringify({ action: "start", type: "français" }),
      });
      const data = await res.json();
      if (data.question) {
        setPassportActive(true);
        setPassportQuestion(data.question);
        setPassportQNumber(1);
        setPassportResult(null);
        setPassportAnswer("");
      } else {
        setError(data.error || "Erreur");
      }
    } catch {
      setError("Erreur");
    }
    setLoading(false);
  };

  const handlePassportAnswer = async () => {
    if (!passportAnswer.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/passport", {
        method: "POST",
        headers: tokenHeader(),
        body: JSON.stringify({
          action: "answer",
          passportId: passportInfo?.history?.[0]?.id || "",
          answer: passportAnswer,
        }),
      });
      const data = await res.json();
      if (data.completed) {
        setPassportResult(data);
        setPassportActive(false);
        loadPassport();
      } else if (data.question) {
        setPassportQuestion(data.question);
        setPassportQNumber(data.questionNumber);
        setPassportAnswer("");
      } else {
        setError(data.error || "Erreur");
      }
    } catch {
      setError("Erreur");
    }
    setLoading(false);
  };

  const handlePassportReset = () => {
    setPassportActive(false);
    setPassportQuestion("");
    setPassportAnswer("");
    setPassportResult(null);
    setPassportQNumber(1);
  };

  // --- Save Preferences ---

  const savePreferences = async () => {
    setLoading(true);
    try {
      // Sauvegarder les préférences
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: tokenHeader(),
        body: JSON.stringify(preferences),
      });
      const data = await res.json();

      // Sauvegarder le téléphone et l'opt-in WhatsApp
      await fetch("/api/phone", {
        method: "POST",
        headers: tokenHeader(),
        body: JSON.stringify({ phone, whatsapp_optin: whatsappOptin ? 1 : 0 }),
      });

      if (res.ok) {
        setResult("✅ Profil sauvegardé ! Les offres seront adaptées à vos critères.");
        loadJobs();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Erreur");
    }
    setLoading(false);
  };

  if (!user) return <div className="p-8">Chargement...</div>;

  const tabs = [
    { id: "offres", label: "🔍 Offres" },
    { id: "profil", label: "👤 Mon Profil" },
    { id: "cv", label: "📄 CV" },
    { id: "lettre", label: "✉️ Lettre" },
    { id: "entretien", label: "🎤 Entretien" },
    { id: "traduction", label: "🌍 Traduction" },
    { id: "abonnement", label: "💎 Abonnement" },
    { id: "parrainage", label: "🎁 Parrainage" },
    { id: "passport", label: "🛂 Talenti Passport" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Dashboard */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          <span className="text-blue-600">Talent</span>
          <span className="text-amber-500">Afrique</span>
          <span className="text-blue-600"> IA</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user.name}</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium uppercase">
            {user.plan}
          </span>
          <button
            onClick={() => {
              localStorage.clear();
              router.push("/");
            }}
            className="text-sm text-red-500 hover:underline"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Mon espace TalentAfrique IA</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition ${
                activeTab === t.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {/* 🔍 OFFRES */}
          {activeTab === "offres" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Offres de télétravail pour vous</h2>
                <button
                  onClick={loadJobs}
                  className="text-sm text-blue-600 hover:underline"
                >
                  🔄 Actualiser
                </button>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-3xl mb-3">🔍</p>
                  <p className="font-medium mb-1">Aucune offre pour le moment</p>
                  <p className="text-sm">
                    Allez dans l&apos;onglet <strong>Mon Profil</strong> pour renseigner vos compétences
                    et recevoir des offres adaptées.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.filter(j => !j.hidden).map((job) => (
                    <div
                      key={job.id}
                      className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{job.title}</h3>
                          <p className="text-sm text-slate-500">{job.company}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* Badge vérification Talenti */}
                            {job.verified === 1 ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                ✅ Vérifiée Talenti
                              </span>
                            ) : job.fraud_score > 0 ? (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                ⚠️ Non vérifiée
                              </span>
                            ) : null}
                            {job.tags && job.tags.split(",").slice(0, 4).map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {job.salary && (
                            <p className="text-sm font-medium text-green-600">{job.salary}</p>
                          )}
                          {job.score > 0 && (
                            <p className="text-xs text-amber-500 mt-1">
                              Match {job.score}%
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                        {job.description?.substring(0, 200)}...
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition"
                          >
                            Voir l&apos;offre
                          </a>
                        )}
                        <span className="text-xs text-slate-400">
                          {job.posted_at ? new Date(job.posted_at).toLocaleDateString("fr-FR") : "Récent"}
                        </span>
                        <button
                          onClick={() => setReportModal({ jobId: job.id, show: true })}
                          className="text-xs text-red-400 hover:text-red-600 transition ml-auto"
                        >
                          🚩 Signaler
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 👤 MON PROFIL */}
          {activeTab === "profil" && prefsLoaded && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Mon profil professionnel</h2>
              <p className="text-sm text-slate-500 mb-4">
                Renseignez vos informations pour recevoir chaque jour des offres de télétravail adaptées à votre profil.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Compétences</label>
                  <input
                    placeholder="Ex: support client, comptabilité, développement web, rédaction"
                    value={preferences.skills}
                    onChange={(e) => setPreferences({ ...preferences, skills: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Secteurs</label>
                  <input
                    placeholder="Ex: tech, finance, santé, marketing, éducation"
                    value={preferences.sectors}
                    onChange={(e) => setPreferences({ ...preferences, sectors: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Pays cibles</label>
                  <input
                    placeholder="Ex: France, Canada, Suisse, Belgique"
                    value={preferences.target_countries}
                    onChange={(e) => setPreferences({ ...preferences, target_countries: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Langues parlées</label>
                  <input
                    placeholder="Ex: français, anglais, espagnol, portugais"
                    value={preferences.languages}
                    onChange={(e) => setPreferences({ ...preferences, languages: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Salaire minimum souhaité</label>
                  <input
                    placeholder="Ex: 1500€/mois"
                    value={preferences.min_salary}
                    onChange={(e) => setPreferences({ ...preferences, min_salary: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Niveau d&apos;expérience</label>
                  <select
                    value={preferences.experience_level}
                    onChange={(e) => setPreferences({ ...preferences, experience_level: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="debutant">Débutant (moins de 2 ans)</option>
                    <option value="intermediaire">Intermédiaire (2-5 ans)</option>
                    <option value="confirme">Confirmé (5-10 ans)</option>
                    <option value="expert">Expert (10+ ans)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 block mb-1">Disponibilité</label>
                  <select
                    value={preferences.availability}
                    onChange={(e) => setPreferences({ ...preferences, availability: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="immediat">Immédiate</option>
                    <option value="1mois">Dans 1 mois</option>
                    <option value="3mois">Dans 3 mois</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              {/* 📱 Section WhatsApp */}
              <div className="border-t border-slate-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-2">📱 Alertes WhatsApp</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Recevez chaque jour les meilleures offres directement sur WhatsApp.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      Numéro WhatsApp (avec indicatif)
                    </label>
                    <input
                      placeholder="Ex: +221771234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Format : +[indicatif pays][numéro] — Ex: +221 pour le Sénégal
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={whatsappOptin}
                        onChange={(e) => setWhatsappOptin(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">
                        J&apos;accepte de recevoir des offres par WhatsApp
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={savePreferences}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Sauvegarde..." : "💾 Sauvegarder mon profil"}
              </button>

              {phone && whatsappOptin && (
                <button
                  onClick={sendTestNotification}
                  disabled={loading}
                  className="ml-3 border border-blue-200 text-blue-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition disabled:opacity-50"
                >
                  {loading ? "Envoi..." : "📨 Tester les alertes WhatsApp"}
                </button>
              )}
            </div>
          )}

          {/* CV */}
          {activeTab === "cv" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Générer un CV professionnel</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input placeholder="Nom complet" value={cvForm.name} onChange={(e) => setCvForm({ ...cvForm, name: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                <input placeholder="Études" value={cvForm.studies} onChange={(e) => setCvForm({ ...cvForm, studies: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                <input placeholder="Expérience" value={cvForm.experience} onChange={(e) => setCvForm({ ...cvForm, experience: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                <input placeholder="Langues" value={cvForm.languages} onChange={(e) => setCvForm({ ...cvForm, languages: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                <input placeholder="Compétences" value={cvForm.skills} onChange={(e) => setCvForm({ ...cvForm, skills: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                <select value={cvForm.format} onChange={(e) => setCvForm({ ...cvForm, format: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
                  <option value="moderne">Moderne</option>
                  <option value="europeen">Européen</option>
                  <option value="canadien">Canadien</option>
                </select>
              </div>
              <button onClick={handleCV} disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? "Génération..." : "Générer mon CV"}
              </button>
            </div>
          )}

          {/* Lettre */}
          {activeTab === "lettre" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Générer une lettre de motivation</h2>
              <textarea
                placeholder="Collez ici l'offre d'emploi..."
                value={lettreForm.offre}
                onChange={(e) => setLettreForm({ offre: e.target.value })}
                rows={6}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleLettre} disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? "Génération..." : "Générer la lettre"}
              </button>
            </div>
          )}

          {/* Entretien */}
          {activeTab === "entretien" && entretienForm.historique.length === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Simulation d&apos;entretien</h2>
              <input
                placeholder="Ex: assistant administratif, développeur web, community manager..."
                value={entretienForm.poste}
                onChange={(e) => setEntretienForm({ ...entretienForm, poste: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleEntretien} disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? "Démarrage..." : "Commencer l'entretien"}
              </button>
            </div>
          )}

          {activeTab === "entretien" && entretienForm.historique.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Entretien en cours</h2>
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                {entretienForm.historique.map((msg, i) => (
                  <p key={i} className="mb-2 text-sm">{msg}</p>
                ))}
              </div>
              <button onClick={() => setEntretienForm({ poste: "", historique: [], reponse: "" })} className="text-sm text-slate-500 hover:underline">
                ↺ Recommencer
              </button>
            </div>
          )}

          {/* Traduction */}
          {activeTab === "traduction" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Traduction de documents</h2>
              <textarea
                placeholder="Collez votre CV, lettre ou profil LinkedIn..."
                value={traductionForm.content}
                onChange={(e) => setTraductionForm({ ...traductionForm, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={traductionForm.targetLang}
                onChange={(e) => setTraductionForm({ ...traductionForm, targetLang: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-slate-300 w-full"
              >
                <option value="anglais">Anglais</option>
                <option value="espagnol">Espagnol</option>
                <option value="portugais">Portugais</option>
                <option value="arabe">Arabe</option>
              </select>
              {user.plan !== "pro" && (
                <p className="text-amber-600 text-sm">💡 La traduction est réservée aux abonnés Pro.</p>
              )}
              <button
                onClick={handleTraduction}
                disabled={loading || user.plan !== "pro"}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Traduction..." : "Traduire"}
              </button>
            </div>
          )}

          {/* 💎 ABONNEMENT */}
          {activeTab === "abonnement" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">💎 Gérer mon abonnement</h2>

              {/* Plan actuel */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <p className="text-sm text-slate-500 mb-1">Votre plan actuel</p>
                <p className="text-2xl font-bold capitalize mb-2">
                  {user.plan === "free" ? "Gratuit" : user.plan === "premium" ? "Premium" : "Pro"}
                </p>
                {subscriptionInfo?.subscriptionStatus === "active" && (
                  <p className="text-sm text-green-600">
                    ✅ Abonnement actif
                    {subscriptionInfo.subscriptionEnd && (
                      <> — expire le {new Date(subscriptionInfo.subscriptionEnd).toLocaleDateString("fr-FR")}</>
                    )}
                  </p>
                )}
                {subscriptionInfo?.subscriptionStatus === "canceling" && (
                  <p className="text-sm text-amber-600">
                    ⏳ Abonnement en cours d&apos;annulation (valide jusqu&apos;au{" "}
                    {subscriptionInfo.subscriptionEnd && new Date(subscriptionInfo.subscriptionEnd).toLocaleDateString("fr-FR")})
                  </p>
                )}
                {user.plan === "free" && (
                  <p className="text-sm text-slate-500 mt-2">
                    Profitez de fonctionnalités limitées. Passez à Premium ou Pro pour débloquer tout le potentiel de Talenti.
                  </p>
                )}
              </div>

              {/* Options d'abonnement */}
              {user.plan === "free" && (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Premium */}
                  <div className="border border-blue-200 rounded-2xl p-5 bg-blue-50/50">
                    <h3 className="text-lg font-bold mb-1">Premium</h3>
                    <div className="mb-3">
                      <span className="text-2xl font-bold">3,99 €</span>
                      <span className="text-slate-500">/mois</span>
                    </div>
                    <ul className="space-y-1.5 text-sm mb-4">
                      <li className="flex items-center gap-2">✓ Offres d&apos;emploi illimitées</li>
                      <li className="flex items-center gap-2">✓ CV & lettres par IA</li>
                      <li className="flex items-center gap-2">✓ Simulation d&apos;entretien</li>
                    </ul>
                    <button
                      onClick={() => handleCheckout("premium", "month")}
                      disabled={billingLoading}
                      className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {billingLoading ? "Chargement..." : "S'abonner mensuel"}
                    </button>
                    <button
                      onClick={() => handleCheckout("premium", "year")}
                      disabled={billingLoading}
                      className="w-full mt-2 border border-blue-300 text-blue-700 py-2 rounded-xl font-medium text-sm hover:bg-blue-50 transition disabled:opacity-50"
                    >
                      Annuel 29,99 €/an (économisez 25%)
                    </button>
                  </div>

                  {/* Pro */}
                  <div className="border border-amber-200 rounded-2xl p-5 bg-amber-50/50">
                    <h3 className="text-lg font-bold mb-1">Pro</h3>
                    <div className="mb-3">
                      <span className="text-2xl font-bold">7,99 €</span>
                      <span className="text-slate-500">/mois</span>
                    </div>
                    <ul className="space-y-1.5 text-sm mb-4">
                      <li className="flex items-center gap-2">✓ Tout Premium</li>
                      <li className="flex items-center gap-2">✓ Traductions multilingues</li>
                      <li className="flex items-center gap-2">✓ Formations incluses</li>
                      <li className="flex items-center gap-2">✓ Assistant virtuel prioritaire</li>
                    </ul>
                    <button
                      onClick={() => handleCheckout("pro", "month")}
                      disabled={billingLoading}
                      className="w-full bg-amber-500 text-white py-2.5 rounded-xl font-semibold hover:bg-amber-600 transition disabled:opacity-50"
                    >
                      {billingLoading ? "Chargement..." : "S'abonner mensuel"}
                    </button>
                    <button
                      onClick={() => handleCheckout("pro", "year")}
                      disabled={billingLoading}
                      className="w-full mt-2 border border-amber-300 text-amber-700 py-2 rounded-xl font-medium text-sm hover:bg-amber-50 transition disabled:opacity-50"
                    >
                      Annuel 69,99 €/an (économisez 25%)
                    </button>
                  </div>
                </div>
              )}

              {/* Gestion abonnement actif */}
              {(user.plan === "premium" || user.plan === "pro") && (
                <div className="border-t border-slate-200 pt-6">
                  {(subscriptionInfo?.subscriptionStatus === "active") && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={billingLoading}
                      className="border border-red-200 text-red-600 px-6 py-2.5 rounded-xl font-medium hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {billingLoading ? "Chargement..." : "🗑️ Annuler mon abonnement"}
                    </button>
                  )}
                  {subscriptionInfo?.subscriptionStatus === "canceling" && (
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={billingLoading}
                      className="border border-green-200 text-green-600 px-6 py-2.5 rounded-xl font-medium hover:bg-green-50 transition disabled:opacity-50"
                    >
                      {billingLoading ? "Chargement..." : "↻ Réactiver mon abonnement"}
                    </button>
                  )}
                  <p className="text-xs text-slate-400 mt-3">
                    Paiement sécurisé par Stripe. Vous pouvez annuler à tout moment.
                  </p>
                </div>
              )}

              {/* Parrainage */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold mb-2">🎁 Parrainage</h3>
                <p className="text-sm text-slate-500 mb-3">
                  Parrainez un ami et obtenez 1 mois gratuit ! Votre ami recevra aussi 1 mois gratuit.
                </p>
                {subscriptionInfo?.referralCode && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-1">Votre code de parrainage :</p>
                    <p className="text-lg font-bold text-blue-600 tracking-wider">{subscriptionInfo.referralCode}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Lien de partage : {typeof window !== "undefined" ? window.location.origin : ""}/register?ref={subscriptionInfo.referralCode}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      Vous avez parrainé <strong>{subscriptionInfo.referralCount || 0}</strong> personne(s).
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🎁 PARRAINAGE */}
          {activeTab === "parrainage" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">🎁 Parrainage</h2>
              <p className="text-sm text-slate-500">
                Parrainez vos amis et gagnez <strong>1 mois gratuit</strong> pour chaque ami qui s&apos;abonne !
                Votre ami reçoit aussi <strong>1 mois gratuit</strong>.
              </p>

              {/* Code et lien de parrainage */}
              {referralInfo?.referralCode ? (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <p className="text-sm font-medium text-slate-700 mb-2">Votre code de parrainage</p>
                  <p className="text-3xl font-bold text-blue-600 tracking-widest mb-4 text-center">
                    {referralInfo.referralCode}
                  </p>

                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Lien de partage :</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={referralInfo.referralLink || ""}
                        className="flex-1 px-3 py-2 text-sm bg-slate-50 rounded-lg border border-slate-200 text-slate-600"
                      />
                      <button
                        onClick={copyReferralLink}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                      >
                        {copied ? "✅ Copié !" : "📋 Copier"}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-3 text-center">
                    Partagez ce lien avec vos amis. Quand ils s&apos;inscrivent et s&apos;abonnent, vous gagnez 1 mois gratuit !
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
                  <p className="text-slate-500">Chargement de votre code de parrainage...</p>
                </div>
              )}

              {/* Statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 text-center">
                  <p className="text-2xl font-bold text-blue-600">{referralInfo?.referralCount || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Personnes parrainées</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 text-center">
                  <p className="text-2xl font-bold text-green-600">{referralInfo?.referralCredits || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Mois gratuits gagnés</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {referralInfo?.freeUntil
                      ? new Date(referralInfo.freeUntil).toLocaleDateString("fr-FR")
                      : "—"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Accès gratuit jusqu&apos;au</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {referralInfo?.referralCredits
                      ? `${(referralInfo.referralCredits * 3.99).toFixed(2)} €`
                      : "0 €"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Économies réalisées</p>
                </div>
              </div>

              {/* Liste des filleuls */}
              <div>
                <h3 className="font-semibold mb-3">Personnes parrainées</h3>
                {referralInfo?.referredUsers?.length > 0 ? (
                  <div className="space-y-2">
                    {referralInfo.referredUsers.map((u: any) => (
                      <div key={u.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200">
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            u.plan === "free"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {u.plan === "free" ? "Gratuit" : u.plan === "premium" ? "Premium" : "Pro"}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(u.joinedAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200">
                    <p className="text-3xl mb-2">👥</p>
                    <p className="text-sm text-slate-500">
                      Vous n&apos;avez pas encore parrainé d&apos;amis.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Partagez votre lien de parrainage pour commencer !
                    </p>
                  </div>
                )}
              </div>

              {/* Règles */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h4 className="font-semibold text-sm text-amber-800 mb-2">📋 Règles du parrainage</h4>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>✓ 1 mois gratuit pour chaque ami qui s&apos;abonne (Premium ou Pro)</li>
                  <li>✓ Votre ami reçoit aussi 1 mois gratuit</li>
                  <li>✓ Les mois gratuits s&apos;accumulent et prolongent votre accès</li>
                  <li>✓ Pas de limite : parrainez autant de personnes que vous voulez</li>
                </ul>
              </div>
            </div>
          )}

          {/* 🛂 TALENTI PASSPORT */}
          {activeTab === "passport" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">🛂 Talenti Passport</h2>
              <p className="text-sm text-slate-500">
                Certifiez vos compétences auprès de l&apos;IA. Le Talenti Passport est un badge de confiance
                qui atteste de votre niveau pour rassurer les recruteurs internationaux.
              </p>

              {/* Statut actuel */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Statut de votre Passport</p>
                    <p className="text-2xl font-bold">
                      {passportInfo?.status === "completed" ? (
                        <span className="text-green-600">✅ Certifié niveau {passportInfo.level}</span>
                      ) : passportInfo?.status === "testing" ? (
                        <span className="text-amber-600">⏳ Test en cours</span>
                      ) : (
                        <span className="text-slate-400">📝 Non certifié</span>
                      )}
                    </p>
                  </div>
                  {passportInfo?.status === "completed" && passportInfo?.level && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600">{passportInfo.level}</div>
                      <div className="text-xs text-slate-500">Niveau CECRL</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Test en cours */}
              {passportActive && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Test de français</h3>
                    <span className="text-sm text-slate-400">Question {passportQNumber}/5</span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <p className="font-medium text-slate-800">{passportQuestion}</p>
                  </div>

                  <textarea
                    placeholder="Votre réponse..."
                    value={passportAnswer}
                    onChange={(e) => setPassportAnswer(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handlePassportAnswer}
                      disabled={loading || !passportAnswer.trim()}
                      className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {loading ? "Envoi..." : "Valider la réponse"}
                    </button>
                    <button
                      onClick={handlePassportReset}
                      className="border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Résultat du test */}
              {passportResult && !passportActive && (
                <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3">🎉 Test terminé !</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-indigo-600">{passportResult.level}</p>
                      <p className="text-xs text-slate-500">Niveau</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{passportResult.score}/100</p>
                      <p className="text-xs text-slate-500">Score</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-700">{passportResult.feedback}</p>
                  <button
                    onClick={handlePassportReset}
                    className="mt-4 text-sm text-indigo-600 hover:underline"
                  >
                    Recommencer le test
                  </button>
                </div>
              )}

              {/* Bouton démarrer */}
              {!passportActive && passportInfo?.status !== "testing" && (
                <button
                  onClick={handleStartPassport}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? "Préparation..." : "🛂 Démarrer la certification"}
                </button>
              )}

              {/* Historique */}
              {passportHistory.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Historique des certifications</h3>
                  <div className="space-y-2">
                    {passportHistory.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200">
                        <div>
                          <p className="font-medium text-sm capitalize">{p.type}</p>
                          <p className="text-xs text-slate-400">
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString("fr-FR") : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          {p.status === "completed" ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {p.level} — {p.score}/100
                            </span>
                          ) : (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                              En cours
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🚩 Report Modal */}
          {reportModal.show && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setReportModal({ jobId: "", show: false })}>
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-semibold mb-2">🚩 Signaler cette offre</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Pourquoi signalez-vous cette offre ? Cela nous aide à protéger la communauté Talenti.
                </p>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                >
                  <option value="">Sélectionnez une raison...</option>
                  <option value="arnaque">Arnaque / Fraude</option>
                  <option value="fausse_offre">Fausse offre d&apos;emploi</option>
                  <option value="payant">Demande de paiement</option>
                  <option value="suspect">Offre suspecte</option>
                  <option value="autre">Autre</option>
                </select>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReportJob(reportModal.jobId)}
                    disabled={!reportReason}
                    className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 flex-1"
                  >
                    Signaler
                  </button>
                  <button
                    onClick={() => setReportModal({ jobId: "", show: false })}
                    className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Résultat */}
          {error && (
            <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>
          )}
          {result && !error && (
            <div className="mt-6 bg-green-50 text-slate-800 p-4 rounded-xl text-sm whitespace-pre-wrap border border-green-200">
              <strong className="block mb-2 text-green-700">Résultat :</strong>
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}