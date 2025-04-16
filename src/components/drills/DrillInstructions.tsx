import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Container,
  Divider,
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { DrillType } from '../../types/drills';
import { getDrillType } from '../../services/drillService';
import DistanceDisplay from '../common/DistanceDisplay';

const DrillInstructions: React.FC = () => {
  const { drillId } = useParams<{ drillId: string }>();
  const navigate = useNavigate();
  const [drill, setDrill] = React.useState<DrillType | undefined>(undefined);
  
  React.useEffect(() => {
    if (!drillId) return;
    
    const drillType = getDrillType(drillId);
    if (!drillType) {
      navigate('/drills');
      return;
    }
    
    setDrill(drillType);
  }, [drillId, navigate]);
  
  const handleStartDrill = () => {
    if (!drillId) return;
    navigate(`/practice/${drillId}/active`);
  };
  
  const handleBack = () => {
    navigate('/drills');
  };
  
  if (!drill) {
    return (
      <Container maxWidth="sm">
        <Alert severity="info">Loading drill information...</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {drill.name}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Difficulty
            </Typography>
            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
              {drill.difficulty}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="caption" color="text.secondary">
              Rounds
            </Typography>
            <Typography variant="body1">
              {drill.rounds}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="caption" color="text.secondary">
              Distance Range
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DistanceDisplay meters={drill.minDistance} variant="body1" showIcon={false} />
              <Typography variant="body1" sx={{ mx: 0.5 }}>-</Typography>
              <DistanceDisplay meters={drill.maxDistance} variant="body1" showIcon={false} />
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {drill.description}
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Instructions
          </Typography>
          <Typography variant="body1" paragraph>
            {drill.instructions}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined"
            onClick={handleBack}
          >
            Back to Drills
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleStartDrill}
            size="large"
          >
            Start Drill
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DrillInstructions; 