import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

// ==============================================================================
// Règles Firestore — scénarios d'autorisation RÉELS (Firebase Emulator)
// ==============================================================================
//
// `firestore-rules.test.ts` est un garde TEXTUEL : il empêche que quelqu'un
// réécrive les règles en retirant une protection. Il ne prouve pas que les
// règles font ce qu'on croit — une règle peut être syntaxiquement présente et
// sémantiquement fausse.
//
// Ici on rejoue les vrais scénarios contre le moteur de règles :
// non authentifié / propriétaire / autre utilisateur / usurpation d'identité /
// transfert de propriété / escalade de privilège.
//
// PRÉREQUIS : l'emulator Firestore doit tourner (`npm run emulator`), ce qui
// exige un JDK. Sans emulator ces tests sont SAUTÉS plutôt qu'échoués, pour ne
// pas rendre `npm test` dépendant d'un service externe — la CI, elle, doit
// démarrer l'emulator (voir README).

const HOST = "127.0.0.1";
const PORT = 8080;
const ALICE = "alice-uid";
const BOB = "bob-uid";

async function emulatorReachable(): Promise<boolean> {
  try {
    const res = await fetch(`http://${HOST}:${PORT}/`, {
      signal: AbortSignal.timeout(1500),
    });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

const available = await emulatorReachable();
const describeIfEmulator = available ? describe : describe.skip;

if (!available) {
  console.warn(
    `\n⚠️  Emulator Firestore injoignable sur ${HOST}:${PORT} — tests de règles SAUTÉS.` +
      `\n   Lance « npm run emulator » (nécessite un JDK) pour les exécuter.\n`
  );
}

// Le défaut de vitest (5 s) est trop court pour cette suite, et l'échec ne
// tombe pas au hasard : c'est TOUJOURS le premier test qui le subit. Le premier
// aller-retour vers un émulateur fraîchement démarré paie le chargement des
// règles et l'établissement de la connexion gRPC — mesuré à 5,2 s ici, juste
// au-dessus de la limite. Les tests suivants s'exécutent en quelques
// millisecondes.
//
// Un test qui échoue selon la charge de la machine est pire qu'un test absent :
// l'équipe apprend à relancer la CI au lieu de lire l'échec, et le jour où
// c'est une vraie régression, personne ne la voit.
const EMULATOR_TIMEOUT_MS = 30_000;

describeIfEmulator("firestore.rules — autorisation réelle", { timeout: EMULATOR_TIMEOUT_MS }, () => {
  let env: RulesTestEnvironment;

  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: "odyssey-rules-test",
      firestore: {
        host: HOST,
        port: PORT,
        rules: readFileSync(join(__dirname, "..", "..", "..", "firestore.rules"), "utf8"),
      },
    });
  });

  afterAll(async () => {
    await env?.cleanup();
  });

  beforeEach(async () => {
    await env.clearFirestore();
  });

  /** Écrit un document en contournant les règles (mise en place de scénario). */
  async function seed(path: [string, string], data: Record<string, unknown>) {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), path[0], path[1]), data);
    });
  }

  const aliceDb = () => env.authenticatedContext(ALICE).firestore();
  const bobDb = () => env.authenticatedContext(BOB).firestore();
  const anonDb = () => env.unauthenticatedContext().firestore();

  // ── Isolation entre utilisateurs ─────────────────────────────────────────

  it("Bob ne peut pas lire une simulation d'Alice", async () => {
    await seed(["simulations", "sim1"], { user_id: ALICE, destination: "portugal" });

    await assertSucceeds(getDoc(doc(aliceDb(), "simulations", "sim1")));
    await assertFails(getDoc(doc(bobDb(), "simulations", "sim1")));
    await assertFails(getDoc(doc(anonDb(), "simulations", "sim1")));
  });

  it("Bob ne peut ni modifier ni supprimer un check-in d'Alice", async () => {
    await seed(["checkins", "c1"], { user_id: ALICE, mood_score: 4 });

    await assertFails(updateDoc(doc(bobDb(), "checkins", "c1"), { mood_score: 1 }));
    await assertFails(deleteDoc(doc(bobDb(), "checkins", "c1")));
    await assertSucceeds(updateDoc(doc(aliceDb(), "checkins", "c1"), { mood_score: 5 }));
  });

  // ── Usurpation d'identité à la création ──────────────────────────────────

  it("Bob ne peut pas créer un document au nom d'Alice", async () => {
    await assertFails(
      setDoc(doc(bobDb(), "simulations", "sim2"), { user_id: ALICE, destination: "dubai" })
    );
    await assertSucceeds(
      setDoc(doc(bobDb(), "simulations", "sim3"), { user_id: BOB, destination: "dubai" })
    );
  });

  // ── Modération : le fil public est fermé en écriture côté client ─────────

  it("aucun client ne peut écrire dans le fil, même pour lui-même", async () => {
    // /api/posts modère (checkPromptInjection + moderateContent) puis écrit via
    // l'Admin SDK. Tant que le client pouvait écrire ici, il posait son propre
    // `is_verified: true` : la modération d'un fil PUBLIC était décorative.
    await assertFails(
      setDoc(doc(bobDb(), "posts", "p1"), { author_id: ALICE, content: "faux post" })
    );
    await assertFails(
      setDoc(doc(bobDb(), "posts", "p2"), { author_id: BOB, content: "post de Bob" })
    );
  });

  it("interdit à un client de se décerner son propre verdict de modération", async () => {
    await assertFails(
      setDoc(doc(aliceDb(), "posts", "p5"), {
        author_id: ALICE,
        content: "contenu toxique",
        is_verified: true,
        toxicity_score: 0,
      })
    );
  });

  it("empêche un auteur d'éditer son post après modération", async () => {
    // Sinon : publier un texte anodin, le faire valider, puis le remplacer.
    await seed(["posts", "p6"], { author_id: ALICE, content: "anodin", is_verified: true });

    await assertFails(updateDoc(doc(aliceDb(), "posts", "p6"), { content: "tout autre chose" }));
    await assertFails(deleteDoc(doc(aliceDb(), "posts", "p6")));
  });

  // ── Transfert de propriété ───────────────────────────────────────────────

  it("Alice ne peut pas transférer sa simulation à Bob", async () => {
    await seed(["simulations", "sim4"], { user_id: ALICE, destination: "malta" });

    // user_id est immuable : réécrire le propriétaire est refusé.
    await assertFails(updateDoc(doc(aliceDb(), "simulations", "sim4"), { user_id: BOB }));
    // Mais modifier le reste reste permis.
    await assertSucceeds(updateDoc(doc(aliceDb(), "simulations", "sim4"), { destination: "cyprus" }));
  });

  it("Alice ne peut pas réattribuer son post à Bob", async () => {
    await seed(["posts", "p3"], { author_id: ALICE, content: "post original" });

    await assertFails(updateDoc(doc(aliceDb(), "posts", "p3"), { author_id: BOB }));
  });

  // ── Escalade de privilège ────────────────────────────────────────────────

  it("Alice ne peut pas se donner le rôle admin sur son profil", async () => {
    await assertFails(
      setDoc(doc(aliceDb(), "profiles", ALICE), { email: "a@x.fr", role: "admin" })
    );
    await assertSucceeds(setDoc(doc(aliceDb(), "profiles", ALICE), { email: "a@x.fr" }));
    await assertFails(updateDoc(doc(aliceDb(), "profiles", ALICE), { role: "admin" }));
  });

  it("Bob ne peut pas lire le profil d'Alice", async () => {
    await seed(["profiles", ALICE], { email: "alice@exemple.fr" });

    await assertSucceeds(getDoc(doc(aliceDb(), "profiles", ALICE)));
    await assertFails(getDoc(doc(bobDb(), "profiles", ALICE)));
  });

  // ── Escalade d'abonnement ────────────────────────────────────────────────
  //
  // Le SDK client écrit dans Firestore avec l'identité de l'utilisateur. Sans
  // ces règles, Alice ouvre la console de son navigateur et se pose
  // `plan: "pro_max"` : l'abonnement devient déclaratif et le paiement
  // facultatif. C'est le test qui garantit que la facturation a un sens.

  it("Alice ne peut pas s'attribuer un plan payant à la création", async () => {
    await assertFails(
      setDoc(doc(aliceDb(), "profiles", ALICE), { email: "a@x.fr", plan: "pro_max" })
    );
    await assertFails(
      setDoc(doc(aliceDb(), "profiles", ALICE), { email: "a@x.fr", planStatus: "active" })
    );
    await assertSucceeds(setDoc(doc(aliceDb(), "profiles", ALICE), { email: "a@x.fr" }));
  });

  it("Alice ne peut pas se surclasser après coup", async () => {
    await seed(["profiles", ALICE], { email: "a@x.fr", plan: "free", planStatus: "none" });

    await assertFails(updateDoc(doc(aliceDb(), "profiles", ALICE), { plan: "pro" }));
    await assertFails(updateDoc(doc(aliceDb(), "profiles", ALICE), { planStatus: "active" }));
    await assertFails(
      updateDoc(doc(aliceDb(), "profiles", ALICE), { stripeSubscriptionId: "sub_forge" })
    );
  });

  it("Alice ne peut pas réactiver un abonnement impayé", async () => {
    // Le contournement le plus rentable : laisser `plan: "pro"` en place et ne
    // réécrire que le statut, pour rouvrir les droits sans payer.
    await seed(["profiles", ALICE], { email: "a@x.fr", plan: "pro", planStatus: "past_due" });

    await assertFails(updateDoc(doc(aliceDb(), "profiles", ALICE), { planStatus: "active" }));
  });

  it("laisse passer un merge de préférences sur un profil déjà abonné", async () => {
    // Le pendant indispensable des trois tests ci-dessus : la protection ne
    // doit pas casser l'usage normal. Avec `merge`, `request.resource.data`
    // porte le document APRÈS fusion — donc `plan` y figure, inchangé. La
    // règle doit l'accepter, sinon un abonné payant ne peut plus modifier son
    // thème ni sa langue.
    await seed(["profiles", ALICE], {
      email: "a@x.fr",
      plan: "pro",
      planStatus: "active",
      role: "user",
    });

    await assertSucceeds(
      setDoc(doc(aliceDb(), "profiles", ALICE), { theme: "dark" }, { merge: true })
    );
  });

  it("aucun client ne peut lire ni remettre à zéro un compteur d'usage", async () => {
    // Un compteur inscriptible par le client rend les quotas sans effet : il
    // suffirait de le remettre à 0 chaque mois pour rester gratuit à vie.
    await seed(["usage_counters", `${ALICE}__2026-08`], {
      user_id: ALICE,
      period: "2026-08",
      simulations: 3,
    });

    await assertFails(getDoc(doc(aliceDb(), "usage_counters", `${ALICE}__2026-08`)));
    await assertFails(
      setDoc(doc(aliceDb(), "usage_counters", `${ALICE}__2026-08`), { simulations: 0 })
    );
  });

  // ── Journal d'audit ──────────────────────────────────────────────────────

  it("Bob ne peut pas fabriquer une entrée d'audit au nom d'Alice", async () => {
    await assertFails(
      setDoc(doc(bobDb(), "audit_log", "log1"), { user_id: ALICE, action: "delete_all" })
    );
    await assertSucceeds(
      setDoc(doc(bobDb(), "audit_log", "log2"), { user_id: BOB, action: "login" })
    );
  });

  it("un journal d'audit ne peut être ni modifié ni supprimé", async () => {
    await seed(["audit_log", "log3"], { user_id: ALICE, action: "login" });

    await assertFails(updateDoc(doc(aliceDb(), "audit_log", "log3"), { action: "rien" }));
    await assertFails(deleteDoc(doc(aliceDb(), "audit_log", "log3")));
  });

  // ── Parcours client réels (les pages écrivent directement) ───────────────
  //
  // Ces trois cas rejouent ce que font settings/page.tsx et visa/page.tsx.
  // Ce sont les seules écritures client encore légitimes : si une règle les
  // casse, la panne est invisible au build et ne se voit qu'en production.

  it("laisse Settings enregistrer les préférences via un merge sur le profil", async () => {
    await seed(["profiles", ALICE], { email: "alice@exemple.fr", role: "user" });

    // setDoc(..., { merge: true }) : `request.resource.data` est le résultat
    // FUSIONNÉ, donc `role` y figure inchangé — la règle doit l'accepter.
    await assertSucceeds(
      setDoc(
        doc(aliceDb(), "profiles", ALICE),
        { settings: { notifications: true }, updated_at: "2026-08-04" },
        { merge: true }
      )
    );
  });

  it("laisse Suivi Visa créer, lire et supprimer ses propres visas", async () => {
    await assertSucceeds(
      setDoc(doc(aliceDb(), "visas", "v1"), {
        user_id: ALICE,
        country: "maroc",
        created_at: "2026-08-04",
      })
    );
    await assertSucceeds(getDoc(doc(aliceDb(), "visas", "v1")));
    await assertFails(getDoc(doc(bobDb(), "visas", "v1")));
    await assertSucceeds(deleteDoc(doc(aliceDb(), "visas", "v1")));
  });

  it("laisse le simulateur enregistrer et relire ses simulations", async () => {
    await assertSucceeds(
      setDoc(doc(aliceDb(), "simulations", "s9"), {
        user_id: ALICE,
        destination: "portugal",
        created_at: "2026-08-04",
      })
    );
    await assertSucceeds(getDoc(doc(aliceDb(), "simulations", "s9")));
  });

  // ── Collections serveur & refus par défaut ───────────────────────────────

  it("aucun client ne touche aux compteurs de rate limit", async () => {
    await seed(["rate_limits", "bucket1"], { tokens: 0, last_refill: 0 });

    await assertFails(getDoc(doc(aliceDb(), "rate_limits", "bucket1")));
    await assertFails(setDoc(doc(aliceDb(), "rate_limits", "bucket1"), { tokens: 999 }));
  });

  it("refuse par défaut toute collection non déclarée", async () => {
    await assertFails(getDoc(doc(aliceDb(), "collection_inventee", "x")));
    await assertFails(setDoc(doc(aliceDb(), "collection_inventee", "x"), { a: 1 }));
  });

  // ── Lecture publique légitime ────────────────────────────────────────────

  it("laisse le fil des posts lisible publiquement", async () => {
    await seed(["posts", "p4"], { author_id: ALICE, content: "post public" });

    await assertSucceeds(getDoc(doc(anonDb(), "posts", "p4")));
  });
});
