# TraceIQ Frontend

A modern Next.js frontend for the TraceIQ anomaly detection system, built with Next.js 14, TypeScript, Tailwind CSS, and Apollo Client.

## Features

- **Real-time Monitoring**: Live anomaly detection with WebSocket subscriptions
- **AI-Powered Insights**: Google Gemini AI integration for intelligent threat analysis
- **Interactive Dashboard**: Comprehensive security overview with charts and metrics
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean, professional interface with smooth animations

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **GraphQL**: Apollo Client with WebSocket support
- **Charts**: Recharts for data visualization
- **Icons**: Heroicons
- **Notifications**: React Hot Toast
- **UI Components**: Headless UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- TraceIQ backend running on `http://localhost:4000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
echo "NEXT_PUBLIC_GRAPHQL_HTTP=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_WS=ws://localhost:4000/graphql" > .env.local
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Dashboard page
│   ├── anomalies/         # Anomalies page
│   ├── logs/              # Logs page
│   ├── insights/          # AI insights page
│   ├── error.tsx          # Error boundary
│   └── loading.tsx        # Loading component
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── Navbar.tsx        # Navigation bar
│   ├── DashboardStats.tsx # Dashboard statistics
│   ├── AnomaliesTable.tsx # Anomalies table
│   ├── AiInsightCard.tsx  # AI insights card
│   └── ...               # Other feature components
├── lib/                  # Utility libraries
│   ├── apollo-client.ts  # Apollo Client configuration
│   ├── graphql/          # GraphQL operations
│   └── utils/            # Utility functions
├── types/                # TypeScript type definitions
└── ...                   # Configuration files
```

## Pages

### Dashboard (`/`)
- Overview of all security metrics
- Recent anomalies table
- AI insights and risk assessment
- Log ingestion form for testing

### Anomalies (`/anomalies`)
- Complete list of all detected anomalies
- Filtering by severity and detection source
- Detailed anomaly information modals
- Real-time updates via subscriptions

### Logs (`/logs`)
- System logs and log entries
- Filter by IP address
- Search functionality
- Log entry details

### Insights (`/insights`)
- AI-powered security analysis
- Risk assessment with visual gauge
- Threat timeline charts
- Attack pattern detection
- AI-detected anomalies list

## Components

### Core Components
- **Navbar**: Navigation with theme toggle and live status
- **DashboardStats**: Key metrics and statistics cards
- **AnomaliesTable**: Interactive anomalies table with filtering
- **AiInsightCard**: AI analysis and risk assessment
- **RiskGauge**: Circular risk level indicator
- **ThreatTimeline**: Area chart showing threats over time
- **RealtimeMonitor**: WebSocket subscription handler
- **LogIngestForm**: Form for ingesting test logs

### UI Components
- **Badge**: Severity and status indicators
- **Card**: Content containers with headers
- **Button**: Interactive buttons with variants
- **Modal**: Anomaly details modal
- **LoadingSkeleton**: Loading state indicators

## Features

### Real-time Updates
- WebSocket connection to backend
- Live anomaly notifications
- Toast notifications for new threats
- Automatic UI updates

### AI Integration
- Google Gemini AI analysis
- Intelligent threat detection
- Confidence scoring
- Actionable recommendations
- Attack pattern recognition

### Dark Mode
- System preference detection
- Manual toggle
- Persistent theme selection
- Smooth transitions

### Responsive Design
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## Configuration

### Environment Variables
- `NEXT_PUBLIC_GRAPHQL_HTTP`: GraphQL HTTP endpoint
- `NEXT_PUBLIC_GRAPHQL_WS`: GraphQL WebSocket endpoint

### Tailwind Configuration
- Custom severity colors (critical, high, medium, low)
- Dark mode support
- Custom animations
- Responsive breakpoints

## Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Component-based architecture

## Deployment

The frontend can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Docker** container

### Build for Production
```bash
npm run build
npm start
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper error handling
4. Include loading states
5. Test on multiple devices
6. Update documentation

## License

MIT License - see LICENSE file for details.