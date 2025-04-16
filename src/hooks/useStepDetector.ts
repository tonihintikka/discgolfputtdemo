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
  }
}

interface StepDetectorOptions {
  threshold: number;        // Acceleration threshold to detect a step
  timeInterval: number;     // Minimum time (ms) between steps
  smoothingFactor: number;  // For low-pass filtering (0-1)
}

export const useStepDetector = (options: StepDetectorOptions = {
  threshold: 1.2,       
  timeInterval: 300,    
  smoothingFactor: 0.3  
}) => {
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const lastStepTime = useRef(0);
  const filteredAccel = useRef({ x: 0, y: 0, z: 0 });
  
  // Start step tracking
  const startTracking = () => {
    setIsTracking(true);
    setSteps(0);
  };
  
  // Stop step tracking
  const stopTracking = () => {
    setIsTracking(false);
    return steps;
  };
  
  useEffect(() => {
    if (!isTracking) return;
    
    // Handle motion events
    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;
      
      const { x, y, z } = event.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;
      
      // Apply low-pass filter
      filteredAccel.current.x = options.smoothingFactor * x + (1 - options.smoothingFactor) * filteredAccel.current.x;
      filteredAccel.current.y = options.smoothingFactor * y + (1 - options.smoothingFactor) * filteredAccel.current.y;
      filteredAccel.current.z = options.smoothingFactor * z + (1 - options.smoothingFactor) * filteredAccel.current.z;
      
      // Calculate acceleration magnitude
      const magnitude = Math.sqrt(
        Math.pow(filteredAccel.current.x, 2) + 
        Math.pow(filteredAccel.current.y, 2) + 
        Math.pow(filteredAccel.current.z, 2)
      );
      
      // Check for step pattern
      const now = Date.now();
      if (
        magnitude > options.threshold && 
        now - lastStepTime.current > options.timeInterval
      ) {
        setSteps(prevSteps => prevSteps + 1);
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
  }, [isTracking, options.threshold, options.timeInterval, options.smoothingFactor]);
  
  return { steps, startTracking, stopTracking, isTracking };
}; 