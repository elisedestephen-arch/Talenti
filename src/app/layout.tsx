import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talenti - Trouvez du travail à distance grâce à l'IA",
  description:
    "Plateforme IA pour les talents africains : CV, lettres de motivation, entretiens, traduction et offres d'emploi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}