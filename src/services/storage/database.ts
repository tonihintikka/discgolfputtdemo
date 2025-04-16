import Dexie, { Table } from 'dexie';
import { StrideCalibration, DrillSession, PuttAttempt, DistanceMeasurement } from '../../types';

export class DiscGolfDatabase extends Dexie {
  // Define tables
  settings!: Table<StrideCalibration>;
  sessions!: Table<DrillSession>;
  attempts!: Table<PuttAttempt>;
  measurements!: Table<DistanceMeasurement>;

  constructor() {
    super('DiscGolfTrainingDB');
    
    // Define schema
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