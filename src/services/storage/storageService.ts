import Dexie from 'dexie';
import { StrideCalibration, DistanceMeasurement } from '../../types';
import { DrillSession, PuttAttempt } from '../../types/drills';

// Define what we store in the settings table
interface KeyValuePair {
  key: string;
  value: any;
}

// Define session and attempt types for database storage
interface SessionRecord {
  id?: number;
  uuid?: string;        // Add a field to store original UUID string
  drillTypeId: string;
  startTime: number;
  endTime?: number;
  completed: boolean;
  summary?: {
    totalAttempts: number;
    madeAttempts: number;
    makePercentage: number;
  };
}

interface AttemptRecord {
  id?: number;
  sessionId: string;
  round: number;
  distance: number;
  stance: string;
  result: string;
  timestamp: number;
  notes?: string;
}

interface MeasurementRecord {
  id?: number;
  type: string;
  date: number | Date;
  value: number;
  unit: string;
  [key: string]: any;
}

// Database schema definition
class DiscGolfPuttDatabase extends Dexie {
  // Tables with proper initialization
  settings!: Dexie.Table<KeyValuePair, string>;
  sessions!: Dexie.Table<SessionRecord, number>;
  attempts!: Dexie.Table<AttemptRecord, number>;
  measurements!: Dexie.Table<MeasurementRecord, number>;
  
  constructor() {
    super('DiscGolfPuttDB');
    
    // Define tables and indexes
    this.version(1).stores({
      settings: 'key',                            // Settings stored by key
      sessions: '++id, drillTypeId, date, status',  // Drill sessions
      attempts: '++id, sessionId, roundIndex',    // Individual putt attempts
      measurements: '++id, type, date'            // Measurements like steps, distances
    });
    
    // Upgrade to version 2 - add uuid field to sessions
    this.version(2).stores({
      sessions: '++id, uuid, drillTypeId, date, status', // Added uuid field
    });
  }
}

// Create and open the database
const db = new DiscGolfPuttDatabase();

/**
 * Get an item from storage by key
 * @param key The key to retrieve
 * @returns The stored value or null if not found
 */
export async function getStorageItem<T>(key: string): Promise<T | null> {
  try {
    const result = await db.settings.get(key);
    return result?.value || null;
  } catch (error) {
    console.error(`Error getting storage item '${key}':`, error);
    return null;
  }
}

/**
 * Store an item in storage
 * @param key The key to store the value under
 * @param value The value to store
 * @returns Promise that resolves when storage is complete
 */
export async function setStorageItem<T>(key: string, value: T): Promise<void> {
  try {
    await db.settings.put({ key, value });
  } catch (error) {
    console.error(`Error setting storage item '${key}':`, error);
    throw error;
  }
}

/**
 * Remove an item from storage
 * @param key The key to remove
 * @returns Promise that resolves when removal is complete
 */
export async function removeStorageItem(key: string): Promise<void> {
  try {
    await db.settings.delete(key);
  } catch (error) {
    console.error(`Error removing storage item '${key}':`, error);
    throw error;
  }
}

/**
 * Retrieve all settings as an object
 * @returns Promise that resolves with all settings
 */
export async function getAllSettings(): Promise<Record<string, any>> {
  try {
    const allSettings = await db.settings.toArray();
    return allSettings.reduce((acc: Record<string, any>, item: KeyValuePair) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, any>);
  } catch (error) {
    console.error('Error getting all settings:', error);
    return {};
  }
}

/**
 * Store a drill session
 * @param session The session data to store
 * @returns The ID of the stored session
 */
export async function storeSession(session: SessionRecord): Promise<number> {
  try {
    return await db.sessions.add(session);
  } catch (error) {
    console.error('Error storing session:', error);
    throw error;
  }
}

/**
 * Update a drill session
 * @param id The session ID
 * @param sessionData The updated session data
 */
export async function updateSession(id: number, sessionData: Partial<SessionRecord>): Promise<void> {
  try {
    await db.sessions.update(id, sessionData);
  } catch (error) {
    console.error(`Error updating session ${id}:`, error);
    throw error;
  }
}

/**
 * Get a drill session by ID
 * @param id The session ID
 */
export async function getSession(id: number): Promise<SessionRecord | undefined> {
  try {
    return await db.sessions.get(id);
  } catch (error) {
    console.error(`Error getting session ${id}:`, error);
    throw error;
  }
}

/**
 * Get all sessions, optionally filtered
 * @param filters Optional filters to apply
 */
export async function getSessions(filters?: Partial<SessionRecord>): Promise<SessionRecord[]> {
  try {
    if (!filters) {
      return await db.sessions.toArray();
    }
    
    // Apply filters - this is a simple implementation
    // For more complex filtering, consider using Dexie's collection methods
    return await db.sessions
      .filter((session: SessionRecord) => {
        for (const [key, value] of Object.entries(filters)) {
          if (session[key as keyof SessionRecord] !== value) {
            return false;
          }
        }
        return true;
      })
      .toArray();
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
}

/**
 * Store an attempt
 * @param attempt The attempt data to store
 */
export async function storeAttempt(attempt: AttemptRecord): Promise<number> {
  try {
    return await db.attempts.add(attempt);
  } catch (error) {
    console.error('Error storing attempt:', error);
    throw error;
  }
}

/**
 * Get all attempts for a session
 * @param sessionId The session ID
 */
export async function getSessionAttempts(sessionId: number): Promise<AttemptRecord[]> {
  try {
    return await db.attempts
      .where('sessionId')
      .equals(sessionId)
      .toArray();
  } catch (error) {
    console.error(`Error getting attempts for session ${sessionId}:`, error);
    return [];
  }
}

/**
 * Store a measurement (like step count, distance)
 * @param measurement The measurement data to store
 */
export async function storeMeasurement(measurement: MeasurementRecord): Promise<number> {
  try {
    return await db.measurements.add(measurement);
  } catch (error) {
    console.error('Error storing measurement:', error);
    throw error;
  }
}

/**
 * Get measurements, optionally filtered by type and date range
 * @param type The measurement type
 * @param startDate Optional start date for range
 * @param endDate Optional end date for range
 */
export async function getMeasurements(
  type: string,
  startDate?: Date,
  endDate?: Date
): Promise<MeasurementRecord[]> {
  try {
    let collection = db.measurements.where('type').equals(type);
    
    if (startDate && endDate) {
      // Filter by date range if provided
      const startTimestamp = startDate.getTime();
      const endTimestamp = endDate.getTime();
      
      // Use Dexie's collection methods for filtering
      return await collection
        .toArray()
        .then(measurements => measurements.filter((m: MeasurementRecord) => {
          const timestamp = typeof m.date === 'object' && m.date.getTime ? m.date.getTime() : (m.date as number);
          return timestamp >= startTimestamp && timestamp <= endTimestamp;
        }));
    }
    
    return await collection.toArray();
  } catch (error) {
    console.error(`Error getting measurements of type ${type}:`, error);
    return [];
  }
}

// Export object-based APIs for backward compatibility
export const settingsStorage = {
  getCalibration: async (): Promise<StrideCalibration | null> => {
    return getStorageItem<StrideCalibration>('strideCalibration');
  },
  saveCalibration: async (calibration: StrideCalibration): Promise<void> => {
    return setStorageItem('strideCalibration', calibration);
  },
  getSettings: getStorageItem,
  saveSettings: setStorageItem,
  removeSettings: removeStorageItem,
  getAll: getAllSettings,
};

export const sessionStorage = {
  getSession: async (id: string | number): Promise<DrillSession | undefined> => {
    try {
      let sessionRecord: SessionRecord | undefined;
      
      // Check if id is a string that could be a UUID (not a numeric string)
      if (typeof id === 'string' && isNaN(Number(id))) {
        // For UUID strings, we need to find it by querying all sessions
        const allSessions = await getSessions();
        // Find the session with matching uuid field or string ID
        sessionRecord = allSessions.find(s => s.uuid === id || String(s.id) === id);
        console.log('Looking for UUID session:', id);
        console.log('Found session:', sessionRecord);
      } else {
        // Handle numeric IDs (either direct numbers or numeric strings)
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        sessionRecord = await getSession(numericId);
      }
      
      if (!sessionRecord) {
        return undefined;
      }
      
      // Get attempts for this session
      const attempts = await getSessionAttempts(sessionRecord.id as number);
      
      // Return a complete DrillSession object
      return {
        ...sessionRecord,
        // Return the original UUID if available, otherwise use the numeric ID as string
        id: sessionRecord.uuid || (sessionRecord.id !== undefined ? String(sessionRecord.id) : ''),
        attempts: attempts as unknown as PuttAttempt[]
      } as DrillSession;
    } catch (error) {
      console.error(`Error getting session ${id}:`, error);
      return undefined;
    }
  },
  saveSession: async (session: DrillSession): Promise<void> => {
    try {
      // Always extract the drill-related properties to avoid database schema mismatches
      const sessionData: SessionRecord = {
        drillTypeId: session.drillTypeId,
        startTime: session.startTime,
        endTime: session.endTime,
        completed: session.completed,
        summary: session.summary
      };
      
      // Store the original UUID if it's a string that's not a number
      if (typeof session.id === 'string' && isNaN(Number(session.id))) {
        sessionData.uuid = session.id;
      }
      
      // For new sessions with string IDs (like UUIDs), create a new DB record
      if (typeof session.id === 'string' && isNaN(Number(session.id))) {
        // Log for debugging
        console.log('Saving new session with UUID:', session.id);
        const newId = await storeSession(sessionData);
        console.log('Saved with DB ID:', newId);
      } 
      // For existing numeric IDs, update the record
      else if (typeof session.id === 'number' || !isNaN(Number(session.id))) {
        const numericId = typeof session.id === 'number' ? session.id : parseInt(session.id, 10);
        // Only update if we have a valid numeric ID
        if (!isNaN(numericId)) {
          await updateSession(numericId, sessionData);
        } else {
          // Fallback for invalid ID - just store it
          await storeSession(sessionData);
        }
      } 
      // Handle any other cases (shouldn't normally happen)
      else {
        await storeSession(sessionData);
      }
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  },
  saveAttempt: async (attempt: PuttAttempt): Promise<void> => {
    // Convert drillId to sessionId if needed
    const adaptedAttempt: AttemptRecord = {
      sessionId: attempt.drillId,
      round: attempt.round,
      distance: attempt.distance,
      stance: attempt.stance,
      result: attempt.result,
      timestamp: attempt.timestamp,
      notes: attempt.notes
    };
    await storeAttempt(adaptedAttempt);
  },
  getSessions,
  getSessionAttempts: async (sessionId: string | number): Promise<PuttAttempt[]> => {
    // Handle if sessionId is a string (for backward compatibility)
    const numericId = typeof sessionId === 'string' ? parseInt(sessionId, 10) : sessionId;
    const attempts = await getSessionAttempts(numericId);
    return attempts as unknown as PuttAttempt[];
  },
  getStartedDrillSessions: async (): Promise<DrillSession[]> => {
    // Get all sessions that have not been completed
    const sessions = await getSessions({ completed: false });
    
    // Create an array of session objects with empty attempts arrays
    const drillSessions = sessions.map(session => ({
      ...session,
      attempts: [] as PuttAttempt[]
    }));
    
    // For each session, try to fetch its attempts
    for (const session of drillSessions) {
      try {
        const sessionId = session.id;
        if (sessionId) {
          const attempts = await getSessionAttempts(sessionId);
          session.attempts = attempts as unknown as PuttAttempt[];
        }
      } catch (error) {
        console.error(`Error fetching attempts for session ${session.id}:`, error);
        // Keep the empty attempts array if there's an error
      }
    }
    
    return drillSessions as unknown as DrillSession[];
  },
  stopCurrentSession: async (sessionId: string | number): Promise<void> => {
    // Get the session
    const session = await sessionStorage.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with id ${sessionId} not found`);
    }
    
    // Mark it as completed with the current time
    const updatedSession = {
      ...session,
      completed: true,
      endTime: Date.now()
    };
    
    await sessionStorage.saveSession(updatedSession);
  },
  clearSessions: async (): Promise<void> => {
    try {
      await db.sessions.clear();
      await db.attempts.clear();
    } catch (error) {
      console.error('Error clearing sessions:', error);
      throw error;
    }
  }
};

export const measurementStorage = {
  saveMeasurement: async (measurement: DistanceMeasurement): Promise<void> => {
    await storeMeasurement(measurement as unknown as MeasurementRecord);
  },
  getMeasurements,
  clearMeasurements: async (): Promise<void> => {
    try {
      await db.measurements.clear();
    } catch (error) {
      console.error('Error clearing measurements:', error);
      throw error;
    }
  }
};

export const dataManagement = {
  getStorageStats: async (): Promise<{ settings: number; sessions: number; attempts: number; measurements: number; total: number }> => {
    try {
      const settingsCount = await db.settings.count();
      const sessionsCount = await db.sessions.count();
      const attemptsCount = await db.attempts.count();
      const measurementsCount = await db.measurements.count();
      
      return {
        settings: settingsCount,
        sessions: sessionsCount,
        attempts: attemptsCount,
        measurements: measurementsCount,
        total: settingsCount + sessionsCount + attemptsCount + measurementsCount
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { settings: 0, sessions: 0, attempts: 0, measurements: 0, total: 0 };
    }
  },
  
  clearAllData: async (): Promise<void> => {
    try {
      await db.settings.clear();
      await db.sessions.clear();
      await db.attempts.clear();
      await db.measurements.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
};

export default db; 