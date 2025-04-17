# Disc Golf Training PWA

A Progressive Web App for disc golf putting practice and training. This application helps disc golfers track their putting sessions, measure distances, and improve their game - all while working offline on the course.

## Features

- **Progressive Web App**: Installable on mobile devices with offline functionality
- **Putting Drills**: Track putting practice sessions and success rates with multiple drill types
  - Circle 1X (3-10m) practice
  - Circle 2 (10-20m) practice
  - 5/5 Putts game
- **Distance Tracker**: Comprehensive solution for measuring distances on the course
  - Hardware step sensor support (when available)
  - Accelerometer-based step detection fallback
  - Calibration for stride length
  - Step counting and distance calculation
- **Offline Support**: Full functionality without an internet connection
- **Responsive Design**: Works on all devices and orientations
- **Practice History**: View and filter your past putting sessions
- **Data Management**: Control your locally stored data with statistics and data clearing options

## Tech Stack

- **Frontend**: React 19+ with TypeScript
- **UI Framework**: Material UI (MUI) v7
- **Build Tool**: Vite 6+
- **PWA Support**: vite-plugin-pwa with Workbox
- **Routing**: React Router v7
- **Storage**: IndexedDB with Dexie.js 4
- **Motion Detection**: DeviceMotionEvent API and hardware step sensors

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/discgolfputt.git
cd discgolfputt

# Install dependencies
npm install

# Start development server
npm run dev

# For testing on mobile devices on the same network
npm run dev -- --host
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment

This project can be easily deployed to Vercel:

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Import the project in Vercel
3. Vercel will automatically detect it's a Vite project
4. Use default settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Deploy!

## Project Structure

```
disc-golf-pwa/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── common/      # Reusable UI components (DistanceDisplay, StanceSelector, DynamicIcon, etc.)
│   │   ├── drills/      # Drill-related components (DrillSelection, ActiveDrill, etc.)
│   │   ├── distance/    # Distance measurement components (DistanceMeter)
│   │   ├── stats/       # Statistics components (PracticeHistory)
│   │   ├── pedometer/   # Pedometer-related components (PedometerDisplay, PedometerSettings)
│   │   └── settings/    # Settings and data management components (DataManagement)
│   │   
│   ├── hooks/           # Custom React hooks (useStepDetector)
│   ├── services/        # Service layer
│   │   ├── storage/     # IndexedDB storage services
│   │   └── pedometer/   # Distance calculation and step detection
│   ├── types/           # TypeScript types (drills, measurements, etc.)
│   ├── pages/           # Page-level components
│   ├── App.tsx          # Main application with routes
│   └── main.tsx         # Application entry point
└── docs/                # Documentation and user stories
    ├── stories/         # User stories for project epics
    └── technical/       # Technical documentation and examples
```

## Offline Capabilities

This PWA works offline through:
- Service Worker caching with Workbox
- IndexedDB for local data storage
- Installable on mobile home screens

## Implemented Features

- Advanced Distance Tracker with hardware sensor support 
- Distance measurement history
- Data management with statistics and clearing options 
- Responsive grid layout for drill selection
- Offline-first architecture with IndexedDB

## Features in Development

- Statistics visualization with charts
- Backup and export functionality
- User accounts (optional) for cloud sync
- Social sharing of practice results

## License

MIT

---

Built with ❤️ for disc golfers
