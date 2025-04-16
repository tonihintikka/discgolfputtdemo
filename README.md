# Disc Golf Training PWA

A Progressive Web App for disc golf putting practice and training. This application helps disc golfers track their putting sessions, measure distances, and improve their game - all while working offline on the course.

## Features

- **Progressive Web App**: Installable on mobile devices with offline functionality
- **Putting Drills**: Track putting practice sessions and success rates
- **Distance Measurement**: Built-in pedometer to measure distances using device motion sensors
- **Offline Support**: Full functionality without an internet connection
- **Responsive Design**: Works on all devices and orientations

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **UI Framework**: Material UI (MUI) v5
- **Build Tool**: Vite
- **PWA Support**: vite-plugin-pwa with Workbox
- **Routing**: React Router v6
- **Storage**: IndexedDB with Dexie.js
- **Motion Detection**: DeviceMotionEvent API

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
│   │   ├── layout/      # App shell components
│   │   └── common/      # Reusable UI components
│   │   
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Service layer
│   │   ├── storage/     # IndexedDB storage
│   │   └── pedometer/   # Distance calculation
│   ├── theme/           # Material UI theme
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
└── docs/                # Documentation
```

## Offline Capabilities

This PWA works offline through:
- Service Worker caching with Workbox
- IndexedDB for local data storage
- Installable on mobile home screens

## License

MIT

---

Built with ❤️ for disc golfers
