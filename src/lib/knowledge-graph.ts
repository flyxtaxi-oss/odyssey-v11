// ==============================================================================
// Personal Knowledge Graph (PKG) Interface
// Phase 8: Infinite Memory Foundation
// ==============================================================================

export type MemoryType = "preference" | "fact" | "goal" | "constraint" | "relationship" | "asset";

export type MemoryNode = {
  id: string;
  userId: string;
  type: MemoryType;
  content: string;
  confidence: number; // 0.0 to 1.0
  source: "user_explicit" | "inferred_chat" | "imported";
  createdAt: string;
  updatedAt: string;
};

// ─── Mock PKG Store (Until Vertex AI is connected) ─────────────────────────
// This stores basic facts per user in memory during development.

const mockKnowledgeGraph: Record<string, MemoryNode[]> = {};

/**
 * Extracts a fact from text and stores it in the user's Knowledge Graph.
 * In production, this will use Vertex AI to generate an embedding and store it in Vector Search.
 */
export async function ingestFact(userId: string, content: string, type: MemoryType = "fact", source: "user_explicit" | "inferred_chat" = "inferred_chat"): Promise<MemoryNode> {
  if (!mockKnowledgeGraph[userId]) {
    mockKnowledgeGraph[userId] = [];
  }

  const newNode: MemoryNode = {
    id: `node_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    userId,
    type,
    content,
    confidence: source === "user_explicit" ? 1.0 : 0.8,
    source,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockKnowledgeGraph[userId].push(newNode);
  console.log(`[PKG] Ingested new fact for ${userId}: "${content}" (${type})`);
  
  return newNode;
}

/**
 * Retrieves relevant facts based on a semantic query.
 * In production, this embeds the query via Vertex AI and searches the Vector DB.
 */
export async function retrieveRelevantFacts(userId: string, query: string, topK: number = 3): Promise<MemoryNode[]> {
  const userGraph = mockKnowledgeGraph[userId] || [];
  
  if (userGraph.length === 0) return [];

  // Mock semantic search: just returns the most recently added facts for now.
  // Real implementation will use Cosine Similarity on Embeddings.
  const sorted = [...userGraph].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  return sorted.slice(0, topK);
}

/**
 * Generates a context string from retrieved facts to inject into the LLM prompt.
 */
export function formatFactsForPrompt(facts: MemoryNode[]): string {
  if (facts.length === 0) return "";
  
  const formatted = facts.map(f => `- [${f.type.toUpperCase()}] ${f.content}`).join("\n");
  
  return `\n<personal_knowledge_graph>\n${formatted}\n</personal_knowledge_graph>\n`;
}
