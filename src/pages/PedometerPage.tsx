import React from 'react';
import { Container, Typography, Box, Paper, Divider, List, ListItem, ListItemIcon, ListItemText, Alert } from '@mui/material';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import StraightenIcon from '@mui/icons-material/Straighten';
import MapIcon from '@mui/icons-material/Map';
import TimerIcon from '@mui/icons-material/Timer';
import PedometerDisplay from '../components/pedometer/PedometerDisplay';

/**
 * Pedometer page component for the Disc Golf Training app
 * Displays the pedometer and information about using it for disc golf training
 */
const PedometerPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Distance Tracker
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Track your steps and distance during disc golf rounds and practice sessions
      </Typography>
      
      {/* Pedometer component */}
      <PedometerDisplay />
      
      {/* Usage guidance */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Using the Pedometer
        </Typography>
        
        <Typography variant="body2" paragraph>
          The pedometer uses your device's motion sensors to track steps and calculate distance 
          as you move around the course.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          For best results, keep your device in your pocket or bag while walking normally.
          Calibrate your step length for more accurate distance measurements.
        </Alert>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Disc Golf Training Benefits:
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemIcon>
              <MapIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Course Mapping" 
              secondary="Measure exact distances between baskets to improve your distance control" 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <StraightenIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Range Finding" 
              secondary="Calibrate your perception of distances for better club selection" 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <FitnessCenterIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Physical Training" 
              secondary="Track your activity level during practice to monitor your fitness" 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <TimerIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Pace Monitoring" 
              secondary="Keep track of your walking speed and total distance during rounds" 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <DirectionsWalkIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Field Work" 
              secondary="Measure the walking distance during field practice sessions" 
            />
          </ListItem>
        </List>
      </Paper>
      
      {/* Limitations notice */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Note: The accuracy of step counting and distance measurement depends on your device's sensors 
          and proper calibration. Results may vary by device and walking style.
        </Typography>
      </Box>
    </Container>
  );
};

export default PedometerPage; 