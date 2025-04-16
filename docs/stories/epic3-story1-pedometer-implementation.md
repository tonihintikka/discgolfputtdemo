# Epic-3 - Story-1

Pedometer Implementation

**As a** disc golfer
**I want** to measure distances accurately by walking using my phone's motion sensors
**so that** I can easily check distances on the course without extra equipment.

## Status

In Progress

## Context

This story focuses on implementing the core pedometer functionality using the device's accelerometer. It involves capturing motion data, counting steps, allowing stride length calibration, and providing basic controls. This feature is crucial for enabling quick distance checks during practice or casual rounds.

This story builds upon the PWA foundation (Epic 1) and utilizes the local storage setup (Epic 4) for saving calibration settings.

## Estimation

Story Points: 3

## Tasks

1.  - [x] Create accelerometer data capture using DeviceMotionEvent (`useStepDetector` hook)
2.  - [x] Implement basic step counting algorithm (magnitude threshold)
3.  - [x] Build basic UI for distance meter (`DistanceMeter` component)
4.  - [x] Develop start/stop measurement controls
5.  - [x] Implement distance calculation based on steps and stride length (`calculateDistance` service)
6.  - [x] Build calibration interface for stride length (inline in `DistanceMeter`)
7.  - [x] Implement saving/loading stride calibration (`settingsStorage`)
8.  - [x] Implement saving measurements on stop (`measurementStorage`)
9.  - [ ] Improve Step Detection Accuracy:
    1.  - [x] Review `useStepDetector` hook logic (threshold, smoothing, calculation).
    2.  - [x] Increase default `threshold` value in `useStepDetector` to reduce sensitivity to noise.
    3.  - [x] Experiment with different `threshold` and `smoothingFactor` values for better accuracy.
    4.  - [ ] *Future:* Implement peak detection algorithm in `useStepDetector` for more robust step counting.

## Constraints

- Must function reasonably well without internet connectivity.
- Requires user permission to access motion sensors.
- Accuracy may vary depending on device hardware and how the user carries the phone.
- UI must provide clear feedback on tracking status.

## Data Models / Schema

```typescript
// From types/index.ts

// User stride calibration
interface StrideCalibration {
  userId: string;
  strideLength: number; // in meters
  calibrationDate: Date;
  useMetric: boolean;
}

// Distance measurement stored on stop
interface DistanceMeasurement {
  id: string;
  timestamp: Date;
  distanceMeters: number;
  steps: number;
  distanceFeet?: number;
  location?: { // Optional GPS context
    lat: number;
    lng: number;
  };
}
```

## Structure

Relevant files for this story:

```
src/
├── components/
│   └── distance/
│       └── DistanceMeter.tsx    # [x] Pedometer UI and controls
├── hooks/
│   └── useStepDetector.ts     # [x] Motion sensor and step counting logic
├── services/
│   ├── pedometer/
│   │   └── distanceCalculation.ts # [x] Calculates distance from steps
│   └── storage/
│       ├── settingsStorage.ts    # [x] Handles saving/loading stride calibration
│       └── measurementStorage.ts # [x] Handles saving measurement results
├── types/
│   └── index.ts               # [x] Contains StrideCalibration, DistanceMeasurement
└── App.tsx                    # [x] Routing added
```

## Dev Notes

- Initial implementation uses a simple magnitude threshold for step detection, which is known to be sensitive to noise. Further refinement is needed (see Tasks). 
- Consider adding a dedicated settings page for calibration later.
- Error handling for sensor permissions and data storage needs review. 