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
  }
};

// Measurements Storage
export const measurementStorage = {
  getMeasurements: async (): Promise<DistanceMeasurement[]> => {
    return await db.measurements.toArray();
  },
  
  saveMeasurement: async (measurement: DistanceMeasurement): Promise<string> => {
    return await db.measurements.put(measurement);
  }
}; 