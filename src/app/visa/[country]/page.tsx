import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getVisaCountry, getVisaCountrySlugs, VISA_COUNTRIES } from "@/lib/visa-countries";

type PageProps = { params: Promise<{ country: string }> };

export async function generateStaticParams() {
  return getVisaCountrySlugs().map((slug) => ({ country: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params;
  const data = getVisaCountry(country);
  if (!data) return { title: "Pays non trouvé | Odyssey" };

  const title = `Visa digital nomad ${data.name} ${new Date().getFullYear()} — Guide complet | Odyssey`;
  const description = `${data.visaName} pour les Français : conditions, revenu minimum (${data.minIncome}€/mois), durée (${data.maxStayDays} jours), fiscalité. Comparé avec 49 autres pays.`;

  return {
    title,
    description,
    alternates: { canonical: `/visa/${country}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/visa/${country}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function VisaCountryPage({ params }: PageProps) {
  const { country } = await params;
  const data = getVisaCountry(country);

  if (!data) notFound();

  // Related countries: 3 random from the same cost-of-living tier
  const related = VISA_COUNTRIES
    .filter((c) => c.slug !== data.slug && Math.abs(c.costOfLivingIndex - data.costOfLivingIndex) < 15)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Visa digital nomad ${data.name} — Guide complet`,
    description: `Guide complet du ${data.visaName} pour les Français qui veulent vivre au ${data.name}.`,
    author: { "@type": "Organization", name: "Odyssey.ai" },
    publisher: { "@type": "Organization", name: "Odyssey.ai" },
    datePublished: new Date().toISOString(),
    inLanguage: "fr-FR",
    about: { "@type": "Country", name: data.name },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{data.flag}</span>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-0)]">
              Visa digital nomad {data.name}
            </h1>
            <p className="text-[var(--text-3)]">
              Guide complet du {data.visaName} pour les expats français
            </p>
          </div>
        </div>
      </header>

      {/* Key stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Durée max" value={`${data.maxStayDays} jours`} />
        <Stat label="Revenu min" value={`${data.minIncome.toLocaleString()} €/mois`} />
        <Stat label="Taux fiscal" value={data.taxFlatRate !== undefined ? `${data.taxFlatRate}%` : "Variable"} />
        <Stat label="Coût de vie" value={`${data.costOfLivingIndex}/100`} />
      </section>

      {/* Highlights */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-0)]">Pourquoi {data.name} ?</h2>
        <ul className="space-y-2">
          {data.highlights.map((h) => (
            <li key={h} className="flex gap-2 text-[var(--text-1)]">
              <span>•</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* The visa */}
      <section className="glass-panel p-6 space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-0)]">{data.visaName}</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[var(--text-1)]">
          <div>
            <dt className="text-xs uppercase text-[var(--text-3)]">Capitale</dt>
            <dd className="font-medium">{data.capitalCity}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[var(--text-3)]">Durée du séjour</dt>
            <dd className="font-medium">{data.maxStayDays} jours (renouvelable selon conditions)</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[var(--text-3)]">Revenu minimum requis</dt>
            <dd className="font-medium">{data.minIncome.toLocaleString()} €/mois</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[var(--text-3)]">Fiscalité</dt>
            <dd className="font-medium">
              {data.taxFlatRate !== undefined ? `${data.taxFlatRate}% (taux forfaitaire indicatif)` : "Selon barème local"}
            </dd>
          </div>
        </dl>
      </section>

      {/* CTA */}
      <section className="glass-panel p-6 text-center space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-0)]">
          Lance une simulation pour {data.name}
        </h2>
        <p className="text-[var(--text-3)]">
          Compare fiscalité, coût de la vie et opportunités avec ton profil personnel.
          En 2 minutes, tu sauras si {data.name} est fait pour toi.
        </p>
        <Link
          href="/simulator"
          className="inline-block px-6 py-3 rounded-xl text-white font-bold"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
        >
          Simuler ma trajectoire →
        </Link>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[var(--text-0)]">Pays similaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/visa/${r.slug}`}
                className="glass-panel p-4 hover:scale-[1.02] transition-transform"
              >
                <div className="text-3xl mb-1">{r.flag}</div>
                <div className="font-bold text-[var(--text-0)]">{r.name}</div>
                <div className="text-sm text-[var(--text-3)]">{r.visaName}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer disclaimer */}
      <footer className="text-xs text-[var(--text-3)] border-t pt-4" style={{ borderColor: "var(--border-0)" }}>
        Informations indicatives mises à jour {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}.
        Vérifie les conditions exactes auprès du consulat ou d&apos;un avocat spécialisé avant toute démarche.
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
