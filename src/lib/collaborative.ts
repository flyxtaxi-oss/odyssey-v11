// ==============================================================================
// COLLABORATIVE PREDICTION — Compare predictions with friends
// ==============================================================================

import { useState, useCallback } from 'react';

export interface UserPrediction {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  score: number;
  destination: string;
  scenario: string;
  metrics: {
    happiness: number;
    financial: number;
    social: number;
    career: number;
  };
  created_at: string;
}

export interface CollaborativeSession {
  id: string;
  title: string;
  query: string;
  participants: UserPrediction[];
  status: 'waiting' | 'active' | 'completed';
  created_at: string;
  expires_at: string;
}

// Mock collaborative data (would be stored in Firestore)
const MOCK_SESSIONS: CollaborativeSession[] = [
  {
    id: 'session_1',
    title: 'Qui a la meilleure prédiction?',
    query: 'Qui devrait move à Lisbonne en 2025?',
    participants: [
      {
        id: 'p1',
        user_id: 'user_1',
        user_name: 'Marco',
        score: 78,
        destination: 'Lisbonne',
        scenario: 'relocation',
        metrics: { happiness: 82, financial: 65, social: 75, career: 80 },
        created_at: '2025-01-15T10:00:00Z',
      },
      {
        id: 'p2',
        user_id: 'user_2',
        user_name: 'Sarah',
        score: 85,
        destination: 'Lisbonne',
        scenario: 'relocation',
        metrics: { happiness: 88, financial: 72, social: 90, career: 85 },
        created_at: '2025-01-15T10:30:00Z',
      },
      {
        id: 'p3',
        user_id: 'user_3',
        user_name: 'Yuki',
        score: 71,
        destination: 'Porto',
        scenario: 'relocation',
        metrics: { happiness: 75, financial: 80, social: 60, career: 68 },
        created_at: '2025-01-15T11:00:00Z',
      },
    ],
    status: 'completed',
    created_at: '2025-01-15T10:00:00Z',
    expires_at: '2025-01-22T10:00:00Z',
  },
];

export function useCollaborative() {
  const [sessions, setSessions] = useState<CollaborativeSession[]>(MOCK_SESSIONS);
  const [currentSession, setCurrentSession] = useState<CollaborativeSession | null>(null);

  const createSession = useCallback(async (query: string, userPrediction: UserPrediction): Promise<string> => {
    const newSession: CollaborativeSession = {
      id: `session_${Date.now()}`,
      title: `Prédiction: ${query.slice(0, 30)}...`,
      query,
      participants: [userPrediction],
      status: 'waiting',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setSessions(prev => [...prev, newSession]);
    return newSession.id;
  }, []);

  const joinSession = useCallback(async (sessionId: string, userPrediction: UserPrediction): Promise<boolean> => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || session.status === 'completed') return false;
    if (session.participants.find(p => p.user_id === userPrediction.user_id)) return false;

    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          participants: [...s.participants, userPrediction],
          status: s.participants.length >= 2 ? 'active' : 'waiting',
        };
      }
      return s;
    }));

    return true;
  }, [sessions]);

  const getLeaderboard = useCallback((sessionId: string): UserPrediction[] => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return [];
    
    return [...session.participants].sort((a, b) => b.score - a.score);
  }, [sessions]);

  const getComparison = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || session.participants.length < 2) return null;

    const participants = session.participants;
    const comparison = {
      best_happiness: participants.reduce((best, p) => p.metrics.happiness > best.metrics.happiness ? p : best),
      best_financial: participants.reduce((best, p) => p.metrics.financial > best.metrics.financial ? p : best),
      best_social: participants.reduce((best, p) => p.metrics.social > best.metrics.social ? p : best),
      best_career: participants.reduce((best, p) => p.metrics.career > best.metrics.career ? p : best),
      overall_winner: participants.reduce((best, p) => p.score > best.score ? p : best),
    };

    return comparison;
  }, [sessions]);

  const generateShareText = useCallback((session: CollaborativeSession): string => {
    const leaderboard = getLeaderboard(session.id);
    const winner = leaderboard[0];
    
    return `🎯 Challenge Prédiction Odyssey!
    
🏆 Gagnant: ${winner.user_name} (${winner.score}/100)
${leaderboard.slice(1).map((p, i) => `${i + 2}. ${p.user_name}: ${p.score}`).join('\n')}

Défie tes amis: odyssey-ai.app/predict
#OdysseyAI #Prédiction`;
  }, [getLeaderboard]);

  return {
    sessions,
    currentSession,
    setCurrentSession,
    createSession,
    joinSession,
    getLeaderboard,
    getComparison,
    generateShareText,
  };
}

// Challenge templates
export const CHALLENGE_TEMPLATES = [
  {
    id: 'best_country_2025',
    title: 'Quel est le meilleur pays pour les devs en 2025?',
    description: 'Découvrez quel pays offre le meilleur équilibre salary/quality of life',
  },
  {
    id: 'best_visa',
    title: 'Quel visa numérique est le plus avantageux?',
    description: 'Comparez les différents programmes de visa digital nomad',
  },
  {
    id: 'best_city_family',
    title: 'Meilleure ville pour élever une famille',
    description: 'Trouvez la meilleure destination pour une vie de famille à l\'international',
  },
  {
    id: 'best_tax_regime',
    title: 'Quel pays a le meilleur régime fiscal?',
    description: 'Comparez les régimes NHR, golden visa et autres avantages',
  },
  {
    id: 'best_surfer',
    title: 'Meilleure ville pour les surfeurs',
    description: 'Trouvez la destination parfaite entre vague et remote work',
  },
];

export default useCollaborative;