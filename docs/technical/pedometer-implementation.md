# Pedometer Implementation Guide

## Overview

This document provides technical details for implementing an accurate pedometer in the Disc Golf Training PWA. Measuring steps and distances accurately on mobile devices presents several challenges that require careful implementation to overcome.

## Sensor Selection

### Recommended Approach

Use the hardware step detector available on modern devices rather than raw accelerometer data:

| Device OS | API | Description |
|-----------|-----|-------------|
| Android | `Sensor.TYPE_STEP_DETECTOR` | Hardware-based step event, debounced at silicon level |
| iOS | `CMPedometer` | CoreMotion pedometer with hardware-optimized step detection |

### Fallback for Devices Without Step Detection Hardware

When hardware step detection is unavailable, use a pipeline of:

1. **Linear Acceleration**:
   - Android: Use `TYPE_LINEAR_ACCELERATION` or subtract gravity vector from raw acceleration
   - iOS: Use `startDeviceMotionUpdates(using: .xArbitraryZVertical)` and read `userAcceleration`

2. **Signal Processing**:
   - Apply a low-pass filter (α≈0.8 at 50 Hz) to smooth jitter
   - Implement thresholding: ignore acceleration magnitudes below 0.15 m/s²

## Stillness Detection

Preventing false steps when the device is stationary is critical. Implement one or more:

1. **Variance Test**: Calculate rolling variance (σ²) of linear acceleration magnitude over a 1-second window. If σ² < 0.02 (m/s²)², classify as stationary.

2. **Activity Recognition** (if available):
   - Android: `ActivityRecognitionClient`
   - iOS: `CMMotionActivityManager`

3. **Step Detection Pause**: Automatically pause step detection when variance indicates the device is stationary for > 1 second.

## Distance Calculation

1. **Step Length Estimation**:
   - Starting formula: `stepLength = 0.415 × userHeightInCm / 100` (in meters)
   - Allow user calibration by walking a known distance

2. **2D Position Tracking** (enhanced version):
   - Track heading using rotation vector sensor
   - Update 2D position: `x += stepLength * sin(heading); y += stepLength * cos(heading)`
   - Calculate total distance: `distance = √(x² + y²)`

3. **Drift Reset** (optional):
   - When GPS is available with reasonable accuracy, reset position estimate
   - Zero IMU bias when external position fix is available

## Implementation Sample

### Basic Hook Implementation

```typescript
// useStepDetector.ts
import { useState, useEffect } from 'react';

interface StepDetectorOptions {
  threshold?: number;           // Acceleration threshold (m/s²)
  interval?: number;            // Update interval (ms)
  smoothingFactor?: number;     // For low-pass filter (0-1)
}

export const useStepDetector = (options: StepDetectorOptions = {}) => {
  const {
    threshold = 0.2,
    interval = 100,
    smoothingFactor = 0.8
  } = options;
  
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [filteredAccel, setFilteredAccel] = useState(0);
  const [isStationary, setIsStationary] = useState(true);
  
  // Variance calculation buffer
  const [accelBuffer, setAccelBuffer] = useState<number[]>([]);
  const bufferSize = 50; // ~1 second at 50Hz
  
  useEffect(() => {
    let lastUpdate = 0;
    let intervalId: number;
    
    const handleMotion = (event: DeviceMotionEvent) => {
      if (!isTracking) return;
      
      const now = Date.now();
      if (now - lastUpdate < interval) return;
      lastUpdate = now;
      
      const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      if (x === null || y === null || z === null) return;
      
      // Remove gravity approximately - not as good as proper linear acceleration
      const accelMagnitude = Math.sqrt(x*x + y*y + z*z) - 9.8;
      
      // Apply low-pass filter
      const newFilteredAccel = smoothingFactor * filteredAccel + (1 - smoothingFactor) * accelMagnitude;
      setFilteredAccel(newFilteredAccel);
      
      // Update buffer for variance calculation
      const newBuffer = [...accelBuffer, accelMagnitude];
      if (newBuffer.length > bufferSize) newBuffer.shift();
      setAccelBuffer(newBuffer);
      
      // Calculate variance for stillness detection
      if (newBuffer.length >= bufferSize) {
        const mean = newBuffer.reduce((sum, val) => sum + val, 0) / newBuffer.length;
        const variance = newBuffer.reduce((sum, val) => sum + (val - mean) * (val - mean), 0) / newBuffer.length;
        setIsStationary(variance < 0.02);
      }
      
      // Step detection (peak detection would be better)
      if (!isStationary && Math.abs(newFilteredAccel) > threshold) {
        setSteps(prev => prev + 1);
      }
    };
    
    if (isTracking) {
      window.addEventListener('devicemotion', handleMotion);
      
      // Periodically check stillness to reduce false positives
      intervalId = setInterval(() => {
        if (isStationary) {
          // Reset filtered acceleration when stationary
          setFilteredAccel(0);
        }
      }, 1000);
    }
    
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTracking, threshold, interval, smoothingFactor, filteredAccel, accelBuffer, isStationary]);
  
  const startTracking = () => setIsTracking(true);
  const stopTracking = () => setIsTracking(false);
  const resetSteps = () => setSteps(0);
  
  return {
    steps,
    isTracking,
    isStationary,
    startTracking,
    stopTracking,
    resetSteps
  };
};
```

### Enhanced Implementation (Hardware Support)

```typescript
// useHardwareStepDetector.ts - Android/Kotlin approach adapted to TypeScript
class StepDistanceMeter {
  private isTracking = false;
  private steps = 0;
  private distance = 0;
  private stepLength: number;
  private x = 0;
  private y = 0;
  private heading = 0;
  
  constructor(userHeightCm: number) {
    this.stepLength = 0.415 * userHeightCm / 100; // in meters
  }
  
  // Step detector event handler
  onStepDetected = () => {
    if (!this.isTracking) return;
    
    this.steps += 1;
    this.x += this.stepLength * Math.sin(this.heading);
    this.y += this.stepLength * Math.cos(this.heading);
    this.distance = Math.sqrt(this.x * this.x + this.y * this.y);
    
    // Notify listeners
    this.notifyDistanceUpdate();
  }
  
  // Rotation vector event handler
  onRotationChanged = (rotationVector: number[]) => {
    if (!this.isTracking) return;
    
    // Extract heading from rotation vector
    // This is a simplified version - actual implementation requires math
    this.heading = this.calculateHeadingFromRotation(rotationVector);
  }
  
  // Calculate heading from rotation vector (simplified)
  private calculateHeadingFromRotation(rotation: number[]): number {
    // In practice, this would convert rotation vector to a rotation matrix
    // and extract the yaw angle (Android example in comments above)
    return 0; // Placeholder
  }
  
  // Other methods (start, stop, reset)
  start() {
    this.isTracking = true;
    // In real implementation, register sensor listeners
  }
  
  stop() {
    this.isTracking = false;
    // In real implementation, unregister sensor listeners
  }
  
  reset() {
    this.steps = 0;
    this.distance = 0;
    this.x = 0;
    this.y = 0;
  }
  
  // Notification method
  private notifyDistanceUpdate() {
    // Dispatch event or call callback with updated distance
  }
}
```

## Common Issues and Solutions

1. **False Step Detection**:
   - **Problem**: Pedometer increments even when device is stationary
   - **Solutions**: 
     - Confirm using hardware step detector, not continuous step counter
     - Implement variance-based stillness detection
     - Increase step detection threshold
     - Reset counts when device is identified as stationary

2. **Integration Drift**:
   - **Problem**: Accumulated errors in position when integrating acceleration
   - **Solutions**:
     - Avoid double integration of raw acceleration
     - Reset position estimate periodically using GPS
     - Zero velocity when device is stationary

3. **Device Sensitivity Variation**:
   - **Problem**: Different devices have different sensor characteristics
   - **Solutions**:
     - Provide calibration interface for users to adjust sensitivity
     - Implement auto-calibration by analyzing step patterns during walking

## Implementation Strategy

1. Start with hardware step detector implementation (simplest and most reliable)
2. Add fallback pipeline for devices without hardware support
3. Implement proper stillness detection 
4. Add position tracking with heading for enhanced accuracy
5. Implement drift correction through periodic GPS synchronization

## References

- Android Step Counter Documentation
- iOS CoreMotion Documentation
- W3C DeviceMotion Specification 