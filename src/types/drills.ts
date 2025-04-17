// Drill type definition
export interface DrillType {
  id: string;
  name: string;
  description: string;
  instructions: string | string[];
  icon: string;
  minDistance: number; // In meters
  maxDistance: number; // In meters
  rounds: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number; // Added optional estimatedTime property
}

// Drill attempt tracking
export interface PuttAttempt {
  id: string;
  drillId: string;
  round: number;
  distance: number; // In meters
  stance: string;
  result: 'hit' | 'miss';
  timestamp: number;
  notes?: string;
}

// Drill session
export interface DrillSession {
  id: string;
  drillTypeId: string;
  startTime: number;
  endTime?: number;
  completed: boolean;
  attempts: PuttAttempt[];
  summary?: {
    totalAttempts: number;
    madeAttempts: number;
    makePercentage: number;
  };
}

// Stance types
export type StanceType = 'normal' | 'straddle' | 'knee' | 'forehand' | 'turbo' | 'throw-in';

// Round configuration
export interface DrillRound {
  round: number;
  distance: number; // in meters
  stance?: StanceType;
  instructions?: string;
}

// Predefined drill configurations
export interface DrillConfig {
  drillType: DrillType;
  generateRounds: (options?: any) => DrillRound[];
} 