import { useState, useEffect, useRef } from 'react';

// Add TypeScript interface augmentation for iOS-specific DeviceMotionEvent
interface DeviceMotionEventWithPermission extends DeviceMotionEvent {
  // This exists only in some browsers (iOS)
}

// Add the requestPermission method to the DeviceMotionEvent constructor
interface DeviceMotionEventStatic {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

// TypeScript augmentation to add the iOS-specific method
declare global {
  interface Window { 
    DeviceMotionEvent: DeviceMotionEvent & DeviceMotionEventStatic;
    StepCounter?: {
      addEventListener: (eventName: string, callback: (event: any) => void) => void;
      removeEventListener: (eventName: string, callback: (event: any) => void) => void;
      isAvailable: () => Promise<boolean>;
      start: () => Promise<void>;
      stop: () => Promise<void>;
    };
  }
}

export interface StepDetectorOptions {
  threshold: number;        // Acceleration threshold to detect a step
  timeInterval: number;     // Minimum time (ms) between steps
  smoothingFactor: number;  // For low-pass filtering (0-1)
  useHardwareSensor: boolean; // Whether to use hardware step sensor if available
  stillnessThreshold: number; // Threshold to detect if user is still (variance-based)
  stillnessWindowSize: number; // Number of samples to use for stillness detection
}

export interface StepDetectorState {
  steps: number;
  isTracking: boolean;
  isStill: boolean;
  lastAcceleration: { x: number, y: number, z: number };
  hardwareSensorAvailable: boolean;
}

export const useStepDetector = (options: Partial<StepDetectorOptions> = {}) => {
  // Apply defaults
  const mergedOptions: StepDetectorOptions = {
    threshold: 2.0,       // Increased from 1.2 to reduce false positives from minor movements
    timeInterval: 300,    
    smoothingFactor: 0.2,
    useHardwareSensor: true,
    stillnessThreshold: 0.15, // Low value = more sensitive stillness detection
    stillnessWindowSize: 10,  // Check variance over 10 samples
    ...options
  };
  
  const [state, setState] = useState<StepDetectorState>({
    steps: 0,
    isTracking: false,
    isStill: true,
    lastAcceleration: { x: 0, y: 0, z: 0 },
    hardwareSensorAvailable: false
  });
  
  const lastStepTime = useRef(0);
  const filteredAccel = useRef({ x: 0, y: 0, z: 0 });
  const accelHistory = useRef<Array<{ x: number, y: number, z: number }>>([]);
  const hardwareSensorRef = useRef<boolean>(false);
  
  // Check if hardware step sensor is available
  useEffect(() => {
    const checkHardwareSensor = async () => {
      try {
        // Check for Web API for step counter (currently experimental)
        if (window.StepCounter && typeof window.StepCounter.isAvailable === 'function') {
          const available = await window.StepCounter.isAvailable();
          hardwareSensorRef.current = available;
          setState(prev => ({ ...prev, hardwareSensorAvailable: available }));
        }
      } catch (error) {
        console.error('Error checking hardware step sensor:', error);
        hardwareSensorRef.current = false;
      }
    };
    
    checkHardwareSensor();
  }, []);
  
  // Start step tracking
  const startTracking = async () => {
    setState(prev => ({ ...prev, isTracking: true, steps: 0 }));
    
    // If hardware sensor is available and enabled in options, try to use it
    if (hardwareSensorRef.current && mergedOptions.useHardwareSensor && window.StepCounter) {
      try {
        await window.StepCounter.start();
      } catch (error) {
        console.error('Failed to start hardware step counter:', error);
        // Will fall back to accelerometer-based detection
      }
    }
  };
  
  // Stop step tracking
  const stopTracking = async () => {
    setState(prev => ({ ...prev, isTracking: false }));
    
    // Stop hardware sensor if it was being used
    if (hardwareSensorRef.current && mergedOptions.useHardwareSensor && window.StepCounter) {
      try {
        await window.StepCounter.stop();
      } catch (error) {
        console.error('Failed to stop hardware step counter:', error);
      }
    }
    
    return state.steps;
  };
  
  // Reset step count
  const resetSteps = () => {
    setState(prev => ({ ...prev, steps: 0 }));
  };
  
  // Check if user is still based on accelerometer variance
  const checkStillness = () => {
    if (accelHistory.current.length < mergedOptions.stillnessWindowSize) {
      return state.isStill; // Not enough data yet
    }
    
    // Calculate variance for x, y, z
    let sumX = 0, sumY = 0, sumZ = 0;
    let sumXSq = 0, sumYSq = 0, sumZSq = 0;
    
    for (const point of accelHistory.current) {
      sumX += point.x;
      sumY += point.y;
      sumZ += point.z;
      
      sumXSq += point.x * point.x;
      sumYSq += point.y * point.y;
      sumZSq += point.z * point.z;
    }
    
    const n = accelHistory.current.length;
    const varianceX = (sumXSq - (sumX * sumX) / n) / n;
    const varianceY = (sumYSq - (sumY * sumY) / n) / n;
    const varianceZ = (sumZSq - (sumZ * sumZ) / n) / n;
    
    // Overall variance
    const totalVariance = varianceX + varianceY + varianceZ;
    
    // User is considered still if variance is below threshold
    return totalVariance < mergedOptions.stillnessThreshold;
  };
  
  // Hardware step sensor event handler
  useEffect(() => {
    if (!state.isTracking || !hardwareSensorRef.current || !mergedOptions.useHardwareSensor) return;
    
    const handleHardwareStep = (event: any) => {
      if (event && event.detail && typeof event.detail.stepCount === 'number') {
        setState(prev => ({ ...prev, steps: event.detail.stepCount }));
      } else {
        // If just receiving a step event without count
        setState(prev => ({ ...prev, steps: prev.steps + 1 }));
      }
    };
    
    // Add event listener for hardware step counter if available
    if (window.StepCounter) {
      window.StepCounter.addEventListener('stepcounter', handleHardwareStep);
    }
    
    return () => {
      if (window.StepCounter) {
        window.StepCounter.removeEventListener('stepcounter', handleHardwareStep);
      }
    };
  }, [state.isTracking, mergedOptions.useHardwareSensor]);
  
  // Accelerometer-based step detection (fallback)
  useEffect(() => {
    if (!state.isTracking || (hardwareSensorRef.current && mergedOptions.useHardwareSensor)) return;
    
    // Handle motion events
    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;
      
      const { x, y, z } = event.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;
      
      // Update last acceleration values
      setState(prev => ({
        ...prev,
        lastAcceleration: { x, y, z }
      }));
      
      // Apply low-pass filter to smooth out noise in accelerometer data
      // Lower smoothingFactor means less influence from new readings (stronger filtering)
      filteredAccel.current.x = mergedOptions.smoothingFactor * x + (1 - mergedOptions.smoothingFactor) * filteredAccel.current.x;
      filteredAccel.current.y = mergedOptions.smoothingFactor * y + (1 - mergedOptions.smoothingFactor) * filteredAccel.current.y;
      filteredAccel.current.z = mergedOptions.smoothingFactor * z + (1 - mergedOptions.smoothingFactor) * filteredAccel.current.z;
      
      // Store in history for stillness detection
      accelHistory.current.push({ ...filteredAccel.current });
      if (accelHistory.current.length > mergedOptions.stillnessWindowSize) {
        accelHistory.current.shift(); // Remove oldest entry
      }
      
      // Update stillness state
      const isCurrentlyStill = checkStillness();
      if (isCurrentlyStill !== state.isStill) {
        setState(prev => ({ ...prev, isStill: isCurrentlyStill }));
      }
      
      // Skip step detection if user is still
      if (isCurrentlyStill) return;
      
      // Calculate acceleration magnitude (total movement force)
      const magnitude = Math.sqrt(
        Math.pow(filteredAccel.current.x, 2) + 
        Math.pow(filteredAccel.current.y, 2) + 
        Math.pow(filteredAccel.current.z, 2)
      );
      
      // Check for step pattern:
      // 1. Magnitude exceeds threshold (strong enough movement)
      // 2. Enough time has passed since last step (prevents rapid counting)
      const now = Date.now();
      if (
        magnitude > mergedOptions.threshold && 
        now - lastStepTime.current > mergedOptions.timeInterval
      ) {
        setState(prev => ({ ...prev, steps: prev.steps + 1 }));
        lastStepTime.current = now;
      }
    };
    
    // Request permission for DeviceMotion on iOS (if needed)
    const requestPermission = async () => {
      if (typeof window.DeviceMotionEvent.requestPermission === 'function') {
        try {
          const permission = await window.DeviceMotionEvent.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        } catch (error) {
          console.error('Error requesting motion permission:', error);
        }
      } else {
        // For devices that don't require permission
        window.addEventListener('devicemotion', handleMotion);
      }
    };
    
    requestPermission();
    
    // Cleanup
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [state.isTracking, state.isStill, mergedOptions.threshold, mergedOptions.timeInterval, mergedOptions.smoothingFactor, mergedOptions.useHardwareSensor, mergedOptions.stillnessThreshold]);
  
  return { 
    ...state,
    startTracking, 
    stopTracking, 
    resetSteps
  };
}; 