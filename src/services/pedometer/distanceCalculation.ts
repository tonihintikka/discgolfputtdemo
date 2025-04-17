/**
 * Distance calculation service for pedometer
 * Calculates distance based on steps and either height-based step length or calibrated step length
 */

export interface DistanceCalculationOptions {
  userHeightCm?: number;              // User height in centimeters
  calibratedStepLength?: number;      // Calibrated step length in meters
  useCalibrated: boolean;             // Whether to use calibrated value or calculate from height
}

export interface DistanceResults {
  distance: number;           // Total distance in meters
  stepLength: number;         // Step length used for calculation (in meters)
}

/**
 * Calculate approximate step length based on height
 * Uses common formula: step length ≈ height * 0.415 for men and height * 0.413 for women
 * This is a simplified approach using an average of 0.414
 * @param heightCm - Height in centimeters
 * @returns Step length in meters
 */
export const calculateStepLengthFromHeight = (heightCm: number): number => {
  if (!heightCm || heightCm <= 0) {
    return 0.7; // Default for unknown height (about average)
  }
  
  // Convert height to meters and apply formula
  const heightMeters = heightCm / 100;
  return heightMeters * 0.414;
};

/**
 * Calculate distance based on steps and options
 * @param steps - Number of steps
 * @param options - Calculation options
 * @returns Distance in meters and step length used
 */
export const calculateDistance = (
  steps: number,
  options: DistanceCalculationOptions
): DistanceResults => {
  if (steps <= 0) {
    return { distance: 0, stepLength: 0 };
  }
  
  let stepLength: number;
  
  // Determine step length based on options
  if (options.useCalibrated && options.calibratedStepLength) {
    // Use calibrated step length if available and selected
    stepLength = options.calibratedStepLength;
  } else if (options.userHeightCm) {
    // Otherwise calculate from height if available
    stepLength = calculateStepLengthFromHeight(options.userHeightCm);
  } else {
    // Default step length if no height or calibration available
    stepLength = 0.7; // About average (70cm)
  }
  
  // Calculate distance
  const distance = steps * stepLength;
  
  return {
    distance,
    stepLength
  };
};

/**
 * Format distance for display
 * @param distanceMeters - Distance in meters
 * @param unit - Display unit ('m' for meters, 'km' for kilometers)
 * @returns Formatted distance string with unit
 */
export const formatDistance = (distanceMeters: number, unit: 'm' | 'km' = 'm'): string => {
  if (unit === 'km' || distanceMeters >= 1000) {
    // Show in kilometers if requested or if distance is large
    const km = distanceMeters / 1000;
    return `${km.toFixed(2)} km`;
  } else {
    // Show in meters
    return `${Math.round(distanceMeters)} m`;
  }
};

/**
 * Calibrate step length based on known distance and step count
 * @param knownDistanceMeters Known distance traveled in meters
 * @param stepCount Number of steps taken to travel the known distance
 * @returns Calibrated step length in meters
 */
export function calibrateStepLength(
  knownDistanceMeters: number,
  stepCount: number
): number {
  if (stepCount <= 0) {
    throw new Error('Step count must be greater than zero');
  }
  
  return knownDistanceMeters / stepCount;
} 