import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CITIES, getCity, getCitySlugs, EUR_TO_MAD } from "@/lib/maroc-data";

type PageProps = { params: Promise<{ ville: string }> };

export function generateStaticParams() {
  return getCitySlugs().map((ville) => ({ ville }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ville } = await params;
  const city = getCity(ville);
  if (!city) return { title: "Ville non trouvée | Odyssey" };

  const eur = Math.round(city.monthlyMad / EUR_TO_MAD);
  const title = `Vivre à ${city.name} ${new Date().getFullYear()} — Coût de la vie, logement, internet | Odyssey`;
  const description = `S'installer à ${city.name} : budget mensuel ~${eur}€, loyer, internet ${city.internetMbps}Mbps, pour qui c'est fait. ${city.vibe}. Estimateur de budget + conseils expat, MRE et fiscalité.`;

  return {
    title,
    description,
    alternates: { canonical: `/maroc/${ville}` },
    openGraph: { title, description, type: "article", url: `/maroc/${ville}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function MarocVillePage({ params }: PageProps) {
  const { ville } = await params;
  const city = getCity(ville);
  if (!city) notFound();

  const eur = Math.round(city.monthlyMad / EUR_TO_MAD);
  const rentEur = Math.round(city.rent1brMad / EUR_TO_MAD);
  const related = CITIES.filter((c) => c.slug !== city.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Vivre à ${city.name} — coût de la vie et installation`,
    description: `Guide complet pour s'installer à ${city.name}, Maroc.`,
    author: { "@type": "Organization", name: "Odyssey.ai" },
    publisher: { "@type": "Organization", name: "Odyssey.ai" },
    datePublished: new Date().toISOString(),
    inLanguage: "fr-FR",
    about: { "@type": "City", name: city.name },
  };

  return (
    <div lang="fr" dir="ltr" className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="space-y-3">
        <Link href="/maroc" className="text-sm text-[var(--text-3)] hover:text-[var(--primary)]">← Hub Vivre au Maroc</Link>
        <div className="flex items-center gap-3">
          <span className="text-5xl">{city.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-0)]">Vivre à {city.name}</h1>
            <p className="text-[var(--text-3)]">{city.vibe} · 🇲🇦 Maroc</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Budget / mois" value={`~${eur} €`} />
        <Stat label="Loyer 1 chambre" value={`~${rentEur} €`} />
        <Stat label="Internet" value={`${city.internetMbps} Mbps`} />
        <Stat label="Coût vie" value={`${city.costIndexVsParis}/100`} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-0)]">Pourquoi {city.name} ?</h2>
        <p className="text-[var(--text-1)] leading-relaxed">{city.why}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {city.bestFor.map((b) => (
            <span key={b} className="text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ background: "var(--bg-2)", color: "var(--text-2)" }}>
              {b}
            </span>
          ))}
        </div>
      </section>

      <section className="glass-panel p-6 text-center space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-0)]">Calcule ton budget exact à {city.name}</h2>
        <p className="text-[var(--text-3)]">
          Ajuste le nombre de personnes et ton style de vie, et vois combien tu économises vs la France.
        </p>
        <Link href="/maroc#estimateur" className="inline-block px-6 py-3 rounded-xl text-white font-bold" style={{ background: "linear-gradient(135deg, #006233, #00875a)" }}>
          Ouvrir l&apos;estimateur →
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-0)]">Autres villes au Maroc</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {related.map((r) => (
            <Link key={r.slug} href={`/maroc/${r.slug}`} className="glass-panel p-4 hover:scale-[1.02] transition-transform">
              <div className="text-3xl mb-1">{r.emoji}</div>
              <div className="font-bold text-[var(--text-0)]">{r.name}</div>
              <div className="text-sm text-[var(--text-3)]">{r.vibe}</div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="text-xs text-[var(--text-3)] border-t pt-4" style={{ borderColor: "var(--border-0)" }}>
        Informations indicatives (estimations {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}, 1€≈10,8 MAD).
        Vérifie les conditions exactes auprès des autorités compétentes avant toute démarche.
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-4">
      <div className="text-xs uppercase text-[var(--text-3)]">{label}</div>
      <div className="text-lg font-bold text-[var(--text-0)] mt-1">{value}</div>
    </div>
  );
}
