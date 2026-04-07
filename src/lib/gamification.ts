// ==============================================================================
// GAMIFICATION — Leaderboard, badges, achievements, XP system
// ==============================================================================

import { useState, useCallback, useMemo } from 'react';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  badges: Badge[];
  stats: UserStats;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserStats {
  total_predictions: number;
  predictions_shared: number;
  predictions_accurate: number;
  friends_invited: number;
  community_posts: number;
  simulations_run: number;
  longest_streak: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  trend: 'up' | 'down' | 'same';
}

// XP & Level calculations
const XP_PER_LEVEL = 1000;
const XP_ACTIONS = {
  prediction_created: 50,
  prediction_shared: 20,
  prediction_accurate: 100,
  friend_invited: 75,
  check_in_completed: 30,
  community_post: 40,
  streak_day: 10,
};

// Badge definitions
export const BADGE_DEFINITIONS: (Omit<Badge, 'earned_at'> & { rarity: Badge['rarity'] })[] = [
  // Common badges
  { id: 'first_prediction', name: 'Premier Pas', description: 'Crée ta première prédiction', icon: '🌱', rarity: 'common' },
  { id: 'first_share', name: 'Partageur', description: 'Partage une prédiction', icon: '📤', rarity: 'common' },
  { id: 'first_checkin', name: 'Suiveur', description: 'Complète ton premier check-in', icon: '✅', rarity: 'common' },
  
  // Rare badges
  { id: 'prediction_master', name: 'Maître Prédicteur', description: '10 prédictions créées', icon: '🎯', rarity: 'rare' },
  { id: 'social_butterfly', name: 'Papillon Social', description: 'Invite 5 amis', icon: '🦋', rarity: 'rare' },
  { id: 'accurate_pro', name: 'Précis Pro', description: '3 prédictions justes', icon: '🎯', rarity: 'rare' },
  
  // Epic badges
  { id: 'globetrotter', name: 'Tour du Monde', description: 'Prédis 5 pays différents', icon: '🌍', rarity: 'epic' },
  { id: 'viral_creator', name: 'Créateur Viral', description: '10 parts, 100+ vues', icon: '🔥', rarity: 'epic' },
  { id: 'oracle', name: 'Oracle', description: 'Prédictions à 90%+ d\'exactitude', icon: '🔮', rarity: 'epic' },
  
  // Legendary badges
  { id: 'legend', name: 'Légende Odyssey', description: 'Atteins le niveau max', icon: '👑', rarity: 'legendary' },
  { id: 'community_leader', name: 'Leader Communautaire', description: 'Top 10 pendant 30 jours', icon: '🏆', rarity: 'legendary' },
  { id: 'prediction_god', name: 'Dieu des Prédictions', description: '100 prédictions, 80%+ exactitude', icon: '⚡', rarity: 'legendary' },
];

// Leaderboard types
export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';

export function useGamification(currentUserId?: string) {
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user_1',
      name: 'Marco',
      avatar: undefined,
      xp: 4500,
      level: 4,
      badges: [
        { ...BADGE_DEFINITIONS[0], earned_at: '2024-10-01' } as Badge,
        { ...BADGE_DEFINITIONS[3], earned_at: '2024-11-15' } as Badge,
      ],
      stats: { total_predictions: 15, predictions_shared: 8, predictions_accurate: 5, friends_invited: 3, community_posts: 2, simulations_run: 12, longest_streak: 7 },
    },
    {
      id: 'user_2',
      name: 'Sarah',
      avatar: undefined,
      xp: 6200,
      level: 6,
      badges: [
        { ...BADGE_DEFINITIONS[0], earned_at: '2024-09-15' } as Badge,
        { ...BADGE_DEFINITIONS[3], earned_at: '2024-10-20' } as Badge,
        { ...BADGE_DEFINITIONS[6], earned_at: '2024-12-01' } as Badge,
      ],
      stats: { total_predictions: 23, predictions_shared: 12, predictions_accurate: 8, friends_invited: 7, community_posts: 5, simulations_run: 18, longest_streak: 14 },
    },
    {
      id: 'user_3',
      name: 'Yuki',
      avatar: undefined,
      xp: 3800,
      level: 3,
      badges: [
        { ...BADGE_DEFINITIONS[0], earned_at: '2024-11-01' } as Badge,
      ],
      stats: { total_predictions: 8, predictions_shared: 5, predictions_accurate: 2, friends_invited: 1, community_posts: 1, simulations_run: 6, longest_streak: 3 },
    },
  ]);

  const [currentUser, setCurrentUser] = useState<User>({
    id: currentUserId || 'current',
    name: 'Toi',
    xp: 1500,
    level: 1,
    badges: [
      { ...BADGE_DEFINITIONS[0], earned_at: '2025-01-01' } as Badge,
    ],
    stats: { total_predictions: 3, predictions_shared: 1, predictions_accurate: 0, friends_invited: 0, community_posts: 0, simulations_run: 5, longest_streak: 1 },
  });

  // Calculate level from XP
  const calculateLevel = useCallback((xp: number): number => {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
  }, []);

  // Calculate XP needed for next level
  const xpToNextLevel = useCallback((xp: number): number => {
    const currentLevel = calculateLevel(xp);
    return (currentLevel * XP_PER_LEVEL) - xp;
  }, [calculateLevel]);

  // Add XP and check for level up
  const addXP = useCallback((amount: number): { leveledUp: boolean; newLevel: number } => {
    const newXP = currentUser.xp + amount;
    const oldLevel = currentUser.level;
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > oldLevel;

    setCurrentUser(prev => ({
      ...prev,
      xp: newXP,
      level: newLevel,
    }));

    return { leveledUp, newLevel };
  }, [currentUser, calculateLevel]);

  // Award badge if not already earned
  const awardBadge = useCallback((badgeId: string): boolean => {
    const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!badgeDef) return false;
    
    const alreadyHas = currentUser.badges.some(b => b.id === badgeId);
    if (alreadyHas) return false;

    const newBadge: Badge = {
      ...badgeDef,
      earned_at: new Date().toISOString(),
    };

    setCurrentUser(prev => ({
      ...prev,
      badges: [...prev.badges, newBadge],
    }));

    return true;
  }, [currentUser]);

  // Record action and award XP
  const recordAction = useCallback((action: keyof typeof XP_ACTIONS) => {
    const xp = XP_ACTIONS[action];
    const result = addXP(xp);

    // Update stats
    setCurrentUser(prev => {
      const newStats = { ...prev.stats };
      switch (action) {
        case 'prediction_created':
          newStats.total_predictions++;
          break;
        case 'prediction_shared':
          newStats.predictions_shared++;
          break;
        case 'prediction_accurate':
          newStats.predictions_accurate++;
          break;
        case 'friend_invited':
          newStats.friends_invited++;
          break;
        case 'check_in_completed':
          newStats.longest_streak++;
          break;
        case 'community_post':
          newStats.community_posts++;
          break;
      }
      return { ...prev, stats: newStats };
    });

    return result;
  }, [addXP]);

  // Get leaderboard
  const getLeaderboard = useCallback((period: LeaderboardPeriod = 'weekly'): LeaderboardEntry[] => {
    const allUsers = [...users, currentUser].sort((a, b) => b.xp - a.xp);
    
    return allUsers.map((user, index) => ({
      rank: index + 1,
      user,
      score: user.xp,
      trend: index < 3 ? 'up' : 'same' as const,
    }));
  }, [users, currentUser]);

  // Check if user qualifies for badge
  const checkBadges = useCallback((): string[] => {
    const earned: string[] = [];
    const stats = currentUser.stats;

    // First prediction
    if (stats.total_predictions >= 1 && !currentUser.badges.some(b => b.id === 'first_prediction')) {
      earned.push('first_prediction');
    }
    // First share
    if (stats.predictions_shared >= 1 && !currentUser.badges.some(b => b.id === 'first_share')) {
      earned.push('first_share');
    }
    // Prediction master
    if (stats.total_predictions >= 10 && !currentUser.badges.some(b => b.id === 'prediction_master')) {
      earned.push('prediction_master');
    }
    // Social butterfly
    if (stats.friends_invited >= 5 && !currentUser.badges.some(b => b.id === 'social_butterfly')) {
      earned.push('social_butterfly');
    }
    // Accurate pro
    if (stats.predictions_accurate >= 3 && !currentUser.badges.some(b => b.id === 'accurate_pro')) {
      earned.push('accurate_pro');
    }

    return earned;
  }, [currentUser]);

  // Progress to next badge
  const getProgress = useCallback((badgeId: string): number => {
    const badge = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!badge) return 0;

    const stats = currentUser.stats;
    let current = 0;
    let required = 1;

    switch (badgeId) {
      case 'first_prediction':
        current = stats.total_predictions;
        required = 1;
        break;
      case 'prediction_master':
        current = stats.total_predictions;
        required = 10;
        break;
      case 'social_butterfly':
        current = stats.friends_invited;
        required = 5;
        break;
      case 'accurate_pro':
        current = stats.predictions_accurate;
        required = 3;
        break;
    }

    return Math.min(100, (current / required) * 100);
  }, [currentUser]);

  // Generate share text for achievements
  const getShareText = useCallback((badge: Badge): string => {
    return `🏆 J'ai décroché le badge "${badge.name}" sur Odyssey AI!

${badge.description}

Défie-moi: odyssey-ai.app
#OdysseyAI #Badge #${badge.name.replace(' ', '')}`;
  }, []);

  return {
    currentUser,
    users,
    addXP,
    awardBadge,
    recordAction,
    getLeaderboard,
    checkBadges,
    getProgress,
    getShareText,
    xpToNextLevel,
    calculateLevel,
    BADGE_DEFINITIONS,
  };
}

export default useGamification;