import React from 'react';
import { SxProps } from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import StraightenIcon from '@mui/icons-material/Straighten';
import RepeatIcon from '@mui/icons-material/Repeat';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TimelineIcon from '@mui/icons-material/Timeline';
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus';
import NavigationIcon from '@mui/icons-material/Navigation';
import SpeedIcon from '@mui/icons-material/Speed';
import RouteIcon from '@mui/icons-material/Route';
import FlagIcon from '@mui/icons-material/Flag';
// New icons
import SportsGolfIcon from '@mui/icons-material/SportsGolf';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import Filter5Icon from '@mui/icons-material/Filter5';
import Filter1Icon from '@mui/icons-material/Filter1';
import Filter2Icon from '@mui/icons-material/Filter2';
import AdjustIcon from '@mui/icons-material/Adjust';
import LoopIcon from '@mui/icons-material/Loop';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

// Map icon names to their components
const iconMap: Record<string, React.ElementType> = {
  'gps_fixed': GpsFixedIcon,
  'straighten': StraightenIcon,
  'repeat': RepeatIcon,
  'fitness_center': FitnessCenterIcon,
  'timeline': TimelineIcon,
  'filter_center_focus': FilterCenterFocusIcon,
  'navigation': NavigationIcon,
  'speed': SpeedIcon,
  'route': RouteIcon,
  'flag': FlagIcon,
  // New icon mappings
  'sports_golf': SportsGolfIcon,
  'track_changes': TrackChangesIcon,
  'filter_5': Filter5Icon,
  'filter_1': Filter1Icon,
  'filter_2': Filter2Icon,
  'adjust': AdjustIcon,
  'loop': LoopIcon,
  'golf_course': GolfCourseIcon,
  'sports_martial_arts': SportsMartialArtsIcon,
  'leaderboard': LeaderboardIcon,
};

interface DynamicIconProps {
  iconName: string;
  sx?: SxProps;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ iconName, sx = {} }) => {
  const IconComponent = iconMap[iconName] || FlagIcon; // Fallback to FlagIcon if not found
  
  return <IconComponent sx={sx} />;
};

export default DynamicIcon; 