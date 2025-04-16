import Dexie from 'dexie';
import { StrideCalibration, DrillSession, PuttAttempt, DistanceMeasurement } from '../../types';

// Define specific tables structure with proper typing
export class DiscGolfDatabase extends Dexie {
  // Define tables with proper Dexie.Table typing
  settings!: Dexie.Table<StrideCalibration, string>; // Primary key is userId
  sessions!: Dexie.Table<DrillSession, string>; // Primary key is id
  attempts!: Dexie.Table<PuttAttempt, string>; // Primary key is id
  measurements!: Dexie.Table<DistanceMeasurement, string>; // Primary key is id

  constructor() {
    super('DiscGolfTrainingDB');
    
    // Define schema with proper type support
    this.version(1).stores({
      settings: 'userId,calibrationDate',
      sessions: 'id,drillTypeId,startTime,completed',
      attempts: 'id,drillId,round,timestamp',
      measurements: 'id,timestamp'
    });
  }
}

const db = new DiscGolfDatabase();
export default db; 