import type { Metadata } from "next";
import { LEGAL, SUBPROCESSORS, DATA_CATEGORIES } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Quelles données Odyssey.ai collecte, pourquoi, avec qui elles sont partagées, et comment exercer tes droits RGPD.",
};

export default function ConfidentialitePage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold text-[var(--text-0)]">
        Politique de confidentialité
      </h1>

      <p>
        Ce document décrit les données personnelles traitées par{" "}
        <strong>{LEGAL.serviceName}</strong>, la raison de chaque traitement et les moyens dont tu
        disposes pour les contrôler. Il est écrit pour être lu, pas pour être signé sans être lu.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        {LEGAL.companyName} détermine les finalités et les moyens des traitements décrits ici. Pour
        toute question ou demande d&apos;exercice de droits :{" "}
        <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>.
      </p>

      <h2>2. Le principe qu&apos;on applique</h2>
      <p>
        Odyssey traite des informations sensibles par nature : tes revenus, ta situation familiale,
        ta nationalité, ton statut de séjour. La règle qu&apos;on s&apos;impose est simple —{" "}
        <strong>on ne collecte que ce que tu saisis toi-même</strong>, et on n&apos;en fait rien
        d&apos;autre que ce pour quoi tu l&apos;as saisi.
      </p>
      <ul>
        <li>Aucune revente de données à des tiers, sans exception.</li>
        <li>Aucun profilage publicitaire, aucun pixel de régie publicitaire.</li>
        <li>Aucune donnée personnelle transmise dans les rapports d&apos;erreur technique.</li>
      </ul>
      <p>
        Ce dernier point n&apos;est pas déclaratif : les champs sensibles (revenus, messages,
        passeport, adresse, situation familiale…) sont retirés des rapports d&apos;incident
        <em> avant</em> tout envoi réseau, et ce filtrage fait l&apos;objet de tests automatisés.
      </p>

      <h2>3. Données traitées et durées de conservation</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {["Catégorie", "Détail", "Base légale", "Conservation"].map((h) => (
                <th
                  key={h}
                  className="text-left p-2 border-b font-semibold text-[var(--text-1)]"
                  style={{ borderColor: "var(--border-1)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATA_CATEGORIES.map((d) => (
              <tr key={d.category}>
                <td className="p-2 border-b align-top text-[var(--text-1)] font-medium" style={{ borderColor: "var(--border-0)" }}>
                  {d.category}
                </td>
                <td className="p-2 border-b align-top text-[var(--text-2)]" style={{ borderColor: "var(--border-0)" }}>
                  {d.detail}
                </td>
                <td className="p-2 border-b align-top text-[var(--text-2)]" style={{ borderColor: "var(--border-0)" }}>
                  {d.basis}
                </td>
                <td className="p-2 border-b align-top text-[var(--text-2)]" style={{ borderColor: "var(--border-0)" }}>
                  {d.retention}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>4. Conversations avec l&apos;assistant J.A.R.V.I.S.</h2>
      <p>
        Tes messages sont transmis à un fournisseur de modèle de langage (voir section 5) pour
        produire une réponse. Ils sont conservés dans ton compte afin que l&apos;assistant garde le
        fil de la conversation. <strong>Tu peux les supprimer à tout moment</strong> depuis les
        réglages de ton compte.
      </p>
      <p>
        N&apos;écris pas dans l&apos;assistant de numéro de passeport, de coordonnées bancaires ou
        de mot de passe. Aucune fonctionnalité du service ne les demande.
      </p>

      <h2>5. Destinataires et sous-traitants</h2>
      <p>
        Le RGPD impose de nommer les destinataires plutôt que d&apos;évoquer « des prestataires
        techniques ». Voici la liste exhaustive :
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {["Destinataire", "Finalité", "Localisation", "Encadrement"].map((h) => (
                <th
                  key={h}
                  className="text-left p-2 border-b font-semibold text-[var(--text-1)]"
                  style={{ borderColor: "var(--border-1)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SUBPROCESSORS.map((s) => (
              <tr key={s.name}>
                <td className="p-2 border-b align-top text-[var(--text-1)] font-medium" style={{ borderColor: "var(--border-0)" }}>
                  {s.name}
                </td>
                <td className="p-2 border-b align-top text-[var(--text-2)]" style={{ borderColor: "var(--border-0)" }}>
                  {s.purpose}
                </td>
                <td className="p-2 border-b align-top text-[var(--text-2)]" style={{ borderColor: "var(--border-0)" }}>
                  {s.location}
                </td>
                <td className="p-2 border-b align-top text-[var(--text-2)]" style={{ borderColor: "var(--border-0)" }}>
                  {s.safeguard}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Certains de ces sous-traitants sont établis aux États-Unis. Les transferts sont encadrés par
        les clauses contractuelles types de la Commission européenne et, le cas échéant, par
        l&apos;adhésion au <em>Data Privacy Framework</em>.
      </p>

      <h2>6. Tes droits</h2>
      <p>Tu disposes des droits suivants, exerçables à tout moment :</p>
      <ul>
        <li>
          <strong>Accès</strong> — obtenir une copie de tes données.
        </li>
        <li>
          <strong>Rectification</strong> — corriger une information inexacte.
        </li>
        <li>
          <strong>Effacement</strong> — supprimer ton compte et les données associées.
        </li>
        <li>
          <strong>Portabilité</strong> — récupérer tes données dans un format lisible par machine.
        </li>
        <li>
          <strong>Opposition et limitation</strong> — pour les traitements fondés sur
          l&apos;intérêt légitime.
        </li>
      </ul>
      <p>
        Écris à <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>. Réponse sous 30
        jours au maximum. Si la réponse ne te convient pas, tu peux saisir l&apos;autorité de
        contrôle de ton pays de résidence — en France la{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          CNIL
        </a>
        , en Belgique l&apos;
        <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer">
          APD
        </a>
        .
      </p>

      <h2>7. Cookies et stockage local</h2>
      <p>
        Le service n&apos;utilise <strong>aucun cookie publicitaire ni de mesure d&apos;audience
        tierce</strong>. Sont utilisés uniquement :
      </p>
      <ul>
        <li>
          le stockage nécessaire à ta session d&apos;authentification (sans lui, impossible de
          rester connecté) ;
        </li>
        <li>
          une préférence locale pour ta langue et ton thème clair/sombre, conservée dans ton
          navigateur ;
        </li>
        <li>
          un cache local hors-ligne, pour que l&apos;app reste consultable sans connexion.
        </li>
      </ul>
      <p>
        Ces éléments sont strictement nécessaires au fonctionnement du service et ne requièrent pas
        de consentement préalable. Vider les données de ton navigateur les supprime.
      </p>

      <h2>8. Sécurité</h2>
      <ul>
        <li>Chiffrement en transit (HTTPS) sur l&apos;ensemble du service.</li>
        <li>
          Règles d&apos;accès à la base de données en <em>refus par défaut</em> : une donnée non
          explicitement autorisée est inaccessible.
        </li>
        <li>Cloisonnement par compte : tes données ne sont lisibles que par toi.</li>
        <li>Filtrage des données personnelles avant tout envoi aux outils de diagnostic.</li>
      </ul>
      <p>
        En cas de violation de données présentant un risque pour tes droits, tu seras informé dans
        les meilleurs délais, conformément à l&apos;article 34 du RGPD.
      </p>

      <h2>9. Mineurs</h2>
      <p>
        Le service n&apos;est pas destiné aux personnes de moins de 16 ans et ne collecte pas
        sciemment leurs données. Si tu constates qu&apos;un compte a été créé par un mineur, signale-le
        à <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>.
      </p>

      <h2>10. Modifications</h2>
      <p>
        Toute modification substantielle sera annoncée dans le service avant son entrée en vigueur.
        La date de dernière révision figure en bas de cette page.
      </p>
    </>
  );
}
