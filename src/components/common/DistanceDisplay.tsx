import React from 'react';
import { Typography, Box } from '@mui/material';
import StraightenIcon from '@mui/icons-material/Straighten';

interface DistanceDisplayProps {
  meters: number;
  showIcon?: boolean;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2';
  primaryUnit?: 'meters' | 'feet';
}

const DistanceDisplay: React.FC<DistanceDisplayProps> = ({
  meters,
  showIcon = true,
  variant = 'h5',
  primaryUnit = 'meters'
}) => {
  // Convert to feet
  const feet = meters * 3.28084;
  
  // Format with appropriate precision
  const formattedMeters = meters < 10 ? meters.toFixed(1) : Math.round(meters);
  const formattedFeet = Math.round(feet);
  
  const primaryDisplay = primaryUnit === 'meters' 
    ? `${formattedMeters}m`
    : `${formattedFeet}ft`;
    
  const secondaryDisplay = primaryUnit === 'meters'
    ? `(${formattedFeet}ft)`
    : `(${formattedMeters}m)`;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showIcon && <StraightenIcon color="action" />}
      <Typography variant={variant} component="span">
        {primaryDisplay}{' '}
        <Typography 
          component="span" 
          variant="body2" 
          sx={{ opacity: 0.7, fontWeight: 'normal' }}
        >
          {secondaryDisplay}
        </Typography>
      </Typography>
    </Box>
  );
};

export default DistanceDisplay; 