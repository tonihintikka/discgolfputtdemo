import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Card, CardContent, Stack, Alert, Chip } from '@mui/material';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import StraightenIcon from '@mui/icons-material/Straighten';
import SpeedIcon from '@mui/icons-material/Speed';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import { usePedometerService } from '../../services/pedometer/pedometerService';
import { formatDistance } from '../../services/pedometer/distanceCalculation';
import PedometerSettings from './PedometerSettings';

/**
 * A component that displays pedometer data and controls
 */
const PedometerDisplay: React.FC = () => {
  const pedometer = usePedometerService();
  const [showPermissionMessage, setShowPermissionMessage] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Effect to handle permission message
  useEffect(() => {
    if (typeof DeviceMotionEvent !== 'undefined') {
      // iOS requires permission to be requested
      if (
        typeof (DeviceMotionEvent as any).requestPermission === 'function' &&
        !pedometer.isTracking
      ) {
        setShowPermissionMessage(true);
      }
    }
  }, [pedometer.isTracking]);

  // Handle permission request
  const requestPermission = async () => {
    try {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        setShowPermissionMessage(false);
        if (permissionState === 'granted') {
          await pedometer.startTracking();
        }
      } else {
        // Android and other browsers don't need explicit permission
        await pedometer.startTracking();
      }
    } catch (error) {
      console.error('Error requesting motion permission:', error);
    }
  };

  // Handle start/stop tracking
  const toggleTracking = async () => {
    if (pedometer.isTracking) {
      await pedometer.stopTracking();
    } else {
      await requestPermission();
    }
  };

  // Handle reset tracking
  const handleReset = () => {
    pedometer.resetTracking();
  };

  // Open settings dialog
  const openSettings = () => {
    setSettingsOpen(true);
  };

  // Close settings dialog
  const closeSettings = () => {
    setSettingsOpen(false);
  };

  return (
    <>
      <Card elevation={3} sx={{ width: '100%', mb: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" component="div" gutterBottom>
              Pedometer
            </Typography>
            
            {/* Permission message */}
            {showPermissionMessage && (
              <Alert severity="info">
                This feature requires motion sensor permission.
                <Button 
                  size="small" 
                  onClick={requestPermission}
                  sx={{ ml: 1 }}
                >
                  Grant Access
                </Button>
              </Alert>
            )}
            
            {/* Sensor status */}
            <Box display="flex" alignItems="center" gap={1}>
              <Chip 
                icon={pedometer.hardwareSensorAvailable ? <SpeedIcon /> : <DeviceUnknownIcon />}
                label={pedometer.hardwareSensorAvailable ? "Hardware sensor" : "Using accelerometer"}
                color={pedometer.hardwareSensorAvailable ? "success" : "default"}
                size="small"
              />
              
              {pedometer.isStill && (
                <Chip 
                  label="Not moving"
                  color="warning"
                  size="small"
                />
              )}
            </Box>
            
            {/* Main display */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                p: 2, 
                borderRadius: 2,
                bgcolor: 'background.paper'
              }}
            >
              {/* Steps display */}
              <Box display="flex" alignItems="center" mb={2}>
                <DirectionsWalkIcon sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h3" component="div">
                  {pedometer.steps}
                </Typography>
                <Typography variant="subtitle1" sx={{ ml: 1 }}>steps</Typography>
              </Box>
              
              {/* Distance display */}
              <Box display="flex" alignItems="center">
                <StraightenIcon sx={{ mr: 1 }} />
                <Typography variant="h5" component="div">
                  {formatDistance(pedometer.distance)}
                </Typography>
              </Box>
              
              {/* Step length */}
              <Typography variant="body2" color="text.secondary" mt={1}>
                Step length: {(pedometer.stepLength * 100).toFixed(1)} cm
                {pedometer.settings.useCalibrated && " (calibrated)"}
              </Typography>
            </Box>
            
            {/* Controls */}
            <Box display="flex" justifyContent="space-between">
              <Button
                variant="contained"
                color={pedometer.isTracking ? "secondary" : "primary"}
                onClick={toggleTracking}
                startIcon={pedometer.isTracking ? <PauseIcon /> : <PlayArrowIcon />}
              >
                {pedometer.isTracking ? "Stop" : "Start"} Tracking
              </Button>
              
              <Box>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  startIcon={<RefreshIcon />}
                  sx={{ mr: 1 }}
                >
                  Reset
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={openSettings}
                  startIcon={<SettingsIcon />}
                  disabled={pedometer.isTracking}
                >
                  Settings
                </Button>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      
      {/* Settings Dialog */}
      <PedometerSettings 
        open={settingsOpen}
        onClose={closeSettings}
      />
    </>
  );
};

export default PedometerDisplay; 