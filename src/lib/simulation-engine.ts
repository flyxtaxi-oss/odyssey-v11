// ==============================================================================
// SIMULATION ENGINE — Multi-Agent Life Prediction (Inspired by MiroFish OASIS)
// Simulates life scenarios with autonomous agents, temporal memory, and reports
// ==============================================================================

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AgentType = 'expat' | 'local' | 'employer' | 'admin' | 'landlord' | 'networker' | 'mentor';
export type ScenarioType = 'relocation' | 'career' | 'investment' | 'lifestyle' | 'social';
export type SimulationPhase = 'setup' | 'running' | 'complete' | 'failed';

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  personality: string;
  goals: string[];
  memory: AgentMemory[];
  influence: number; // 0-1, how much this agent affects outcomes
}

export interface AgentMemory {
  event: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  round: number;
  impact: number; // -1 to 1
}

export interface SimulationSeed {
  query: string;
  user_profile: UserProfile;
  scenario: ScenarioType;
  destination: string;
  time_horizon: number; // months
  rounds: number;
}

export interface UserProfile {
  nationality: string;
  current_location: string;
  budget: number;
  income: number;
  skills: string[];
  goals: string[];
  family_status: string;
  language_level: Record<string, number>;
}

export interface SimulationRound {
  round: number;
  events: SimulationEvent[];
  agent_interactions: AgentInteraction[];
  state: SimulationState;
}

export interface SimulationEvent {
  id: string;
  type: string;
  description: string;
  impact: number;
  affected_agents: string[];
  timestamp: string;
}

export interface AgentInteraction {
  agent_a: string;
  agent_b: string;
  type: string;
  outcome: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SimulationState {
  happiness: number;
  financial_health: number;
  social_integration: number;
  career_progress: number;
  language_progress: number;
  visa_status: string;
  network_size: number;
}

export interface SimulationReport {
  id: string;
  seed: SimulationSeed;
  phases: SimulationRound[];
  final_state: SimulationState;
  key_events: SimulationEvent[];
  recommendations: Recommendation[];
  success_score: number;
  timeline: TimelineEvent[];
  agent_summaries: AgentSummary[];
  created_at: string;
}

export interface Recommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
}

export interface TimelineEvent {
  month: number;
  event: string;
  impact: number;
  category: string;
}

export interface AgentSummary {
  agent: Agent;
  total_interactions: number;
  key_insights: string[];
  relationship_to_user: string;
}

// ─── Agent Templates ─────────────────────────────────────────────────────────

const AGENT_TEMPLATES: Record<AgentType, { names: string[]; personalities: string[]; goals: string[] }> = {
  expat: {
    names: ['Marco', 'Sarah', 'Yuki', 'Ahmed', 'Elena', 'Lucas', 'Priya'],
    personalities: ['optimiste et serviable', 'pragmatique et direct', 'curieux et aventureux'],
    goals: ['partager ses expériences', 'aider les nouveaux arrivants', 'trouver des opportunités'],
  },
  local: {
    names: ['João', 'Maria', 'Carlos', 'Ana', 'Miguel', 'Sofia', 'Rui'],
    personalities: ['accueillant et traditionnel', 'ouvert et moderne', 'réservé mais chaleureux'],
    goals: ['préserver la culture locale', 'aider les étrangers intégrés', 'développer le tourisme'],
  },
  employer: {
    names: ['TechCorp', 'StartupHub', 'GlobalFirm', 'LocalBiz', 'InnovateLab'],
    personalities: ['exigeant mais juste', 'flexible et innovant', 'structuré et stable'],
    goals: ['trouver les meilleurs talents', 'croître rapidement', 'maintenir la culture d\'entreprise'],
  },
  admin: {
    names: ['SEF', 'AIMA', 'Mairie', 'Consulat', 'Préfecture'],
    personalities: ['strict et procédurier', 'efficace mais lent', 'transparent et digitalisé'],
    goals: ['appliquer les lois', 'vérifier la conformité', 'faciliter les démarches légales'],
  },
  landlord: {
    names: ['Pedro', 'Inês', 'António', 'Teresa', 'Francisco'],
    personalities: ['arrangeant et flexible', 'strict sur les contrats', 'investisseur expérimenté'],
    goals: ['trouver des locataires fiables', 'maximiser le rendement', 'maintenir la propriété'],
  },
  networker: {
    names: ['ExpatMeetup', 'DigitalNomads', 'TechCommunity', 'BusinessClub'],
    personalities: ['connecteur naturel', 'organisateur d\'événements', 'influenceur communautaire'],
    goals: ['agrandir le réseau', 'créer des synergies', 'organiser des événements'],
  },
  mentor: {
    names: ['Dr. Silva', 'Prof. Costa', 'Coach Mendes', 'Expert Ferreira'],
    personalities: ['bienveillant et sage', 'direct et challengeant', 'patient et méthodique'],
    goals: ['guider les nouveaux', 'partager l\'expertise', 'construire des carrières'],
  },
};

// ─── Simulation Engine ───────────────────────────────────────────────────────

export class SimulationEngine {
  private agents: Agent[] = [];
  private rounds: SimulationRound[] = [];
  private state: SimulationState;
  private seed: SimulationSeed;
  private currentRound = 0;

  constructor(seed: SimulationSeed) {
    this.seed = seed;
    this.state = this.initializeState(seed);
  }

  private initializeState(seed: SimulationSeed): SimulationState {
    const { user_profile, destination } = seed;
    const baseHappiness = 60;
    const baseFinancial = Math.min(100, (user_profile.budget / 5000) * 100);
    const baseSocial = 20;
    const baseCareer = user_profile.skills.length > 3 ? 50 : 30;
    const baseLanguage = user_profile.language_level[destination] || 10;

    return {
      happiness: baseHappiness,
      financial_health: baseFinancial,
      social_integration: baseSocial,
      career_progress: baseCareer,
      language_progress: baseLanguage,
      visa_status: 'pending',
      network_size: 0,
    };
  }

  async initialize(): Promise<void> {
    this.agents = this.generateAgents();
    this.rounds = [];
    this.currentRound = 0;
  }

  private generateAgents(): Agent[] {
    const agents: Agent[] = [];
    const types: AgentType[] = ['expat', 'local', 'employer', 'admin', 'landlord', 'networker', 'mentor'];
    const agentsPerType = Math.max(2, Math.floor(this.seed.rounds / 10));

    for (const type of types) {
      const template = AGENT_TEMPLATES[type];
      for (let i = 0; i < agentsPerType; i++) {
        agents.push({
          id: `${type}_${i}_${Date.now()}`,
          type,
          name: template.names[i % template.names.length],
          personality: template.personalities[i % template.personalities.length],
          goals: [...template.goals],
          memory: [],
          influence: 0.5 + Math.random() * 0.5,
        });
      }
    }

    return agents;
  }

  async runRound(): Promise<SimulationRound | null> {
    if (this.currentRound >= this.seed.rounds) {
      return null;
    }

    this.currentRound++;
    const events: SimulationEvent[] = [];
    const interactions: AgentInteraction[] = [];

    // Generate events based on scenario
    const roundEvents = this.generateEvents(this.currentRound);
    events.push(...roundEvents);

    // Generate agent interactions
    const agentInteractions = this.generateInteractions(this.currentRound);
    interactions.push(...agentInteractions);

    // Update state
    this.updateState(events, interactions);

    // Update agent memories
    this.updateAgentMemories(events, interactions);

    const round: SimulationRound = {
      round: this.currentRound,
      events,
      agent_interactions: interactions,
      state: { ...this.state },
    };

    this.rounds.push(round);
    return round;
  }

  private generateEvents(round: number): SimulationEvent[] {
    const events: SimulationEvent[] = [];
    const { scenario, destination, user_profile } = this.seed;
    const monthProgress = Math.round((round / this.seed.rounds) * this.seed.time_horizon);

    // Scenario-specific events
    if (scenario === 'relocation') {
      if (round === 1) {
        events.push({
          id: `evt_visa_${round}`,
          type: 'visa_application',
          description: `Démarrage de la demande de visa pour ${destination}`,
          impact: 0.3,
          affected_agents: ['admin_0'],
          timestamp: `Mois ${monthProgress}`,
        });
      }
      if (round === Math.floor(this.seed.rounds * 0.3)) {
        events.push({
          id: `evt_housing_${round}`,
          type: 'housing_search',
          description: `Recherche de logement à ${destination} - Budget: ${user_profile.budget}€`,
          impact: 0.4,
          affected_agents: ['landlord_0', 'landlord_1'],
          timestamp: `Mois ${monthProgress}`,
        });
      }
      if (round === Math.floor(this.seed.rounds * 0.5)) {
        events.push({
          id: `evt_arrival_${round}`,
          type: 'arrival',
          description: `Arrivée à ${destination} - Première impression`,
          impact: 0.5,
          affected_agents: this.agents.slice(0, 5).map(a => a.id),
          timestamp: `Mois ${monthProgress}`,
        });
      }
    }

    if (scenario === 'career') {
      if (round === Math.floor(this.seed.rounds * 0.2)) {
        events.push({
          id: `evt_job_search_${round}`,
          type: 'job_search',
          description: 'Début de la recherche d\'emploi - Compétences: ' + user_profile.skills.join(', '),
          impact: 0.4,
          affected_agents: ['employer_0', 'employer_1', 'mentor_0'],
          timestamp: `Mois ${monthProgress}`,
        });
      }
      if (round === Math.floor(this.seed.rounds * 0.6)) {
        events.push({
          id: `evt_interview_${round}`,
          type: 'job_interview',
          description: 'Entretien d\'embauche prometteur',
          impact: 0.6,
          affected_agents: ['employer_0', 'mentor_0'],
          timestamp: `Mois ${monthProgress}`,
        });
      }
    }

    // Random events
    if (Math.random() > 0.6) {
      const randomEvents = [
        { type: 'networking_event', desc: 'Événement networking local', impact: 0.2 },
        { type: 'language_milestone', desc: 'Progression significative en langue locale', impact: 0.3 },
        { type: 'cultural_festival', desc: 'Festival culturel local - opportunité d\'intégration', impact: 0.2 },
        { type: 'policy_change', desc: 'Changement de politique d\'immigration', impact: 0.5 },
        { type: 'market_shift', desc: 'Évolution du marché du travail local', impact: 0.3 },
        { type: 'community_invite', desc: 'Invitation dans un groupe communautaire', impact: 0.25 },
      ];
      const evt = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      events.push({
        id: `evt_random_${round}`,
        type: evt.type,
        description: evt.desc,
        impact: evt.impact,
        affected_agents: this.agents.slice(0, 3).map(a => a.id),
        timestamp: `Mois ${monthProgress}`,
      });
    }

    return events;
  }

  private generateInteractions(round: number): AgentInteraction[] {
    const interactions: AgentInteraction[] = [];
    const numInteractions = Math.min(5, Math.floor(this.agents.length / 3));

    for (let i = 0; i < numInteractions; i++) {
      const agentA = this.agents[Math.floor(Math.random() * this.agents.length)];
      let agentB = this.agents[Math.floor(Math.random() * this.agents.length)];
      while (agentB.id === agentA.id) {
        agentB = this.agents[Math.floor(Math.random() * this.agents.length)];
      }

      const interactionTypes = [
        { type: 'conversation', outcomes: ['échange d\'informations', 'conseils pratiques', 'partage d\'expérience'] },
        { type: 'collaboration', outcomes: ['projet commun', 'recommandation professionnelle', 'introduction réseau'] },
        { type: 'conflict', outcomes: ['malentendu culturel', 'différence d\'attentes', 'résolution constructive'] },
        { type: 'mentorship', outcomes: ['guidance carrière', 'conseil intégration', 'support administratif'] },
      ];

      const interaction = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
      const outcome = interaction.outcomes[Math.floor(Math.random() * interaction.outcomes.length)];
      const sentiment: 'positive' | 'neutral' | 'negative' =
        Math.random() > 0.3 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative';

      interactions.push({
        agent_a: agentA.id,
        agent_b: agentB.id,
        type: interaction.type,
        outcome,
        sentiment,
      });
    }

    return interactions;
  }

  private updateState(events: SimulationEvent[], interactions: AgentInteraction[]): void {
    for (const event of events) {
      const impact = event.impact * (Math.random() > 0.5 ? 1 : -0.5);
      this.state.happiness = Math.max(0, Math.min(100, this.state.happiness + impact * 3));
      this.state.financial_health = Math.max(0, Math.min(100, this.state.financial_health + impact * 2));
    }

    for (const interaction of interactions) {
      const sentimentValue = interaction.sentiment === 'positive' ? 0.1 : interaction.sentiment === 'negative' ? -0.15 : 0;
      this.state.social_integration = Math.max(0, Math.min(100, this.state.social_integration + sentimentValue * 5));
      this.state.happiness = Math.max(0, Math.min(100, this.state.happiness + sentimentValue * 3));

      if (interaction.type === 'mentorship' && interaction.sentiment === 'positive') {
        this.state.career_progress = Math.max(0, Math.min(100, this.state.career_progress + 2));
      }
    }

    // Natural progression
    this.state.language_progress = Math.min(100, this.state.language_progress + 0.5);
    this.state.network_size = Math.floor(this.state.social_integration / 10);

    // Visa progression
    if (this.currentRound > this.seed.rounds * 0.3 && this.state.financial_health > 40) {
      this.state.visa_status = 'approved';
    }
  }

  private updateAgentMemories(events: SimulationEvent[], interactions: AgentInteraction[]): void {
    for (const event of events) {
      for (const agentId of event.affected_agents) {
        const agent = this.agents.find(a => a.id === agentId);
        if (agent) {
          agent.memory.push({
            event: event.description,
            sentiment: event.impact > 0 ? 'positive' : 'negative',
            round: this.currentRound,
            impact: event.impact,
          });
        }
      }
    }

    for (const interaction of interactions) {
      const agentA = this.agents.find(a => a.id === interaction.agent_a);
      const agentB = this.agents.find(a => a.id === interaction.agent_b);
      if (agentA) {
        agentA.memory.push({
          event: `${interaction.type} avec ${agentB?.name}: ${interaction.outcome}`,
          sentiment: interaction.sentiment,
          round: this.currentRound,
          impact: interaction.sentiment === 'positive' ? 0.3 : -0.2,
        });
      }
    }
  }

  generateReport(): SimulationReport {
    const keyEvents = this.rounds
      .flatMap(r => r.events)
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 10);

    const recommendations = this.generateRecommendations();
    const timeline = this.generateTimeline();
    const agentSummaries = this.generateAgentSummaries();

    const successScore = Math.round(
      this.state.happiness * 0.25 +
      this.state.financial_health * 0.25 +
      this.state.social_integration * 0.2 +
      this.state.career_progress * 0.15 +
      this.state.language_progress * 0.15
    );

    return {
      id: `sim_${Date.now()}`,
      seed: this.seed,
      phases: this.rounds,
      final_state: { ...this.state },
      key_events: keyEvents,
      recommendations,
      success_score: successScore,
      timeline,
      agent_summaries: agentSummaries,
      created_at: new Date().toISOString(),
    };
  }

  private generateRecommendations(): Recommendation[] {
    const recs: Recommendation[] = [];

    if (this.state.financial_health < 50) {
      recs.push({
        category: 'Finance',
        priority: 'high',
        title: 'Optimiser le budget',
        description: 'Vos finances sont tendues dans cette simulation',
        action: 'Réduire les coûts de logement de 20% ou augmenter les revenus',
      });
    }

    if (this.state.social_integration < 40) {
      recs.push({
        category: 'Social',
        priority: 'high',
        title: 'Renforcer le réseau social',
        description: 'L\'intégration sociale est un point faible',
        action: 'Rejoindre des groupes d\'expatriés et événements locaux',
      });
    }

    if (this.state.language_progress < 30) {
      recs.push({
        category: 'Langue',
        priority: 'medium',
        title: 'Accélérer l\'apprentissage',
        description: 'La barrière linguistique limite l\'intégration',
        action: 'Cours intensifs + immersion quotidienne (30min/jour)',
      });
    }

    if (this.state.career_progress < 40) {
      recs.push({
        category: 'Carrière',
        priority: 'medium',
        title: 'Développer le réseau professionnel',
        description: 'Les opportunités career sont limitées',
        action: 'LinkedIn local + événements industry + networking',
      });
    }

    if (this.state.happiness > 70) {
      recs.push({
        category: 'Bien-être',
        priority: 'low',
        title: 'Maintenir le momentum',
        description: 'Simulation positive - continuer sur cette trajectoire',
        action: 'Documenter les réussites et partager avec la communauté',
      });
    }

    return recs;
  }

  private generateTimeline(): TimelineEvent[] {
    return this.rounds
      .filter((_, i) => i % Math.max(1, Math.floor(this.seed.rounds / 12)) === 0)
      .map(r => {
        const month = Math.round((r.round / this.seed.rounds) * this.seed.time_horizon);
        const mainEvent = r.events.length > 0 ? r.events[0] : null;
        return {
          month,
          event: mainEvent?.description || 'Période de transition',
          impact: mainEvent?.impact || 0,
          category: mainEvent?.type || 'general',
        };
      });
  }

  private generateAgentSummaries(): AgentSummary[] {
    return this.agents
      .filter(a => a.memory.length > 0)
      .slice(0, 8)
      .map(agent => {
        const positiveMemories = agent.memory.filter(m => m.sentiment === 'positive').length;
        const totalMemories = agent.memory.length;
        const relationshipRatio = positiveMemories / Math.max(1, totalMemories);

        return {
          agent,
          total_interactions: totalMemories,
          key_insights: agent.memory.slice(-3).map(m => m.event),
          relationship_to_user: relationshipRatio > 0.6 ? 'allié' : relationshipRatio > 0.3 ? 'neutre' : 'challengeant',
        };
      });
  }

  getState(): SimulationState {
    return { ...this.state };
  }

  getAgents(): Agent[] {
    return this.agents;
  }

  getProgress(): number {
    return this.currentRound / this.seed.rounds;
  }

  isComplete(): boolean {
    return this.currentRound >= this.seed.rounds;
  }
}
