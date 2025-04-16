import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Container,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { DrillType, DrillRound, DrillSession, PuttAttempt, StanceType } from '../../types/drills';
import { 
  getDrillType, 
  getDrillRounds, 
  createDrillSession, 
  recordPuttAttempt,
  completeDrillSession
} from '../../services/drillService';
import DistanceDisplay from '../common/DistanceDisplay';
import StanceSelector from '../common/StanceSelector';
import DrillProgress from './DrillProgress';
import PuttResult from './PuttResult';

const ActiveDrill: React.FC = () => {
  const { drillId } = useParams<{ drillId: string }>();
  const navigate = useNavigate();
  
  const [drill, setDrill] = useState<DrillType | undefined>(undefined);
  const [rounds, setRounds] = useState<DrillRound[]>([]);
  const [session, setSession] = useState<DrillSession | undefined>(undefined);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [stance, setStance] = useState<StanceType>('normal');
  
  // Initialize the drill and session
  useEffect(() => {
    if (!drillId) return;
    
    const drillType = getDrillType(drillId);
    if (!drillType) {
      navigate('/drills');
      return;
    }
    
    setDrill(drillType);
    setRounds(getDrillRounds(drillId));
    
    // Create a new session
    const newSession = createDrillSession(drillId);
    setSession(newSession);
    
  }, [drillId, navigate]);
  
  // Get the current round information
  const getCurrentRound = (): DrillRound | undefined => {
    return rounds.find(round => round.round === currentRound);
  };
  
  // Handle a putt result (hit or miss)
  const handlePuttResult = async (result: 'hit' | 'miss') => {
    if (!session || !drill) return;
    
    const currentRoundInfo = getCurrentRound();
    if (!currentRoundInfo) return;
    
    // Record the attempt
    const updatedSession = await recordPuttAttempt(
      session,
      currentRound,
      currentRoundInfo.distance,
      stance || currentRoundInfo.stance || 'normal',
      result,
      notes
    );
    
    setSession(updatedSession);
    setNotes('');
    
    // Check if we're done with this drill
    if (currentRound >= rounds.length) {
      const completedSession = await completeDrillSession(updatedSession);
      setSession(completedSession);
      setIsCompleted(true);
    } else {
      // Move to the next round
      setCurrentRound(currentRound + 1);
      
      // Reset stance to the next round's default stance if available
      const nextRound = rounds.find(round => round.round === currentRound + 1);
      if (nextRound?.stance) {
        setStance(nextRound.stance);
      }
    }
  };
  
  // Handle stance change
  const handleStanceChange = (newStance: StanceType) => {
    setStance(newStance);
  };
  
  // Handle notes change
  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(event.target.value);
  };
  
  // Handle viewing the results
  const handleViewResults = () => {
    if (!session) return;
    navigate(`/results/${session.id}`);
  };
  
  // Handle restarting the drill
  const handleRestart = () => {
    if (!drillId) return;
    
    // Create a new session
    const newSession = createDrillSession(drillId);
    setSession(newSession);
    setCurrentRound(1);
    setIsCompleted(false);
    setNotes('');
    
    // Reset stance to the first round's default stance if available
    const firstRound = rounds.find(round => round.round === 1);
    if (firstRound?.stance) {
      setStance(firstRound.stance);
    }
  };
  
  if (!drill || !session) {
    return (
      <Container maxWidth="sm">
        <Alert severity="info">Loading drill...</Alert>
      </Container>
    );
  }
  
  const currentRoundInfo = getCurrentRound();
  
  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {drill.name}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {drill.instructions}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {!isCompleted ? (
          <>
            <DrillProgress 
              currentRound={currentRound} 
              totalRounds={rounds.length} 
              attempts={session.attempts}
            />
            
            <Box sx={{ my: 3, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Round {currentRound} of {rounds.length}
              </Typography>
              
              {currentRoundInfo && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <DistanceDisplay 
                      meters={currentRoundInfo.distance} 
                      variant="h4"
                      showIcon
                    />
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {currentRoundInfo.instructions || "Take your putt and record the result."}
                  </Typography>
                  
                  <Box sx={{ my: 2 }}>
                    <StanceSelector 
                      value={stance || currentRoundInfo.stance || 'normal'} 
                      onChange={handleStanceChange}
                      chipMode
                    />
                  </Box>
                </>
              )}
              
              <PuttResult onResult={handlePuttResult} />
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h5" gutterBottom>
              Drill Completed!
            </Typography>
            
            {session.summary && (
              <Box sx={{ my: 2 }}>
                <Typography variant="body1">
                  Made: {session.summary.madeAttempts} / {session.summary.totalAttempts} putts
                </Typography>
                <Typography variant="h4" color="primary">
                  {session.summary.makePercentage.toFixed(1)}%
                </Typography>
              </Box>
            )}
            
            <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleViewResults}
              >
                View Results
              </Button>
              
              <Button 
                variant="outlined"
                onClick={handleRestart}
              >
                Restart Drill
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ActiveDrill; 