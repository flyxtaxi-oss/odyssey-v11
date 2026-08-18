import type { Metadata } from "next";
import { LEGAL } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description:
    "Règles d'utilisation du service Odyssey.ai : compte, contenus, limites de responsabilité, résiliation.",
};

export default function CguPage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold text-[var(--text-0)]">
        Conditions générales d&apos;utilisation
      </h1>

      <p>
        En créant un compte ou en utilisant <strong>{LEGAL.serviceName}</strong>, tu acceptes les
        présentes conditions. Si tu n&apos;es pas d&apos;accord avec l&apos;une d&apos;entre elles,
        n&apos;utilise pas le service.
      </p>

      <h2>1. Objet du service</h2>
      <p>
        Odyssey.ai est un outil d&apos;aide à la décision pour les personnes qui envisagent de
        s&apos;installer à l&apos;étranger ou qui y vivent déjà. Il propose des guides
        d&apos;information sur les visas, un comparateur de fiscalité et de coût de la vie, un
        assistant conversationnel, et un espace communautaire.
      </p>

      <h2>2. Ce que le service n&apos;est pas</h2>
      <p>
        <strong>
          Odyssey.ai ne fournit ni conseil juridique, ni conseil fiscal, ni conseil en
          investissement, ni accompagnement en immigration.
        </strong>{" "}
        L&apos;éditeur n&apos;est ni avocat, ni expert-comptable, ni conseiller en gestion de
        patrimoine, ni consultant en immigration agréé.
      </p>
      <p>Concrètement, cela signifie que :</p>
      <ul>
        <li>
          les simulations sont des <strong>estimations</strong> fondées sur des règles générales,
          pas des calculs opposables à une administration ;
        </li>
        <li>
          les informations sur les visas décrivent un cadre général, jamais ta situation
          particulière ;
        </li>
        <li>
          les réponses de l&apos;assistant sont générées automatiquement et{" "}
          <strong>peuvent contenir des erreurs</strong>, y compris quand elles paraissent
          assurées ;
        </li>
        <li>
          la réglementation change fréquemment et sans préavis : une information exacte à sa date
          de collecte peut être obsolète aujourd&apos;hui.
        </li>
      </ul>
      <p>
        <strong>
          Vérifie systématiquement auprès de la source officielle (consulat, administration
          fiscale, professionnel qualifié) avant toute décision engageante.
        </strong>
      </p>

      <h2>3. Compte utilisateur</h2>
      <ul>
        <li>La création d&apos;un compte requiert une adresse e-mail valide.</li>
        <li>
          Tu es responsable de la confidentialité de tes identifiants et de l&apos;activité menée
          depuis ton compte.
        </li>
        <li>Un compte est personnel. Le partage entre plusieurs personnes n&apos;est pas autorisé.</li>
        <li>
          Tu peux supprimer ton compte à tout moment depuis tes réglages ou en écrivant à{" "}
          <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        </li>
      </ul>

      <h2>4. Règles de la communauté (Safe-Zone)</h2>
      <p>Sont interdits, sans avertissement préalable avant suppression :</p>
      <ul>
        <li>le harcèlement, les insultes, les propos haineux ou discriminatoires ;</li>
        <li>
          la publication de données personnelles d&apos;un tiers sans son accord (<em>doxxing</em>) ;
        </li>
        <li>le démarchage commercial non sollicité et le spam ;</li>
        <li>
          les contenus illicites, ou l&apos;offre de services d&apos;immigration ou de fiscalité
          sans habilitation ;
        </li>
        <li>l&apos;usurpation d&apos;identité.</li>
      </ul>
      <p>
        Tu conserves la propriété de tes publications et concèdes à l&apos;éditeur une licence non
        exclusive et gratuite de les afficher dans le service. Cette licence prend fin à la
        suppression du contenu.
      </p>
      <p>
        L&apos;éditeur peut retirer un contenu ou suspendre un compte en cas de manquement. Une
        décision de suspension peut être contestée à{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>

      <h2>5. Usage acceptable</h2>
      <p>Il est interdit de :</p>
      <ul>
        <li>
          extraire massivement le contenu du service par des moyens automatisés (<em>scraping</em>)
          ;
        </li>
        <li>tenter de contourner les limitations techniques, quotas ou contrôles d&apos;accès ;</li>
        <li>
          détourner l&apos;assistant de sa finalité, notamment pour produire des contenus illicites
          ;
        </li>
        <li>revendre ou redistribuer les contenus du service sans autorisation écrite.</li>
      </ul>

      <h2>6. Disponibilité</h2>
      <p>
        Le service est fourni « en l&apos;état », sans garantie de disponibilité continue. Des
        interruptions peuvent survenir pour maintenance, mise à jour, ou du fait d&apos;un
        prestataire tiers. L&apos;éditeur s&apos;efforce de limiter leur durée sans pouvoir la
        garantir.
      </p>

      <h2>7. Limitation de responsabilité</h2>
      <p>
        Dans la limite permise par la loi applicable, la responsabilité de l&apos;éditeur ne saurait
        être engagée pour les décisions prises sur la base des informations fournies par le service,
        ni pour les préjudices indirects (perte de revenus, d&apos;opportunité, ou de données) qui
        en résulteraient.
      </p>
      <p>
        Ces limitations ne s&apos;appliquent ni en cas de faute lourde ou intentionnelle, ni aux
        droits que la loi reconnaît impérativement aux consommateurs.
      </p>

      <h2>8. Évolution du service et des conditions</h2>
      <p>
        Les fonctionnalités peuvent évoluer. Toute modification substantielle des présentes
        conditions sera annoncée dans le service avant son entrée en vigueur. Poursuivre
        l&apos;utilisation après cette date vaut acceptation.
      </p>

      <h2>9. Droit applicable et litiges</h2>
      <p>
        Les présentes conditions sont régies par le droit français. En cas de litige, une solution
        amiable sera recherchée en priorité en écrivant à{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
      <p>
        Si tu es un consommateur résidant dans l&apos;Union européenne, tu conserves le bénéfice des
        dispositions impératives de la loi de ton pays de résidence et peux recourir à la plateforme
        européenne de règlement en ligne des litiges.
      </p>

      <h2>10. Contact</h2>
      <p>
        Pour toute question relative à ces conditions :{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </>
  );
}
