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
import { sessionStorage } from '../../services/storage/storageService';
import DistanceDisplay from '../common/DistanceDisplay';
import StanceSelector from '../common/StanceSelector';
import DrillProgress from './DrillProgress';
import PuttResult from './PuttResult';
import { useLanguage } from '../../context/LanguageContext';

const ActiveDrill: React.FC = () => {
  const { drillId, sessionId } = useParams<{ drillId?: string, sessionId?: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [drill, setDrill] = useState<DrillType | undefined>(undefined);
  const [rounds, setRounds] = useState<DrillRound[]>([]);
  const [session, setSession] = useState<DrillSession | undefined>(undefined);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [stance, setStance] = useState<StanceType>('normal');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize the drill and session
  useEffect(() => {
    const initializeDrill = async () => {
      try {
        setLoading(true);
        setError(null); // Reset any previous errors
        
        // If we have a sessionId, get the session and then the drill
        if (sessionId) {
          console.log('Loading session with ID:', sessionId, 'Type:', typeof sessionId);
          
          try {
            const existingSession = await sessionStorage.getSession(sessionId);
            
            if (!existingSession) {
              console.error(`Session not found with ID: ${sessionId}`);
              setError(`Session not found with ID: ${sessionId}. Please try again or start a new drill.`);
              setLoading(false);
              return;
            }
            
            console.log('Session loaded successfully:', existingSession);
            setSession(existingSession);
            
            const drillTypeId = existingSession.drillTypeId;
            console.log(`Loading drill type with ID: ${drillTypeId}`);
            
            const drillType = getDrillType(drillTypeId);
            if (!drillType) {
              setError(`Drill type not found for ID: ${drillTypeId}`);
              setLoading(false);
              return;
            }
            
            console.log('Drill type loaded:', drillType.name);
            setDrill(drillType);
            
            const drillRounds = getDrillRounds(drillTypeId);
            console.log(`Loaded ${drillRounds.length} rounds for drill`);
            setRounds(drillRounds);
            
            // Set current round based on attempts
            if (existingSession.attempts && existingSession.attempts.length > 0) {
              // Calculate which round we should be on based on attempts
              const highestRound = Math.max(...existingSession.attempts.map(a => a.round));
              console.log(`Setting current round to ${highestRound} based on existing attempts`);
              setCurrentRound(highestRound);
            }
          } catch (sessionError) {
            console.error('Error loading session:', sessionError);
            setError(`Error loading session: ${sessionError instanceof Error ? sessionError.message : String(sessionError)}`);
            setLoading(false);
            return;
          }
        }
        // Otherwise use the drillId directly
        else if (drillId) {
          const drillType = getDrillType(drillId);
          if (!drillType) {
            setError(`Drill type not found for ID: ${drillId}`);
            setLoading(false);
            return;
          }
          
          setDrill(drillType);
          setRounds(getDrillRounds(drillId));
          
          // Create a new session
          const newSession = createDrillSession(drillId);
          setSession(newSession);
          
          // Also save the session to storage
          try {
            await sessionStorage.saveSession(newSession);
          } catch (saveError) {
            console.error('Error saving new session:', saveError);
            // Continue anyway as we have the session in memory
          }
        }
        else {
          setError('No drill ID or session ID provided');
          setLoading(false);
          return;
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error initializing drill:', err);
        setError(`Failed to initialize drill: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };
    
    initializeDrill();
  }, [drillId, sessionId, navigate]);
  
  // Get the current round information
  const getCurrentRound = (): DrillRound | undefined => {
    return rounds.find(round => round.round === currentRound);
  };
  
  // Helper to get translated drill name, description and instructions
  const getDrillTranslation = (drill: DrillType) => {
    let name = drill.name;
    let instructions = drill.instructions;
    
    // Map the drill IDs to their translation keys
    switch(drill.id) {
      case 'circle-1x':
        name = t('pages.drills.circle1', 'Circle 1X');
        instructions = t('pages.drills.circle1Inst', 'Take 5 putts from each distance. Focus on consistent form and confident release.');
        break;
      case 'circle-2':
        name = t('pages.drills.circle2', 'Circle 2');
        instructions = t('pages.drills.circle2Inst', 'Take 5 putts from each distance. Focus on distance control and arc.');
        break;
      case '5-5-putts':
        name = t('pages.drills.fivePutts', '5/5 Putts Game');
        instructions = t('pages.drills.fivePuttsInst', 'Start at the closest distance. Make 5 consecutive putts to advance to the next distance. Miss a putt and you start over at that distance.');
        break;
    }
    
    return { name, instructions };
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
  
  if (loading) {
    return (
      <Container maxWidth="sm">
        <Alert severity="info">{t('common.loading', 'Loading drill...')}</Alert>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  if (!drill || !session) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error">{t('common.noDrillData', 'Drill data not found. Please try again.')}</Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/drills')}
          sx={{ mt: 2 }}
        >
          {t('common.backToDrills', 'Back to Drills')}
        </Button>
      </Container>
    );
  }
  
  const currentRoundInfo = getCurrentRound();
  const { name, instructions } = getDrillTranslation(drill);
  
  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {name}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {instructions}
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
                {t('common.round', 'Round')} {currentRound} {t('common.of', 'of')} {rounds.length}
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
                    {currentRoundInfo.instructions || t('common.takeYourPutt', 'Take your putt and record the result.')}
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
              {t('common.drillCompleted', 'Drill Completed!')}
            </Typography>
            
            {session.summary && (
              <Box sx={{ my: 2 }}>
                <Typography variant="body1">
                  {t('common.made', 'Made')}: {session.summary.madeAttempts} / {session.summary.totalAttempts} {t('common.putts', 'putts')}
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
                {t('common.viewResults', 'View Results')}
              </Button>
              
              <Button 
                variant="outlined"
                onClick={handleRestart}
              >
                {t('common.restartDrill', 'Restart Drill')}
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ActiveDrill; 