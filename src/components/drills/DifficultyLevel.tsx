import React from 'react';
import { Chip, useTheme } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';

interface DifficultyLevelProps {
  level: string;
}

const DifficultyLevel: React.FC<DifficultyLevelProps> = ({ level }) => {
  const theme = useTheme();
  const { t } = useLanguage();
  
  const getColor = () => {
    switch(level.toLowerCase()) {
      case 'beginner':
        return theme.palette.success.main;
      case 'intermediate':
        return theme.palette.info.main;
      case 'advanced':
        return theme.palette.warning.main;
      default:
        return theme.palette.primary.main;
    }
  };
  
  return (
    <Chip 
      label={t(`pages.drills.${level.toLowerCase()}`, level)}
      size="small"
      sx={{ 
        backgroundColor: getColor(),
        color: 'white',
        fontWeight: 'bold',
        textTransform: 'capitalize'
      }}
    />
  );
};

export default DifficultyLevel; 