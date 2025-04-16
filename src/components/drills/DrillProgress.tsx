import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CircleIcon from '@mui/icons-material/Circle';
import { PuttAttempt } from '../../types/drills';

interface DrillProgressProps {
  currentRound: number;
  totalRounds: number;
  attempts: PuttAttempt[];
}

const DrillProgress: React.FC<DrillProgressProps> = ({
  currentRound,
  totalRounds,
  attempts
}) => {
  // Calculate progress percentage
  const progressPercentage = (currentRound / totalRounds) * 100;
  
  // Create an array of rounds for display
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);
  
  // Find an attempt for a specific round
  const getAttemptForRound = (round: number): PuttAttempt | undefined => {
    return attempts.find(attempt => attempt.round === round);
  };
  
  // Get icon for a round
  const getRoundIcon = (round: number) => {
    if (round > currentRound) {
      // Future round
      return <CircleIcon color="disabled" fontSize="small" />;
    }
    
    const attempt = getAttemptForRound(round);
    if (!attempt) {
      // Current round, not completed
      return <CircleIcon color="primary" fontSize="small" />;
    }
    
    // Completed round
    return attempt.result === 'hit' 
      ? <CheckCircleIcon color="success" fontSize="small" />
      : <CancelIcon color="error" fontSize="small" />;
  };
  
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Progress:
        </Typography>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {Math.round(progressPercentage)}%
        </Typography>
      </Box>
      
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1,
          mt: 1
        }}
      >
        {rounds.map(round => (
          <Box 
            key={round}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: round < currentRound ? 0.7 : 1,
              p: 0.5
            }}
          >
            {getRoundIcon(round)}
            <Typography 
              variant="caption" 
              sx={{
                fontSize: '0.6rem',
                fontWeight: round === currentRound ? 'bold' : 'normal',
                color: round === currentRound ? 'primary.main' : 'text.secondary'
              }}
            >
              {round}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DrillProgress; 