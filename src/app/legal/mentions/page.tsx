import type { Metadata } from "next";
import { LEGAL, TODO } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Identité de l'éditeur, hébergeur et responsable de publication du service Odyssey.ai.",
};

/**
 * Affiche la valeur, ou un marqueur visible si elle n'est pas renseignée.
 *
 * Un champ manquant ne doit PAS disparaître silencieusement : une page de
 * mentions légales qui a l'air complète alors qu'il manque le numéro
 * d'immatriculation est pire qu'une page visiblement inachevée — elle donne
 * l'illusion de la conformité.
 */
function Field({ label, value }: { label: string; value: string }) {
  const missing = value === TODO;
  return (
    <li>
      <strong>{label} : </strong>
      {missing ? (
        <span
          className="px-1.5 py-0.5 rounded text-xs font-mono"
          style={{ background: "var(--error-dim)", color: "#fff" }}
        >
          à compléter avant mise en ligne
        </span>
      ) : (
        <span>{value}</span>
      )}
    </li>
  );
}

export default function MentionsPage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold text-[var(--text-0)]">Mentions légales</h1>

      <h2>Éditeur du service</h2>
      <ul>
        <Field label="Service" value={LEGAL.serviceName} />
        <Field label="Éditeur" value={LEGAL.companyName} />
        <Field label="Forme juridique" value={LEGAL.legalForm} />
        <Field label="Siège social" value={LEGAL.address} />
        <Field label="Numéro d'immatriculation" value={LEGAL.registrationNumber} />
        <Field label="TVA intracommunautaire" value={LEGAL.vatNumber} />
        <Field label="Capital social" value={LEGAL.shareCapital} />
        <Field label="Directeur de la publication" value={LEGAL.publicationDirector} />
        <Field label="Contact" value={LEGAL.contactEmail} />
      </ul>

      <h2>Hébergement</h2>
      <p>
        Le service est hébergé par <strong>{LEGAL.host.name}</strong>, {LEGAL.host.address} —{" "}
        <a href={LEGAL.host.website} target="_blank" rel="noopener noreferrer">
          {LEGAL.host.website}
        </a>
        .
      </p>
      <p>
        Les données de compte et de service sont stockées via Google Firebase (Firestore et
        Authentication). Le détail des sous-traitants figure dans la{" "}
        <a href="/legal/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        La structure du service, son interface, ses textes éditoriaux et ses éléments graphiques
        sont protégés par le droit d&apos;auteur. Toute reproduction ou réutilisation sans
        autorisation écrite préalable est interdite.
      </p>
      <p>
        Les données publiques réutilisées par le service (textes réglementaires, barèmes fiscaux,
        conditions de visa) restent la propriété de leurs émetteurs respectifs et sont citées avec
        leur source et leur date de collecte.
      </p>

      <h2>Nature de l&apos;information diffusée</h2>
      <p>
        <strong>
          Odyssey.ai est un outil d&apos;information et de comparaison. Ce n&apos;est ni un cabinet
          d&apos;avocats, ni un cabinet d&apos;expertise comptable, ni un conseil en gestion de
          patrimoine.
        </strong>{" "}
        Les simulations, estimations et réponses de l&apos;assistant ne constituent pas un conseil
        juridique, fiscal ou financier personnalisé et ne peuvent se substituer à l&apos;avis
        d&apos;un professionnel qualifié dans le pays concerné.
      </p>
      <p>
        La réglementation en matière d&apos;immigration et de fiscalité change fréquemment. Vérifie
        systématiquement l&apos;information auprès de la source officielle avant toute décision
        engageante — un départ, une résiliation de bail, une démission ou une déclaration fiscale.
      </p>

      <h2>Signalement d&apos;un contenu</h2>
      <p>
        Pour signaler un contenu illicite publié dans la Safe-Zone, ou une donnée que tu estimes
        erronée, écris à{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> en précisant l&apos;URL
        concernée et le motif. Les signalements sont traités sous 72 heures ouvrées.
      </p>
    </>
  );
}
