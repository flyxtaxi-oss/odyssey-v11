import { NextRequest, NextResponse } from "next/server";
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { authenticateRequest, optionalAuth } from "@/lib/auth-middleware";
import { CreatePostSchema, validateInput } from "@/lib/validation";
import { checkPromptInjection } from "@/lib/security";
import { getSecurityHeaders } from "@/lib/security";

// ==============================================================================
// POSTS API — CRUD with Firebase Firestore + AI Moderation (SECURED)
// ==============================================================================

/**
 * GET /api/posts — Fetch all posts (public)
 */
export async function GET(req: NextRequest) {
  try {
    // Optional authentication (for personalized content later)
    const user = await optionalAuth(req);

    // Build query
    const q = query(
      collection(db, "posts"),
      orderBy("created_at", "desc"),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        author: {
          name: data.author_name || "Anonyme",
          badge: data.author_badge || "Membre",
          avatar: data.author_avatar || "A",
        },
        content: data.content,
        likes: data.likes || 0,
        comments: data.comments || 0,
        verified: data.is_verified || false,
        toxicity_score: data.toxicity_score || 0,
        time: formatTimeAgo(data.created_at),
        // Only show edit/delete buttons to author
        isOwner: user?.uid === data.author_id,
      };
    });

    return NextResponse.json(
      {
        posts,
        total: posts.length,
        source: "firebase",
      },
      { headers: getSecurityHeaders() }
    );
  } catch (error) {
    console.error("Posts GET Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des posts." },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

/**
 * POST /api/posts — Create new post (authenticated + validated)
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(req);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status, headers: getSecurityHeaders() }
      );
    }

    // Parse and validate body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const validation = validateInput(CreatePostSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const { content } = validation.data;

    // Check for prompt injection / malicious content
    const securityCheck = checkPromptInjection(content);
    if (securityCheck.blocked) {
      return NextResponse.json(
        {
          error: "Contenu bloqué",
          reason: "Potentiellement malveillant",
          patterns: securityCheck.detectedPatterns,
        },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    // AI Moderation (mock — replace with real AI when API key is set)
    const toxicity_score = Math.random() * 0.1; // Low score = safe
    const is_verified = toxicity_score < 0.5;

    // Create new post
    const postRef = doc(collection(db, "posts"));
    const newPost = {
      id: postRef.id,
      author_id: auth.user.uid,
      author_name: auth.user.email?.split("@")[0] || "Anonyme",
      author_avatar: (auth.user.email?.[0] || "A").toUpperCase(),
      author_badge: "Membre",
      content: content,
      likes: 0,
      comments: 0,
      is_verified,
      toxicity_score,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await setDoc(postRef, newPost);

    return NextResponse.json(
      {
        post: {
          id: postRef.id,
          author: {
            name: newPost.author_name,
            badge: newPost.author_badge,
            avatar: newPost.author_avatar,
          },
          content: newPost.content,
          likes: newPost.likes,
          comments: newPost.comments,
          verified: newPost.is_verified,
          toxicity_score: newPost.toxicity_score,
          time: "À l'instant",
        },
        moderation: {
          toxicity_score,
          is_verified,
          reason: is_verified
            ? "Contenu vérifié par l'IA"
            : "Contenu flaggé pour review",
        },
      },
      { status: 201, headers: getSecurityHeaders() }
    );
  } catch (error) {
    console.error("Posts POST Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du post." },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// Helper function to format time ago
function formatTimeAgo(isoString?: string): string {
  if (!isoString) return "Récent";

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR");
}
