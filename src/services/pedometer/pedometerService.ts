import { useEffect, useState } from 'react';
import { useStepDetector, StepDetectorOptions } from '../../hooks/useStepDetector';
import { calculateDistance, DistanceCalculationOptions, DistanceResults } from './distanceCalculation';
import { getStorageItem, setStorageItem } from '../storage/storageService';

export interface PedometerSettings {
  userHeight?: number;              // Height in cm
  calibratedStepLength?: number;    // Step length in meters
  useCalibrated: boolean;           // Whether to use calibrated or height-based step length
  useHardwareSensor: boolean;       // Whether to use hardware sensor when available
  sensitivity: number;              // 1-10, maps to threshold values (higher = less sensitive)
}

export interface PedometerState {
  steps: number;
  distance: number;     // In meters
  stepLength: number;   // In meters
  isTracking: boolean;
  isStill: boolean;
  hardwareSensorAvailable: boolean;
  lastAcceleration: { x: number, y: number, z: number };
}

export interface CalibrationSession {
  knownDistance: number;  // in meters
  stepsTaken: number;
  calculatedStepLength: number;
  timestamp: number;
}

// Constants
const DEFAULT_SETTINGS: PedometerSettings = {
  userHeight: 170,
  useCalibrated: false,
  useHardwareSensor: true,
  sensitivity: 5
};

// Map sensitivity (1-10) to threshold values (higher threshold = less sensitive)
const sensitivityToThreshold = (sensitivity: number): number => {
  // Invert: 1 = most sensitive (low threshold), 10 = least sensitive (high threshold)
  const invertedSensitivity = 11 - sensitivity;
  // Map to range 1.0 (very sensitive) to 3.0 (less sensitive)
  return 1.0 + ((invertedSensitivity - 1) / 9) * 2.0;
};

export const usePedometerService = () => {
  // Load settings from storage or use defaults
  const [settings, setSettings] = useState<PedometerSettings>(DEFAULT_SETTINGS);
  const [distance, setDistance] = useState<number>(0);
  const [stepLength, setStepLength] = useState<number>(0);
  const [calibrationHistory, setCalibrationHistory] = useState<CalibrationSession[]>([]);
  
  // Configure step detector options based on settings
  const stepOptions: Partial<StepDetectorOptions> = {
    threshold: sensitivityToThreshold(settings.sensitivity),
    useHardwareSensor: settings.useHardwareSensor,
    // Keep other defaults for time interval, smoothing, etc.
  };
  
  // Use our step detector hook
  const stepDetector = useStepDetector(stepOptions);
  
  // Load settings from storage on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await getStorageItem<PedometerSettings>('pedometerSettings');
        if (savedSettings) {
          setSettings(savedSettings);
        }
        
        const savedCalibration = await getStorageItem<CalibrationSession[]>('calibrationHistory');
        if (savedCalibration) {
          setCalibrationHistory(savedCalibration);
        }
      } catch (error) {
        console.error('Failed to load pedometer settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Update distance whenever step count changes
  useEffect(() => {
    if (stepDetector.steps > 0) {
      const distanceOptions: DistanceCalculationOptions = {
        userHeightCm: settings.userHeight,
        calibratedStepLength: settings.calibratedStepLength,
        useCalibrated: settings.useCalibrated
      };
      
      const result = calculateDistance(stepDetector.steps, distanceOptions);
      setDistance(result.distance);
      setStepLength(result.stepLength);
    }
  }, [stepDetector.steps, settings]);
  
  // Save settings
  const saveSettings = async (newSettings: Partial<PedometerSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await setStorageItem('pedometerSettings', updatedSettings);
    
    // If updating settings while tracking, update the options
    if (stepDetector.isTracking) {
      // Currently can't update detector options while running
      // Consider stopping and restarting tracking if needed
    }
    
    return updatedSettings;
  };
  
  // Start tracking
  const startTracking = async () => {
    await stepDetector.startTracking();
  };
  
  // Stop tracking and return results
  const stopTracking = async (): Promise<{ steps: number, distance: number }> => {
    const finalSteps = await stepDetector.stopTracking();
    return {
      steps: finalSteps,
      distance
    };
  };
  
  // Reset the current tracking session
  const resetTracking = () => {
    stepDetector.resetSteps();
    setDistance(0);
  };
  
  // Calibrate step length
  const calibrateStepLength = async (knownDistance: number): Promise<number> => {
    if (stepDetector.steps <= 0) {
      throw new Error('Cannot calibrate with zero steps');
    }
    
    try {
      // Calculate new step length
      const newStepLength = knownDistance / stepDetector.steps;
      
      // Create calibration session record
      const calibrationSession: CalibrationSession = {
        knownDistance,
        stepsTaken: stepDetector.steps,
        calculatedStepLength: newStepLength,
        timestamp: Date.now()
      };
      
      // Add to history and save
      const updatedHistory = [calibrationSession, ...calibrationHistory].slice(0, 10); // Keep last 10
      setCalibrationHistory(updatedHistory);
      await setStorageItem('calibrationHistory', updatedHistory);
      
      // Update settings to use the calibrated value
      await saveSettings({
        calibratedStepLength: newStepLength,
        useCalibrated: true
      });
      
      return newStepLength;
    } catch (error) {
      console.error('Calibration failed:', error);
      throw error;
    }
  };
  
  // Get current state
  const getState = (): PedometerState => {
    return {
      steps: stepDetector.steps,
      distance,
      stepLength,
      isTracking: stepDetector.isTracking,
      isStill: stepDetector.isStill,
      hardwareSensorAvailable: stepDetector.hardwareSensorAvailable,
      lastAcceleration: stepDetector.lastAcceleration
    };
  };
  
  return {
    // Current state
    ...getState(),
    
    // Settings
    settings,
    saveSettings,
    
    // Calibration
    calibrationHistory,
    calibrateStepLength,
    
    // Controls
    startTracking,
    stopTracking,
    resetTracking
  };
}; 