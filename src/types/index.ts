// Re-export drill-related types
export * from './drills';

// User stride calibration
export interface StrideCalibration {
  userId: string;
  strideLength: number; // in meters
  calibrationDate: Date;
  useMetric: boolean;
}

// Drill session
export interface DrillSession {
  id: string;
  drillTypeId: string;
  name: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  distanceMeters?: number;
  numberOfAttempts?: number;
}

// Putt attempt
export interface PuttAttempt {
  id: string;
  drillId: string;
  round: number;
  timestamp: Date;
  successful: boolean;
  distanceMeters?: number;
  notes?: string;
}

// Distance measurement
export interface DistanceMeasurement {
  id: string;
  timestamp: Date;
  distanceMeters: number;
  steps: number;
  distanceFeet?: number;
  location?: {
    lat: number;
    lng: number;
  };
}

// App theme type (for MUI customization)
export interface AppTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  text: {
    primary: string;
    secondary: string;
  };
}

// Basic route definition
export interface AppRoute {
  path: string;
  name: string;
  icon: React.ComponentType;
  component: React.ComponentType;
} 