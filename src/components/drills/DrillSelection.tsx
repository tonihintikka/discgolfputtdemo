import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Grid, 
  Box,
  Chip,
  Icon
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DrillType } from '../../types/drills';
import { getDrillTypes } from '../../services/drillService';
import DistanceDisplay from '../common/DistanceDisplay';

interface DrillSelectionProps {
  onSelectDrill: (drillId: string) => void;
}

const DrillSelection: React.FC<DrillSelectionProps> = ({ onSelectDrill }) => {
  const drillTypes = getDrillTypes();
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty: DrillType['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'primary';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleSelectDrill = (drillId: string) => {
    onSelectDrill(drillId);
    navigate(`/practice/${drillId}`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Putting Drills
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Select a drill to improve your putting skills
      </Typography>

      <Grid container spacing={3}>
        {drillTypes.map((drill) => (
          <Grid item xs={12} sm={6} md={4} key={drill.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Icon color="primary">{drill.icon}</Icon>
                  <Typography variant="h5" component="h2">
                    {drill.name}
                  </Typography>
                </Box>
                
                <Chip 
                  label={drill.difficulty.charAt(0).toUpperCase() + drill.difficulty.slice(1)} 
                  size="small" 
                  color={getDifficultyColor(drill.difficulty) as any}
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {drill.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Distance Range
                    </Typography>
                    <DistanceDisplay meters={drill.minDistance} variant="body2" />
                    <Typography variant="body2" sx={{ mx: 1, display: 'inline' }}>-</Typography>
                    <DistanceDisplay meters={drill.maxDistance} variant="body2" />
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Rounds
                    </Typography>
                    <Typography variant="body2">{drill.rounds}</Typography>
                  </Box>
                </Box>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="large" 
                  color="primary" 
                  fullWidth
                  variant="contained"
                  onClick={() => handleSelectDrill(drill.id)}
                >
                  Start Drill
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DrillSelection; 