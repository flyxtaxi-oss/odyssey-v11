// ==============================================================================
// PREDICTION FOLLOW-UP — Track predicted vs actual outcomes
// ==============================================================================

import { useState, useCallback, useMemo } from 'react';

export interface PredictionFollowUp {
  id: string;
  prediction_id: string;
  user_id: string;
  
  // Original prediction
  predicted_destination: string;
  predicted_score: number;
  predicted_date: string;
  
  // Actual outcome (filled by user)
  actual_destination?: string;
  actual_date?: string;
  actual_score?: number;
  
  // Metrics comparison
  actual_happiness?: number;
  actual_financial?: number;
  actual_social?: number;
  actual_career?: number;
  
  // User feedback
  was_accurate: boolean | null;
  accuracy_notes?: string;
  lessons_learned?: string;
  
  status: 'pending' | 'in_progress' | 'completed';
  check_in_dates: string[];
  created_at: string;
  completed_at?: string;
}

export interface FollowUpStats {
  total_predictions: number;
  completed_checkins: number;
  average_accuracy: number;
  accuracy_trend: 'improving' | 'stable' | 'declining';
  most_accurate_destinations: { destination: string; accuracy: number }[];
}

const MOCK_FOLLOW_UPS: PredictionFollowUp[] = [
  {
    id: 'fu_1',
    prediction_id: 'pred_1',
    user_id: 'user_1',
    predicted_destination: 'Lisbonne',
    predicted_score: 78,
    predicted_date: '2024-10-01',
    actual_destination: 'Lisbonne',
    actual_date: '2024-12-15',
    actual_score: 82,
    actual_happiness: 85,
    actual_financial: 70,
    actual_social: 80,
    actual_career: 88,
    was_accurate: true,
    accuracy_notes: 'La prédiction était très proche de la réalité!',
    lessons_learned: 'Le réseau d\'expatriés était plus important que prévu',
    status: 'completed',
    check_in_dates: ['2024-11-01', '2024-12-15'],
    created_at: '2024-10-01',
    completed_at: '2024-12-15',
  },
  {
    id: 'fu_2',
    prediction_id: 'pred_2',
    user_id: 'user_1',
    predicted_destination: 'Dubaï',
    predicted_score: 65,
    predicted_date: '2024-11-15',
    was_accurate: null,
    status: 'pending',
    check_in_dates: ['2025-02-15'],
    created_at: '2024-11-15',
  },
];

export function usePredictionFollowUp(userId?: string) {
  const [followUps, setFollowUps] = useState<PredictionFollowUp[]>(MOCK_FOLLOW_UPS);

  // Derive pending check-ins from followUps (no state, no effect → no cascading renders)
  const pendingCheckIns = useMemo(() => {
    const now = new Date();
    return followUps.filter(fu => {
      if (fu.status === 'completed') return false;
      const nextCheckIn = fu.check_in_dates.find(date => new Date(date) <= now);
      return !!nextCheckIn;
    });
  }, [followUps]);

  const createFollowUp = useCallback(async (
    predictionId: string,
    predictedDestination: string,
    predictedScore: number,
    checkInMonths: number[] = [3, 6, 12]
  ): Promise<string> => {
    const now = new Date();
    const checkInDates = checkInMonths.map(months => {
      const date = new Date(now);
      date.setMonth(date.getMonth() + months);
      return date.toISOString().split('T')[0];
    });

    const newFollowUp: PredictionFollowUp = {
      id: `fu_${Date.now()}`,
      prediction_id: predictionId,
      user_id: userId || 'anonymous',
      predicted_destination: predictedDestination,
      predicted_score: predictedScore,
      predicted_date: now.toISOString().split('T')[0],
      was_accurate: null,
      status: 'pending',
      check_in_dates: checkInDates,
      created_at: now.toISOString(),
    };

    setFollowUps(prev => [...prev, newFollowUp]);
    return newFollowUp.id;
  }, [userId]);

  const submitCheckIn = useCallback(async (
    followUpId: string,
    data: {
      actual_destination: string;
      actual_date: string;
      actual_happiness: number;
      actual_financial: number;
      actual_social: number;
      actual_career: number;
      was_accurate: boolean;
      accuracy_notes?: string;
      lessons_learned?: string;
    }
  ): Promise<void> => {
    const actualScore = Math.round(
      (data.actual_happiness + data.actual_financial + data.actual_social + data.actual_career) / 4
    );

    setFollowUps(prev => prev.map(fu => {
      if (fu.id === followUpId) {
        return {
          ...fu,
          ...data,
          actual_score: actualScore,
          status: 'completed' as const,
          completed_at: new Date().toISOString(),
        };
      }
      return fu;
    }));
  }, []);

  const getStats = useCallback((): FollowUpStats => {
    const completed = followUps.filter(fu => fu.status === 'completed');
    
    if (completed.length === 0) {
      return {
        total_predictions: followUps.length,
        completed_checkins: 0,
        average_accuracy: 0,
        accuracy_trend: 'stable',
        most_accurate_destinations: [],
      };
    }

    // Calculate accuracy (how close predicted vs actual)
    const accuracies = completed.map(fu => {
      const scoreDiff = Math.abs(fu.predicted_score - (fu.actual_score || 0));
      return 100 - scoreDiff; // Convert to accuracy percentage
    });

    const averageAccuracy = Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length);

    // Group by destination
    const byDestination: Record<string, { total: number; count: number }> = {};
    completed.forEach(fu => {
      const dest = fu.predicted_destination;
      if (!byDestination[dest]) {
        byDestination[dest] = { total: 0, count: 0 };
      }
      byDestination[dest].total += accuracies[completed.indexOf(fu)];
      byDestination[dest].count += 1;
    });

    const mostAccurate = Object.entries(byDestination)
      .map(([dest, data]) => ({
        destination: dest,
        accuracy: Math.round(data.total / data.count),
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 3);

    return {
      total_predictions: followUps.length,
      completed_checkins: completed.length,
      average_accuracy: averageAccuracy,
      accuracy_trend: 'improving' as const, // Would calculate from history
      most_accurate_destinations: mostAccurate,
    };
  }, [followUps]);

  const getUpcomingCheckIns = useCallback((): { followUp: PredictionFollowUp; daysUntil: number }[] => {
    const now = new Date();
    const upcoming = followUps
      .filter(fu => fu.status !== 'completed')
      .map(fu => {
        const nextDate = fu.check_in_dates.find(d => new Date(d) >= now);
        if (!nextDate) return null;
        
        const days = Math.ceil((new Date(nextDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { followUp: fu, daysUntil: days };
      })
      .filter(Boolean) as { followUp: PredictionFollowUp; daysUntil: number }[];

    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [followUps]);

  const generateCheckInReminder = useCallback((followUp: PredictionFollowUp): string => {
    return `
🎯 Rappel de suivi - Odyssey AI

Il y a quelques mois, tu avais prédit: ${followUp.predicted_destination}
Score prédit: ${followUp.predicted_score}/100

🚀 Comment ça se passe?
- Tu as finalement déménagé à: ___________
- Ton score réel: ___________/100

Prends 2 minutes pour répondre et améliore nos prédictions!
odyssey-ai.app/follow-up/${followUp.id}
    `.trim();
  }, []);

  return {
    followUps,
    pendingCheckIns,
    createFollowUp,
    submitCheckIn,
    getStats,
    getUpcomingCheckIns,
    generateCheckInReminder,
  };
}

export default usePredictionFollowUp;