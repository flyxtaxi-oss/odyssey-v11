// ==============================================================================
// GRAPHRAG — Knowledge Graph + RAG for Odyssey
// Extracts entities from conversations, builds knowledge graph, enables RAG queries
// Inspired by MiroFish's GraphRAG approach
// ==============================================================================

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Entity {
  id: string;
  type: 'person' | 'place' | 'organization' | 'event' | 'skill' | 'visa' | 'goal' | 'preference';
  name: string;
  description?: string;
  properties: Record<string, string | number | boolean>;
  embeddings?: number[];
  confidence: number;
  first_mentioned: number;
  last_mentioned: number;
  mentions: number;
}

export interface Relation {
  id: string;
  from: string;
  to: string;
  type: 'has' | 'located_in' | 'works_at' | 'interested_in' | 'connected_to' | 'depends_on' | 'member_of';
  strength: number;
  first_mentioned: number;
}

export interface KnowledgeGraph {
  userId: string;
  entities: Map<string, Entity>;
  relations: Map<string, Relation>;
  lastUpdated: number;
  version: number;
}

export interface SearchResult {
  entity: Entity;
  score: number;
  context: string;
}

export interface ExtractionResult {
  entities: Partial<Entity>[];
  relations: Partial<Relation>[];
  summary: string;
  topics: string[];
}

// ─── Entity Extraction Patterns ─────────────────────────────────────────────

const ENTITY_PATTERNS = {
  person: /(?:je|mon|ma|mes)\s+(\w+)|^(\w+)\s+(?:dit|préfère|aime|déteste)/i,
  place: /(?:à|en|au)\s+([A-Z][a-zÀ-Ü]+(?:\s+[A-Z][a-zÀ-Ü]+)*)|vis(?:e|ent)\s+(?:à|en|au)\s+([A-Z][a-zÀ-Ü]+)/i,
  skill: /(?:compétence|skill|expert|spécialisé|en)\s+([a-zà-ü]+)|je\s+suis\s+(\w+)/i,
  visa: /(?:visa|permis|séjour|titre)\s+([a-zà-ü]+)|(?:D7|NHR|Golden|DTV)\s+([a-zà-ü]+)/i,
  goal: /(?:objectif|but|ambition| rêve|veux|voudrais)\s+([a-zà-ü\s]+)/i,
  preference: /(?:préfère|aime|déteste|adore|cherche|veut)\s+([a-zà-ü\s]+)/i,
};

// ─── GraphRAG Engine ─────────────────────────────────────────────────────────

export class GraphRAG {
  private graph: KnowledgeGraph;
  private maxEntities = 500;
  private maxRelations = 1000;

  constructor(userId: string) {
    this.graph = {
      userId,
      entities: new Map(),
      relations: new Map(),
      lastUpdated: Date.now(),
      version: 1,
    };
  }

  // Extract entities and relations from a conversation
  extract(text: string): ExtractionResult {
    const entities: Partial<Entity>[] = [];
    const relations: Partial<Relation>[] = [];
    const topics: string[] = [];
    const lines = text.split(/[.!?]/).filter(l => l.trim().length > 10);

    for (const line of lines) {
      const lower = line.toLowerCase();

      // Extract locations
      const locationMatch = line.match(/(?:à|en|au)\s+([A-Z][a-zÀ-Ü]+(?:\s+[A-Z][a-zÀ-Ü]+)*)/);
      if (locationMatch && !entities.find(e => e.name === locationMatch[1] && e.type === 'place')) {
        entities.push({
          type: 'place',
          name: locationMatch[1],
          properties: { source: line.trim() },
          confidence: 0.8,
        });
        topics.push('location');
      }

      // Extract skills
      const skillKeywords = ['développement', 'marketing', 'design', 'data', 'finance', 'sales', 'communication', 'management', 'coding', 'programming', 'coding'];
      for (const skill of skillKeywords) {
        if (lower.includes(skill) && !entities.find(e => e.name?.toLowerCase().includes(skill))) {
          entities.push({
            type: 'skill',
            name: skill.charAt(0).toUpperCase() + skill.slice(1),
            properties: { source: line.trim() },
            confidence: 0.7,
          });
          topics.push('skills');
        }
      }

      // Extract visa types
      const visaKeywords = ['d7', 'nhr', 'golden', 'dtv', 'freelancer', 'nomade', 'tourist', 'student'];
      for (const visa of visaKeywords) {
        if (lower.includes(visa)) {
          entities.push({
            type: 'visa',
            name: visa.toUpperCase(),
            properties: { source: line.trim() },
            confidence: 0.9,
          });
          topics.push('visa');
        }
      }

      // Extract goals
      if (lower.includes('objectif') || lower.includes('but') || lower.includes('veux') || lower.includes('rêve')) {
        const goalMatch = line.match(/(?:objectif|but|rêve|veux|voudrais)\s+(?:de\s+)?(.+)/i);
        if (goalMatch && !entities.find(e => e.type === 'goal')) {
          entities.push({
            type: 'goal',
            name: goalMatch[1].trim().slice(0, 50),
            properties: { source: line.trim() },
            confidence: 0.6,
          });
          topics.push('goals');
        }
      }

      // Extract preferences
      const prefKeywords = ['préfère', 'adore', 'déteste', 'aime beaucoup', 'pas fan'];
      for (const pref of prefKeywords) {
        if (lower.includes(pref)) {
          const prefMatch = line.match(new RegExp(`${pref}\\s+(.+?)(?:\\s+car|\\s+donc|\\s+pour|\\.)`, 'i'));
          if (prefMatch && !entities.find(e => e.type === 'preference')) {
            entities.push({
              type: 'preference',
              name: prefMatch[1].trim().slice(0, 50),
              properties: { source: line.trim(), sentiment: pref.includes('pas') || pref.includes('déteste') ? 'negative' : 'positive' },
              confidence: 0.7,
            });
            topics.push('preferences');
          }
        }
      }
    }

    // Generate summary
    const summary = this.generateSummary(text, entities);

    return { entities, relations, summary, topics: [...new Set(topics)] };
  }

  // Add extracted entities to the knowledge graph
  addExtraction(result: ExtractionResult): void {
    for (const entity of result.entities) {
      if (!entity.name || !entity.type) continue;

      const id = this.generateEntityId(entity.name, entity.type);
      const existing = this.graph.entities.get(id);

      if (existing) {
        existing.mentions++;
        existing.last_mentioned = Date.now();
        if (entity.properties) {
          existing.properties = { ...existing.properties, ...entity.properties } as Record<string, string | number | boolean>;
        }
        existing.confidence = Math.min(1, existing.confidence + 0.1);
      } else {
        const newEntity: Entity = {
          id,
          type: entity.type,
          name: entity.name,
          description: typeof entity.properties?.source === 'string' ? entity.properties.source : undefined,
          properties: (entity.properties as Record<string, string | number | boolean>) || {},
          confidence: entity.confidence || 0.5,
          first_mentioned: Date.now(),
          last_mentioned: Date.now(),
          mentions: 1,
        };

        if (this.graph.entities.size < this.maxEntities) {
          this.graph.entities.set(id, newEntity);
        }
      }
    }

    this.graph.lastUpdated = Date.now();
    this.graph.version++;
  }

  // Semantic search using keyword matching (simplified RAG)
  search(query: string, topK = 5): SearchResult[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
    const results: SearchResult[] = [];

    for (const entity of this.graph.entities.values()) {
      let score = 0;
      const nameLower = entity.name.toLowerCase();

      // Direct match
      for (const word of queryWords) {
        if (nameLower.includes(word)) score += 10;
      }

      // Description match
      if (entity.description) {
        const descLower = entity.description.toLowerCase();
        for (const word of queryWords) {
          if (descLower.includes(word)) score += 5;
        }
      }

      // Boost by confidence and mentions
      score += entity.confidence * 2 + (entity.mentions * 0.5);

      if (score > 0) {
        results.push({
          entity,
          score,
          context: entity.description || `${entity.type}: ${entity.name}`,
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  // Get context for a user query (RAG-style)
  getContext(query: string): string {
    const results = this.search(query, 5);
    if (results.length === 0) return '';

    const parts = ['=== KNOWLEDGE GRAPH CONTEXT ==='];
    
    // Group by type
    const byType: Record<string, string[]> = {};
    for (const r of results) {
      const type = r.entity.type;
      if (!byType[type]) byType[type] = [];
      byType[type].push(`• ${r.entity.name}: ${r.context}`);
    }

    for (const [type, items] of Object.entries(byType)) {
      parts.push(`[${type.toUpperCase()}]`);
      parts.push(...items);
    }

    return parts.join('\n');
  }

  // Get entity by type
  getEntitiesByType(type: Entity['type']): Entity[] {
    return Array.from(this.graph.entities.values()).filter(e => e.type === type);
  }

  // Get all entities
  getAllEntities(): Entity[] {
    return Array.from(this.graph.entities.values());
  }

  // Export graph as JSON
  export(): string {
    return JSON.stringify({
      entities: Array.from(this.graph.entities.entries()),
      relations: Array.from(this.graph.relations.entries()),
      lastUpdated: this.graph.lastUpdated,
      version: this.graph.version,
    }, null, 2);
  }

  // Import graph from JSON
  import(json: string): void {
    try {
      const data = JSON.parse(json);
      this.graph.entities = new Map(data.entities);
      this.graph.relations = new Map(data.relations);
      this.graph.lastUpdated = data.lastUpdated;
      this.graph.version = data.version;
    } catch (e) {
      console.error('Failed to import graph:', e);
    }
  }

  // Private helpers
  private generateEntityId(name: string, type: string): string {
    return `${type}_${name.toLowerCase().replace(/\s+/g, '_')}`;
  }

  private generateSummary(text: string, entities: Partial<Entity>[]): string {
    const lines = text.split(/[.!?]/).filter(l => l.trim().length > 20).slice(0, 3);
    return lines.join('. ').slice(0, 200);
  }
}

// ─── Global Store (In-Memory) ───────────────────────────────────────────────

const userGraphs = new Map<string, GraphRAG>();

export function getGraphRAG(userId: string): GraphRAG {
  if (!userGraphs.has(userId)) {
    userGraphs.set(userId, new GraphRAG(userId));
  }
  return userGraphs.get(userId)!;
}

export function updateGraphFromConversation(userId: string, userMessage: string, aiResponse: string): void {
  const graph = getGraphRAG(userId);
  const combined = `${userMessage} ${aiResponse}`;
  const extraction = graph.extract(combined);
  graph.addExtraction(extraction);
}

export function getContextForQuery(userId: string, query: string): string {
  const graph = getGraphRAG(userId);
  return graph.getContext(query);
}