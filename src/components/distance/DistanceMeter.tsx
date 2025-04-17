import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  CircularProgress, 
  Alert,
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useStepDetector } from '../../hooks/useStepDetector';
import { calculateDistance, formatDistance } from '../../services/pedometer/distanceCalculation';
import { getStorageItem, setStorageItem, storeMeasurement } from '../../services/storage/storageService';
import { StrideCalibration } from '../../types';

const DEFAULT_USER_ID = 'defaultUser'; // Replace with actual user management later
const DEFAULT_STRIDE = 0.75; // Default stride length in meters

const DistanceMeter: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [calibration, setCalibration] = useState<StrideCalibration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useMetric, setUseMetric] = useState(true);
  
  // Fetch calibration data on load
  useEffect(() => {
    const loadCalibration = async () => {
      setIsLoading(true);
      let storedCalibration = await getStorageItem<StrideCalibration>('userCalibration');
      
      if (!storedCalibration) {
        // Create default calibration if none exists
        storedCalibration = {
          userId: DEFAULT_USER_ID,
          strideLength: DEFAULT_STRIDE,
          calibrationDate: new Date(),
          useMetric: true, // Default to metric
        };
        await setStorageItem('userCalibration', storedCalibration);
      }
      
      setCalibration(storedCalibration);
      setUseMetric(storedCalibration.useMetric);
      setIsLoading(false);
    };
    
    loadCalibration();
  }, []);

  // Step detector hook
  const { steps, startTracking, stopTracking } = useStepDetector({
    threshold: 2.0,         // Higher threshold to reduce noise
    timeInterval: 350,      // Slightly longer time between steps
    smoothingFactor: 0.2    // Stronger filtering
  });

  // Handle start/stop button click
  const handleStartStop = async () => {
    if (isTracking) {
      // Get current steps and distance *before* stopping
      const finalSteps = steps;
      
      // Calculate distance using our new function format
      const distanceResult = calibration ? calculateDistance(finalSteps, {
        calibratedStepLength: calibration.strideLength,
        useCalibrated: true,
      }) : { distance: 0, stepLength: 0 };
      
      stopTracking(); // Stop the motion detector
      setIsTracking(false);
      
      // Save the measurement if steps were taken
      if (finalSteps > 0 && calibration) {
        const distanceMeters = distanceResult.distance;
        const distanceFeet = distanceMeters * 3.28084; // Convert to feet
        
        const measurement = {
          id: crypto.randomUUID(), // Generate a unique ID
          type: 'distance',
          date: new Date(),
          steps: finalSteps,
          distanceMeters,
          distanceFeet,
          // location: null, // Add location later if needed
        };
        
        try {
          await storeMeasurement(measurement);
          console.log('Measurement saved:', measurement);
          // Optionally provide user feedback (e.g., Snackbar)
        } catch (error) {
          console.error('Failed to save measurement:', error);
          // Optionally provide user feedback
        }
      }
      
      // Steps are reset when startTracking is called next time

    } else {
      startTracking(); // This also resets steps in the hook
      setIsTracking(true);
    }
  };
  
  // Handle stride length change
  const handleStrideChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStride = parseFloat(event.target.value);
    if (!isNaN(newStride) && calibration) {
      const updatedCalibration = { ...calibration, strideLength: newStride };
      setCalibration(updatedCalibration);
      await setStorageItem('userCalibration', updatedCalibration);
    }
  }, [calibration]);
  
  // Handle unit toggle
  const handleUnitToggle = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUseMetric = event.target.checked;
    setUseMetric(newUseMetric);
    if (calibration) {
      const updatedCalibration = { ...calibration, useMetric: newUseMetric };
      setCalibration(updatedCalibration);
      await setStorageItem('userCalibration', updatedCalibration);
    }
  }, [calibration]);

  // Calculate distance
  const distanceResult = calibration ? calculateDistance(steps, {
    calibratedStepLength: calibration.strideLength,
    useCalibrated: true,
  }) : { distance: 0, stepLength: 0 };

  // Format distance for display
  const formattedDistance = formatDistance(distanceResult.distance, useMetric ? 'm' : 'km');
  const formattedAlternate = useMetric ? 
    `(${Math.round(distanceResult.distance * 3.28084)} feet)` : 
    `(${distanceResult.distance} meters)`;

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Alert severity="info">Loading calibration...</Alert>
      </Container>
    );
  }
  
  if (!calibration) {
     return (
      <Container maxWidth="sm">
        <Alert severity="error">Could not load calibration data.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Distance Meter
        </Typography>
        
        <Box sx={{ my: 4, position: 'relative', display: 'inline-block' }}>
          {/* Background circle */}
          <CircularProgress 
            variant="determinate" 
            value={100} 
            size={150} 
            thickness={2}
            sx={{ color: 'grey.300' }} 
          />
          {/* Progress circle - can be used for goals later */}
          <CircularProgress 
            variant="determinate" 
            value={0} // Example: Can show progress towards a step goal
            size={150} 
            thickness={4}
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
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h3" component="div" color="primary">
              {steps}
            </Typography>
            <Typography variant="caption">Steps</Typography>
          </Box>
        </Box>
        
        <Typography variant="h5" sx={{ my: 2 }}>
          Distance: {formattedDistance}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {formattedAlternate}
        </Typography>
        
        <Button 
          variant="contained" 
          color={isTracking ? "error" : "primary"}
          onClick={handleStartStop}
          size="large"
          sx={{ minWidth: '200px' }}
        >
          {isTracking ? "Stop Measurement" : "Start Measurement"}
        </Button>
        
        {isTracking && (
          <Alert severity="info" sx={{ mt: 2 }}>
            For best results, carry your phone in your hand or front pocket and walk normally.
          </Alert>
        )}
        
        <Box sx={{ mt: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Settings</Typography>
          <TextField
            label="Stride Length (meters)"
            type="number"
            value={calibration.strideLength}
            onChange={handleStrideChange}
            fullWidth
            margin="normal"
            inputProps={{ step: "0.01" }}
          />
          <FormControlLabel
            control={<Switch checked={useMetric} onChange={handleUnitToggle} />}
            label={useMetric ? "Using Metric (m)" : "Using Imperial (ft)"}
          />
        </Box>
      </Paper>
    </Container>
  );
}; 

export default DistanceMeter; 