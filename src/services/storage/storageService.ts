import db from './database';
import { StrideCalibration, DistanceMeasurement } from '../../types';
import { DrillSession, PuttAttempt } from '../../types/drills';

// Settings Storage
export const settingsStorage = {
  getCalibration: async (userId: string): Promise<StrideCalibration | undefined> => {
    return await db.settings.get(userId);
  },
  
  saveCalibration: async (calibration: StrideCalibration): Promise<string> => {
    return await db.settings.put(calibration);
  },
  
  clearSettings: async (): Promise<void> => {
    return await db.settings.clear();
  }
};

// Sessions Storage
export const sessionStorage = {
  getSessions: async (): Promise<DrillSession[]> => {
    return await db.sessions.toArray();
  },
  
  getSession: async (id: string): Promise<DrillSession | undefined> => {
    return await db.sessions.get(id);
  },
  
  saveSession: async (session: DrillSession): Promise<string> => {
    return await db.sessions.put(session);
  },
  
  getSessionAttempts: async (sessionId: string): Promise<PuttAttempt[]> => {
    return await db.attempts.where('drillId').equals(sessionId).toArray();
  },
  
  saveAttempt: async (attempt: PuttAttempt): Promise<string> => {
    return await db.attempts.put(attempt);
  },
  
  clearSessions: async (): Promise<void> => {
    await db.sessions.clear();
    return await db.attempts.clear();
  },
  
  deleteSession: async (sessionId: string): Promise<void> => {
    await db.attempts.where('drillId').equals(sessionId).delete();
    return await db.sessions.delete(sessionId);
  }
};

// Measurements Storage
export const measurementStorage = {
  getMeasurements: async (): Promise<DistanceMeasurement[]> => {
    return await db.measurements.toArray();
  },
  
  saveMeasurement: async (measurement: DistanceMeasurement): Promise<string> => {
    return await db.measurements.put(measurement);
  },
  
  clearMeasurements: async (): Promise<void> => {
    return await db.measurements.clear();
  },
  
  deleteMeasurement: async (id: string): Promise<void> => {
    return await db.measurements.delete(id);
  }
};

// Data Management
export const dataManagement = {
  clearAllData: async (): Promise<void> => {
    await settingsStorage.clearSettings();
    await sessionStorage.clearSessions();
    await measurementStorage.clearMeasurements();
  },
  
  getStorageStats: async (): Promise<{ 
    settings: number; 
    sessions: number; 
    attempts: number;
    measurements: number;
    total: number;
  }> => {
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
  }
}; 