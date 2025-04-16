# Epic-4 - Story-1

Local Data Storage

**As a** disc golfer
**I want** my practice data to be stored locally on my device
**so that** I can access my history and statistics without requiring internet connectivity.

## Status

In Progress

## Context

This story focuses on implementing local data storage for all application data using IndexedDB. This includes user settings, putting practice results, and distance measurement data. Local storage is essential for ensuring the app functions fully offline and preserves user data between sessions.

This builds upon the PWA foundation (Epic 1) and supports both the Putting Practice module (Epic 2) and Distance Measurement features (Epic 3).

## Estimation

Story Points: 2

## Tasks

1. - [x] Set up IndexedDB schema
   1. - [x] Define database structure using Dexie.js
   2. - [x] Create tables for settings, sessions, attempts, and measurements
   3. - [x] Configure indices for efficient queries

2. - [x] Implement Storage Service
   1. - [x] Create settings storage methods (calibration settings)
   2. - [x] Implement sessions storage methods (drill sessions)
   3. - [x] Implement attempts storage methods (putting attempts)
   4. - [x] Create measurements storage methods (distance measurements)

3. - [ ] Add History Viewing Capabilities
   1. - [x] Create practice history component
   2. - [x] Implement filters by date, drill type
   3. - [ ] Add detail view for past sessions

4. - [ ] Implement Data Management
   1. - [ ] Add data clearing functionality
   2. - [ ] Create backup mechanism (future)
   3. - [ ] Build data export feature (future)

## Constraints

- Must function completely offline
- Must persist data between sessions
- Should handle potential storage limitations gracefully
- Must maintain performance even with large datasets

## Data Models / Schema

```typescript
// Implemented in src/services/storage/database.ts

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
```

## Structure

Relevant files for this story:

```
src/
├── services/
│   └── storage/
│       ├── database.ts          # [x] IndexedDB setup with Dexie.js
│       └── storageService.ts    # [x] CRUD operations for all data types
├── components/
│   └── stats/
│       ├── PracticeHistory.tsx  # [ ] History listing component
│       └── SessionDetails.tsx   # [ ] Session detail view
├── types/
│   ├── index.ts                 # [x] Basic type definitions
│   └── drills.ts                # [x] Drill-specific types
└── pages/
    └── HistoryPage.tsx          # [ ] History page component
```

## Dev Notes

- Consider adding data validation before storing
- Balance between querying efficiency (indices) and storage efficiency
- IndexedDB has storage limits that vary by browser - handle gracefully
- May need paging for history views if the database grows large 