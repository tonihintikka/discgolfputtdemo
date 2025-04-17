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
    4.  - [ ] Implement peak detection algorithm in `useStepDetector` for more robust step counting.
10. - [ ] Enhanced Pedometer Implementation:
    1.  - [ ] Refactor to use hardware `TYPE_STEP_DETECTOR` when available instead of raw accelerometer.
    2.  - [ ] Implement fallback pipeline for devices without step detection hardware:
        - [ ] Separate gravity from linear acceleration.
        - [ ] Apply low-pass filter (α≈0.8 at 50 Hz) to smooth jitter.
        - [ ] Implement proper thresholding (≈0.15 m/s²) for acceleration magnitude.
    3.  - [ ] Add stillness detection to prevent drift:
        - [ ] Implement variance test (σ² < 0.02 (m/s²)² for standing still).
        - [ ] Pause step counting when device determined to be stationary.
    4.  - [ ] Add heading tracking with rotation vector sensor for 2D position estimation.
    5.  - [ ] Implement step length calibration based on user height (0.415 × height).
    6.  - [ ] Add optional GPS sync to reset drift periodically for outdoor use.
11. - [ ] Code Refactoring:
    1.  - [ ] Create separate services for different sensor implementations.
    2.  - [ ] Add sensor capability detection.
    3.  - [ ] Implement proper error handling for different device capabilities.
    4.  - [ ] Add diagnostic UI to show sensor status and quality.

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