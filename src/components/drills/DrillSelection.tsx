import React from 'react';
import { DrillType } from '../../types/drills';
import { 
  Box, 
  Card, 
  CardActionArea, 
  CardContent, 
  Typography, 
  Chip,
  useTheme,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getDrillTypes } from '../../services/drillService';
import DynamicIcon from '../common/DynamicIcon';

interface DrillSelectionProps {
  onDrillSelect: (drill: DrillType) => void;
}

export const DrillSelection: React.FC<DrillSelectionProps> = ({ onDrillSelect }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const drills = getDrillTypes();

  const handleDrillSelection = (drill: DrillType) => {
    onDrillSelect(drill);
    navigate(`/drills/${drill.id}`);
  };

  const getDifficultyColor = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    if (difficulty === 'beginner') return theme.palette.success.main;
    if (difficulty === 'intermediate') return theme.palette.info.main;
    return theme.palette.warning.main;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Select a Drill
      </Typography>
      
      <Grid container spacing={2}>
        {drills.map((drill: DrillType) => (
          <Grid
            key={drill.id}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}
            >
              <CardActionArea 
                onClick={() => handleDrillSelection(drill)}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  height: '100%',
                  p: 1
                }}
              >
                <CardContent sx={{ width: '100%', p: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        p: 1,
                        mr: 2,
                        width: 40,
                        height: 40
                      }}
                    >
                      <DynamicIcon iconName={drill.icon} />
                    </Box>
                    <Typography variant="h6" component="h2">
                      {drill.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {drill.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Chip 
                      label={`Difficulty: ${drill.difficulty}`}
                      size="small"
                      sx={{ 
                        bgcolor: getDifficultyColor(drill.difficulty),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {drill.estimatedTime ? `${drill.estimatedTime} min` : 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 