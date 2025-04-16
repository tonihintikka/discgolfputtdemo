export interface DistanceOptions {
  strideLength: number; // in meters
  useMetric: boolean;
}

export const calculateDistance = (
  steps: number, 
  options: DistanceOptions
) => {
  // Calculate distance in meters
  const distanceMeters = steps * options.strideLength;
  
  // Convert to feet if needed
  const distanceFeet = distanceMeters * 3.28084;
  
  return {
    meters: parseFloat(distanceMeters.toFixed(2)),
    feet: parseFloat(distanceFeet.toFixed(2)),
    formatted: options.useMetric 
      ? `${distanceMeters.toFixed(2)} m`
      : `${distanceFeet.toFixed(2)} ft`
  };
}; 