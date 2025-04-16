# Best Practices for Disc Golf Training PWA Implementation

This document outlines the best practices and technical approaches for implementing the Disc Golf Training Progressive Web App (PWA), focusing on key aspects like PWA setup, offline storage, and device motion sensor integration.

## Table of Contents

1. [Setting Up Vite PWA](#setting-up-vite-pwa)
2. [Implementing Offline Storage with IndexedDB](#implementing-offline-storage-with-indexeddb)
3. [Pedometer Implementation with DeviceMotionEvent](#pedometer-implementation-with-devicemotionevent)
4. [General PWA Best Practices](#general-pwa-best-practices)

## Setting Up Vite PWA

The recommended approach for implementing PWA functionality with Vite is to use the `vite-plugin-pwa` package, which streamlines the setup process.

### Installation and Basic Configuration

```bash
npm install -D vite-plugin-pwa
# or
yarn add -D vite-plugin-pwa
```

Configure the plugin in your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Disc Golf Training PWA',
        short_name: 'DiscGolfPWA',
        description: 'A progressive web app for disc golf putting practice',
        theme_color: '#4CAF50',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true // Enable PWA in development
      }
    })
  ]
});
```

### Registering the Service Worker

In your main application file (e.g., `main.tsx`):

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with auto update
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a UI element to prompt the user to refresh for new content
    console.log('New content available, click on reload button to update.');
  },
  onOfflineReady() {
    // Notify the user that the app is ready for offline use
    console.log('App ready to work offline');
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### PWA Asset Generation

For generating PWA assets (icons, splash screens, etc.), consider using tools like:
- `pwa-asset-generator` - Generates icons and splash screens based on a source image
- `favicon-generator` - Creates favicons in various sizes

## Implementing Offline Storage with IndexedDB

For offline data persistence, IndexedDB is the recommended approach. Using a wrapper library like Dexie.js makes working with IndexedDB much more straightforward.

### Setting Up IndexedDB with Dexie.js

```bash
npm install dexie
# or
yarn add dexie
```

### Database Configuration (TypeScript)

```typescript
// src/services/storage/database.ts
import Dexie, { Table } from 'dexie';
import { StrideCalibration, DrillSession, PuttAttempt, DistanceMeasurement } from '../../types';

export class DiscGolfDatabase extends Dexie {
  // Define tables
  settings!: Table<StrideCalibration>;
  sessions!: Table<DrillSession>;
  attempts!: Table<PuttAttempt>;
  measurements!: Table<DistanceMeasurement>;

  constructor() {
    super('DiscGolfTrainingDB');
    
    // Define schema
    this.version(1).stores({
      settings: 'userId,calibrationDate',
      sessions: 'id,drillTypeId,startTime,completed',
      attempts: 'id,drillId,round,timestamp',
      measurements: 'id,timestamp'
    });
  }
}

const db = new DiscGolfDatabase();
export default db;
```

### Storage Service Abstraction (CRUD operations)

```typescript
// src/services/storage/storageService.ts
import db from './database';
import { DrillSession, PuttAttempt, DistanceMeasurement, StrideCalibration } from '../../types';

// Settings Storage
export const settingsStorage = {
  getCalibration: async (userId: string): Promise<StrideCalibration | undefined> => {
    return await db.settings.get(userId);
  },
  
  saveCalibration: async (calibration: StrideCalibration): Promise<string> => {
    return await db.settings.put(calibration);
  }
};

// Sessions Storage
export const sessionStorage = {
  getSessions: async (): Promise<DrillSession[]> => {
    return await db.sessions.toArray();
  },
  
  getSession: async (id: string): Promise<DrillSession | undefined> => {
    return await db.sessions.get(id);
  },
  
  saveSession: async (session: DrillSession): Promise<string> => {
    return await db.sessions.put(session);
  },
  
  getSessionAttempts: async (sessionId: string): Promise<PuttAttempt[]> => {
    return await db.attempts.where('drillId').equals(sessionId).toArray();
  },
  
  saveAttempt: async (attempt: PuttAttempt): Promise<string> => {
    return await db.attempts.put(attempt);
  }
};

// Measurements Storage
export const measurementStorage = {
  getMeasurements: async (): Promise<DistanceMeasurement[]> => {
    return await db.measurements.toArray();
  },
  
  saveMeasurement: async (measurement: DistanceMeasurement): Promise<string> => {
    return await db.measurements.put(measurement);
  }
};
```

### React Hooks for Data Access

```typescript
// src/hooks/useDB.ts
import { useState, useEffect, useCallback } from 'react';
import { sessionStorage } from '../services/storage/storageService';
import { DrillSession } from '../types';

export const useSessions = () => {
  const [sessions, setSessions] = useState<DrillSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await sessionStorage.getSessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const saveSession = useCallback(async (session: DrillSession) => {
    try {
      const id = await sessionStorage.saveSession(session);
      fetchSessions();
      return id;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    saveSession
  };
};
```

## Pedometer Implementation with DeviceMotionEvent

For the step counting feature, a custom hook using device motion sensors provides a clean, reusable solution.

### Step Detection Hook

```typescript
// src/hooks/useStepDetector.ts
import { useState, useEffect, useRef } from 'react';

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
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceMotionEvent.requestPermission();
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
```

### Distance Calculation Service

```typescript
// src/services/pedometer/distanceCalculation.ts
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
```

### Usage in a Component

```tsx
// src/components/distance/DistanceMeter.tsx
import React, { useState } from 'react';
import { useStepDetector } from '../../hooks/useStepDetector';
import { calculateDistance } from '../../services/pedometer/distanceCalculation';
import { Button, Typography, Box, CircularProgress } from '@mui/material';

interface DistanceMeterProps {
  strideLength: number;
  useMetric: boolean;
  onSave?: (distanceMeters: number, steps: number) => void;
}

const DistanceMeter: React.FC<DistanceMeterProps> = ({ 
  strideLength, 
  useMetric,
  onSave 
}) => {
  const { steps, startTracking, stopTracking, isTracking } = useStepDetector();
  const [distance, setDistance] = useState({ meters: 0, feet: 0, formatted: '0 m' });
  
  // Update distance calculation when steps change
  React.useEffect(() => {
    const calculatedDistance = calculateDistance(steps, { 
      strideLength, 
      useMetric 
    });
    setDistance(calculatedDistance);
  }, [steps, strideLength, useMetric]);
  
  const handleStartStop = () => {
    if (isTracking) {
      const finalSteps = stopTracking();
      if (onSave) {
        onSave(distance.meters, finalSteps);
      }
    } else {
      startTracking();
    }
  };
  
  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h4">Distance Meter</Typography>
      
      <Box sx={{ my: 4, position: 'relative', display: 'inline-block' }}>
        <CircularProgress 
          variant="determinate" 
          value={100} 
          size={120} 
          sx={{ color: 'grey.300' }} 
        />
        <CircularProgress 
          variant="determinate" 
          value={Math.min(steps / 100 * 100, 100)} 
          size={120} 
          sx={{ 
            position: 'absolute', 
            left: 0, 
            color: 'primary.main' 
          }} 
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h5" component="div">
            {steps}
          </Typography>
        </Box>
      </Box>
      
      <Typography variant="h6" sx={{ my: 2 }}>
        Distance: {distance.formatted}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {useMetric 
          ? `${distance.meters} meters (${distance.feet} feet)` 
          : `${distance.feet} feet (${distance.meters} meters)`}
      </Typography>
      
      <Button 
        variant="contained" 
        color={isTracking ? "error" : "primary"}
        onClick={handleStartStop}
        size="large"
      >
        {isTracking ? "Stop Measurement" : "Start Measurement"}
      </Button>
    </Box>
  );
};

export default DistanceMeter;
```

## General PWA Best Practices

### Performance Optimization

1. **Code Splitting**: Use React.lazy and Suspense for component-level code splitting
   ```typescript
   const DrillsPage = React.lazy(() => import('./pages/DrillsPage'));
   ```

2. **Bundle Size Optimization**:
   - Regularly analyze bundle size with tools like `rollup-plugin-visualizer`
   - Use tree-shakable libraries
   - Consider using lightweight alternatives to heavy dependencies

3. **Image Optimization**:
   - Use modern image formats (WebP, AVIF)
   - Implement responsive images with `srcset`
   - Lazy load images below the fold

### Offline Experience

1. **Offline Indicator**: Show clear UI indication of offline status
   ```tsx
   const OfflineIndicator = () => {
     const [isOnline, setIsOnline] = useState(navigator.onLine);
     
     useEffect(() => {
       const handleOnline = () => setIsOnline(true);
       const handleOffline = () => setIsOnline(false);
       
       window.addEventListener('online', handleOnline);
       window.addEventListener('offline', handleOffline);
       
       return () => {
         window.removeEventListener('online', handleOnline);
         window.removeEventListener('offline', handleOffline);
       };
     }, []);
     
     if (isOnline) return null;
     
     return (
       <Box sx={{ bgcolor: 'warning.main', color: 'warning.contrastText', p: 1, textAlign: 'center' }}>
         You are currently offline. Some features may be limited.
       </Box>
     );
   };
   ```

2. **Data Synchronization**: Prepare for future backend integration
   - Structure the storage service to allow for future sync capabilities
   - Implement optimistic UI updates for offline actions

### Testing PWA Features

1. **Lighthouse Audits**: Regularly run Lighthouse PWA audits to ensure compliance

2. **Cross-Browser Testing**: Test on multiple browsers and devices

3. **Offline Testing**: Use the Network tab in DevTools to simulate offline conditions

### Security Considerations

1. **HTTPS**: Ensure deployment on HTTPS (required for PWA features)

2. **Content Security Policy**: Implement appropriate CSP headers

3. **Permissions**: Handle device permissions (motion sensors, geolocation) with clear user prompts

## Conclusion

Following these best practices will ensure the Disc Golf Training PWA is performant, reliable, and provides a high-quality user experience, even in offline scenarios. The combination of Vite for modern build tooling, IndexedDB for offline storage, and carefully implemented motion detection creates a solid foundation for the application. 