import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60 backdrop-blur-sm bg-white/40">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-blue-600">T</span><span className="text-amber-500">a</span><span className="text-blue-600">lenti</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="hover:text-blue-600 transition">
            Connexion
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition shadow-sm"
          >
            S&apos;inscrire
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            Trouvez du travail à distance{" "}
            <span className="text-blue-600">et développez votre carrière</span>{" "}
            grâce à l&apos;<span className="text-amber-500">IA</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            CV professionnel, lettre de motivation, simulateur d&apos;entretien,
            traduction multilingue, offres ciblées… Votre assistant IA pour
            décrocher l&apos;opportunité de vos rêves.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="#features"
              className="border border-slate-300 text-slate-700 px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-slate-50 transition"
            >
              Voir les fonctionnalités
            </Link>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Pricing */}
        <section className="bg-white/60 border-t border-slate-200 py-20">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-12">Nos offres</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <PricingCard
                name="Gratuit"
                price="0 €"
                features={["1 CV", "3 lettres de motivation", "Support email"]}
                cta="Essayer"
                href="/register"
              />
              <PricingCard
                name="Premium"
                price="3,99 €"
                period="/mois"
                features={[
                  "Offres d'emploi illimitées",
                  "CV & lettres de motivation par IA",
                  "Simulation d'entretien",
                ]}
                cta="Choisir Premium"
                href="/register?plan=premium"
                featured
              />
              <PricingCard
                name="Pro"
                price="7,99 €"
                period="/mois"
                features={[
                  "Tout Premium",
                  "Traductions multilingues",
                  "Formations (CV, LinkedIn, télétravail)",
                  "Assistant virtuel prioritaire",
                ]}
                cta="Choisir Pro"
                href="/register?plan=pro"
              />
            </div>
            <p className="text-sm text-slate-500 mt-4">
              💡 Économisez <strong>25%</strong> avec l&apos;abonnement annuel :{" "}
              <strong>Premium 29,99 €/an</strong> ou <strong>Pro 69,99 €/an</strong>
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-slate-500 py-8 border-t border-slate-200">
        © {new Date().getFullYear()} TalentAfrique IA — Trouvez votre opportunité
        avec l&apos;IA.
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "📄",
    title: "CV Professionnel",
    desc: "Répondez à quelques questions, l'IA génère votre CV en 4 formats : PDF moderne, européen, canadien.",
  },
  {
    icon: "✉️",
    title: "Lettre de Motivation",
    desc: "Collez une offre d'emploi, l'IA rédige une lettre personnalisée en quelques secondes.",
  },
  {
    icon: "🎤",
    title: "Simulateur d'Entretien",
    desc: "Un recruteur IA vous pose des questions, analyse vos réponses et vous aide à progresser.",
  },
  {
    icon: "🌍",
    title: "Traduction Multilingue",
    desc: "Traduisez CV, lettres et profil LinkedIn pour postuler en France, Suisse, Canada, Belgique.",
  },
  {
    icon: "🔍",
    title: "Offres Ciblées",
    desc: "L'IA parcourt les plateformes d'emploi et vous envoie 10 offres par jour par WhatsApp et email.",
  },
  {
    icon: "💬",
    title: "Chatbot 24/7",
    desc: "Un assistant IA disponible à toute heure pour répondre à vos questions et vous guider.",
  },
];

function PricingCard({
  name,
  price,
  period = "",
  features,
  cta,
  href,
  featured = false,
}: {
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 border text-left ${
        featured
          ? "bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-200 scale-105"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      <h3 className="text-xl font-semibold mb-1">{name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        {period && (
          <span className={featured ? "text-blue-100" : "text-slate-500"}>
            {period}
          </span>
        )}
      </div>
      <ul className="mb-6 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span>✓</span> {f}
          </li>
        ))}
      </ul>
      <a
        href={href}
        className={`block text-center py-2.5 rounded-xl font-semibold transition ${
          featured
            ? "bg-white text-blue-600 hover:bg-blue-50"
            : "bg-slate-100 text-slate-800 hover:bg-slate-200"
        }`}
      >
        {cta}
      </a>
    </div>
  );
}