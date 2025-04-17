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
  Grid,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getDrillTypes } from '../../services/drillService';
import DynamicIcon from '../common/DynamicIcon';
import { useLanguage } from '../../context/LanguageContext';

interface DrillSelectionProps {
  onDrillSelect: (drill: DrillType) => void;
}

export const DrillSelection: React.FC<DrillSelectionProps> = ({ onDrillSelect }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const drills = getDrillTypes();
  const { t } = useLanguage();

  const handleDrillSelection = (drill: DrillType) => {
    onDrillSelect(drill);
    navigate(`/drills/${drill.id}`);
  };

  const getDifficultyColor = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    if (difficulty === 'beginner') return theme.palette.success.main;
    if (difficulty === 'intermediate') return theme.palette.info.main;
    return theme.palette.warning.main;
  };

  // Helper to get translated drill name and description
  const getDrillTranslation = (drill: DrillType) => {
    let name = drill.name;
    let description = drill.description;
    
    // Map the drill IDs to their translation keys
    switch(drill.id) {
      case 'circle-1x':
        name = t('pages.drills.circle1', 'Circle 1X');
        description = t('pages.drills.circle1Desc', 'Practice putt from 3-10 meters (10-33 feet)');
        break;
      case 'circle-2':
        name = t('pages.drills.circle2', 'Circle 2');
        description = t('pages.drills.circle2Desc', 'Practice putt from 10-20 meters (33-66 feet)');
        break;
      case '5-5-putts':
        name = t('pages.drills.fivePutts', '5/5 Putts Game');
        description = t('pages.drills.fivePuttsDesc', 'Make 5 consecutive putts to advance to the next station');
        break;
    }
    
    return { name, description };
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('pages.drills.title', 'Select a Drill')}
        </Typography>
        
        <Grid container spacing={2}>
          {drills.map((drill: DrillType) => {
            const { name, description } = getDrillTranslation(drill);
            
            return (
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
                          {name}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Chip 
                          label={`${t('pages.drills.difficulty', 'Difficulty')}: ${t(`pages.drills.${drill.difficulty}`, drill.difficulty)}`}
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
            );
          })}
        </Grid>
      </Box>
    </Container>
  );
}; 