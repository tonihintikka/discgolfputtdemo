import { v4 as uuidv4 } from 'uuid';
import { DrillType, DrillRound, DrillSession, PuttAttempt, StanceType, DrillConfig } from '../types/drills';
import { sessionStorage } from './storage/storageService';

// Extended drill type with actual rounds array for display
interface DrillWithRounds extends Omit<DrillType, 'rounds'> {
  rounds: DrillRound[];
}

// Predefined drill types
const drillTypes: DrillType[] = [
  {
    id: 'circle-1x',
    name: 'Circle 1X',
    description: 'Practice putt from 3-10 meters (10-33 feet)',
    instructions: 'Take 5 putts from each distance. Focus on consistent form and confident release.',
    icon: 'sports_golf', // Updated to sports_golf icon
    minDistance: 3,
    maxDistance: 10,
    rounds: 20,
    difficulty: 'beginner',
  },
  {
    id: 'circle-2',
    name: 'Circle 2',
    description: 'Practice putt from 10-20 meters (33-66 feet)',
    instructions: 'Take 5 putts from each distance. Focus on distance control and arc.',
    icon: 'track_changes', // Updated to track_changes for precision/targeting
    minDistance: 10,
    maxDistance: 20,
    rounds: 15,
    difficulty: 'intermediate',
  },
  {
    id: '5-5-putts',
    name: '5/5 Putts Game',
    description: 'Make 5 consecutive putts to advance to the next station',
    instructions: 'Start at the closest distance. Make 5 consecutive putts to advance to the next distance. Miss a putt and you start over at that distance.',
    icon: 'filter_5', // Updated to filter_5 to represent the 5/5 concept
    minDistance: 3,
    maxDistance: 12,
    rounds: 5,
    difficulty: 'advanced',
  }
];

// Generate rounds for Circle 1X drill
const generateCircle1XRounds = (count: number = 20): DrillRound[] => {
  const rounds: DrillRound[] = [];
  const stances: StanceType[] = ['normal', 'straddle', 'knee'];
  
  // Create evenly distributed distances between min and max
  const minDistance = 3;
  const maxDistance = 10;
  const step = (maxDistance - minDistance) / (count / stances.length);
  
  for (let i = 0; i < count; i++) {
    const stanceIndex = i % stances.length;
    const distanceOffset = Math.floor(i / stances.length) * step;
    const distance = parseFloat((minDistance + distanceOffset).toFixed(1));
    
    rounds.push({
      round: i + 1,
      distance: Math.min(distance, maxDistance),
      stance: stances[stanceIndex],
    });
  }
  
  return rounds;
};

// Generate rounds for Circle 2 drill
const generateCircle2Rounds = (count: number = 15): DrillRound[] => {
  const rounds: DrillRound[] = [];
  const stances: StanceType[] = ['normal', 'straddle'];
  
  // Create evenly distributed distances between min and max
  const minDistance = 10;
  const maxDistance = 20;
  const step = (maxDistance - minDistance) / (count / stances.length);
  
  for (let i = 0; i < count; i++) {
    const stanceIndex = i % stances.length;
    const distanceOffset = Math.floor(i / stances.length) * step;
    const distance = parseFloat((minDistance + distanceOffset).toFixed(1));
    
    rounds.push({
      round: i + 1,
      distance: Math.min(distance, maxDistance),
      stance: stances[stanceIndex],
    });
  }
  
  return rounds;
};

// Generate rounds for 5/5 Putts game
const generate5of5Rounds = (): DrillRound[] => {
  const distances = [3, 5, 7, 9, 12];
  
  return distances.map((distance, index) => ({
    round: index + 1,
    distance,
    stance: 'normal',
    instructions: `Make 5 consecutive putts at ${distance}m (${Math.round(distance * 3.28084)}ft)`,
  }));
};

// Drill configurations
export const drillConfigs: Record<string, DrillConfig> = {
  'circle-1x': {
    drillType: drillTypes.find(drill => drill.id === 'circle-1x')!,
    generateRounds: generateCircle1XRounds,
  },
  'circle-2': {
    drillType: drillTypes.find(drill => drill.id === 'circle-2')!,
    generateRounds: generateCircle2Rounds,
  },
  '5-5-putts': {
    drillType: drillTypes.find(drill => drill.id === '5-5-putts')!,
    generateRounds: generate5of5Rounds,
  },
};

// Create a new drill session
export const createDrillSession = (drillTypeId: string): DrillSession => {
  const session: DrillSession = {
    id: uuidv4(),
    drillTypeId,
    startTime: Date.now(),
    completed: false,
    attempts: [],
  };
  
  return session;
};

// Record a putt attempt
export const recordPuttAttempt = async (
  session: DrillSession,
  round: number,
  distance: number,
  stance: string,
  result: 'hit' | 'miss',
  notes?: string
): Promise<DrillSession> => {
  const attempt: PuttAttempt = {
    id: uuidv4(),
    drillId: session.id,
    round,
    distance,
    stance,
    result,
    timestamp: Date.now(),
    notes,
  };
  
  const updatedSession = {
    ...session,
    attempts: [...session.attempts, attempt],
  };
  
  try {
    await sessionStorage.saveAttempt(attempt);
    await sessionStorage.saveSession(updatedSession);
  } catch (error) {
    console.error('Failed to save attempt', error);
  }
  
  return updatedSession;
};

// Complete a drill session
export const completeDrillSession = async (session: DrillSession): Promise<DrillSession> => {
  const totalAttempts = session.attempts.length;
  const madeAttempts = session.attempts.filter(attempt => attempt.result === 'hit').length;
  const makePercentage = totalAttempts > 0 ? (madeAttempts / totalAttempts) * 100 : 0;
  
  const completedSession: DrillSession = {
    ...session,
    endTime: Date.now(),
    completed: true,
    summary: {
      totalAttempts,
      madeAttempts,
      makePercentage,
    },
  };
  
  try {
    await sessionStorage.saveSession(completedSession);
  } catch (error) {
    console.error('Failed to save completed session', error);
  }
  
  return completedSession;
};

// Get all drill types
export const getDrillTypes = (): DrillType[] => {
  return drillTypes;
};

// Get a specific drill type
export const getDrillType = (id: string): DrillType | undefined => {
  return drillTypes.find(drill => drill.id === id);
};

// Get a specific drill with its rounds and details
export const getDrillById = async (id: string): Promise<DrillWithRounds | null> => {
  const drillType = getDrillType(id);
  if (!drillType) return null;
  
  // Generate the rounds for this drill
  const roundsArray = getDrillRounds(id);
  
  // Return a complete drill object with rounds
  return {
    ...drillType,
    rounds: roundsArray
  };
};

// Start a new drill session
export const startDrillSession = async (drillId: string): Promise<string> => {
  const session = createDrillSession(drillId);
  
  try {
    await sessionStorage.saveSession(session);
    return session.id;
  } catch (error) {
    console.error('Failed to save session', error);
    throw new Error('Failed to start drill session');
  }
};

// Get rounds for a specific drill
export const getDrillRounds = (drillTypeId: string): DrillRound[] => {
  const config = drillConfigs[drillTypeId];
  if (!config) return [];
  
  return config.generateRounds();
}; 