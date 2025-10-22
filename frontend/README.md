# TraceIQ Frontend - Enhanced Security Dashboard

A comprehensive Next.js frontend for TraceIQ, featuring advanced visualizations, real-time monitoring, and AI-powered security insights.

## 🚀 Features

### Advanced Dashboard Visualizations
- **Anomaly Heatmap**: Calendar heatmap showing anomaly density over the last 30 days
- **Severity Distribution**: Interactive donut chart with percentage breakdown by severity
- **Detection Source Comparison**: Bar chart comparing RULE vs AI vs HYBRID detections
- **Top Threatened IPs**: List of top 10 IPs with most anomalies, clickable for detailed analysis
- **Live Activity Feed**: Real-time scrollable feed of the last 20 log entries

### Enhanced Filtering & Search
- **Global Search**: Search across IPs, users, and keywords with debounced input
- **Advanced Filters**: Multi-select filters for severity, detection source, and status
- **Date Range Picker**: Last 24h, 7d, 30d, or custom date ranges
- **URL Persistence**: All filter states persist in URL parameters
- **Export Functionality**: Export filtered results to CSV/JSON

### IP Intelligence Panel
- **Comprehensive IP Analysis**: Detailed view when clicking any IP address
- **Activity Timeline**: Mini chart showing IP activity over time
- **Log History**: Paginated table of all logs from the IP
- **Anomaly History**: All anomalies associated with the IP
- **External Integrations**: Placeholder buttons for WHOIS lookup and threat intelligence

### Anomaly Workflow Management
- **Status Management**: OPEN, INVESTIGATING, FALSE_POSITIVE, RESOLVED
- **Action Buttons**: Quick status updates with resolution notes
- **Status History**: Track who resolved what and when
- **Status Filtering**: Filter anomalies by their current status
- **Colored Status Badges**: Visual indicators for easy status identification

### AI Analysis Enhancements
- **Manual Analysis Trigger**: On-demand AI analysis with loading states
- **Analysis History**: Track past analysis runs with risk score trends
- **High Confidence Filter**: Show only AI detections with >70% confidence
- **Real-time Updates**: Live updates when new AI analysis completes

### Performance & UX Improvements
- **Skeleton Loaders**: Beautiful loading states for all data-fetching components
- **Optimistic UI**: Immediate feedback for user actions
- **Debounced Search**: 300ms delay to prevent excessive API calls
- **Keyboard Shortcuts**: 
  - `/` for search
  - `Cmd+K` / `Ctrl+K` for command palette
  - `Esc` to close modals

### Notifications & Alerts
- **Notification Center**: Dropdown with last 20 anomalies grouped by severity
- **Unread Count Badge**: Visual indicator of new notifications
- **Browser Notifications**: Permission request for CRITICAL anomalies
- **Toast Notifications**: In-app notifications for user actions

### Settings & Configuration
- **AI Analysis Settings**: Configurable intervals and batch sizes
- **Notification Preferences**: Choose which severities trigger notifications
- **Theme Management**: Light, dark, or system theme preference
- **Detection Rules**: Enable/disable specific detection rules
- **Settings Export**: Download all settings as JSON

### Mobile Optimizations
- **Responsive Design**: Fully responsive across all screen sizes
- **Mobile Bottom Navigation**: Fixed bottom nav for easy mobile navigation
- **Touch-Friendly**: Optimized touch targets and gestures
- **Mobile Modals**: Full-screen modals on mobile devices

### Accessibility & Polish
- **ARIA Labels**: Proper accessibility labels throughout
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Focus Management**: Visible focus states and logical tab order
- **Screen Reader Support**: Proper semantic HTML and ARIA live regions
- **Color Contrast**: WCAG AA compliant color schemes

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Apollo Client with GraphQL
- **Charts**: Recharts for data visualizations
- **Icons**: Heroicons for consistent iconography
- **Notifications**: React Hot Toast
- **TypeScript**: Full type safety throughout

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── anomalies/         # Anomalies page with advanced filtering
│   ├── insights/          # AI insights with manual analysis
│   ├── logs/              # Logs page
│   ├── settings/          # Comprehensive settings page
│   └── page.tsx           # Enhanced dashboard
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── AnomalyHeatmap.tsx
│   ├── SeverityDistribution.tsx
│   ├── DetectionSourceComparison.tsx
│   ├── TopThreatenedIPs.tsx
│   ├── LiveActivityFeed.tsx
│   ├── IPDetailsPanel.tsx
│   ├── IPAddress.tsx
│   ├── GlobalSearch.tsx
│   ├── NotificationCenter.tsx
│   ├── CommandPalette.tsx
│   ├── ErrorBoundary.tsx
│   ├── EmptyState.tsx
│   └── MobileBottomNav.tsx
├── lib/                  # Utilities and configurations
│   ├── apollo-client.ts
│   ├── apollo-wrapper.tsx
│   ├── graphql/          # GraphQL queries, mutations, subscriptions
│   └── utils/            # Utility functions
└── types/                # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend server running on port 4000

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXT_PUBLIC_WS_ENDPOINT=ws://localhost:4000/graphql
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Info**: Blue (#06b6d4)

### Severity Colors
- **Critical**: Red (#dc2626)
- **High**: Orange (#ea580c)
- **Medium**: Yellow (#d97706)
- **Low**: Green (#16a34a)

### Status Colors
- **Open**: Red
- **Investigating**: Yellow
- **False Positive**: Gray
- **Resolved**: Green

## 📱 Mobile Features

### Bottom Navigation
- Dashboard, Anomalies, Logs, Insights, Settings
- Active state indicators
- Touch-optimized sizing

### Responsive Tables
- Horizontal scroll on mobile
- Stacked layouts for complex data
- Touch-friendly action buttons

### Mobile Modals
- Full-screen on mobile devices
- Swipe-to-close gestures
- Optimized content layout

## 🔧 Configuration

### AI Analysis Settings
- **Interval**: 2, 5, 10, 30, or 60 minutes
- **Batch Size**: 50, 100, 200, or 500 logs
- **Detection Methods**: AI, Hybrid, or both

### Notification Settings
- **Severity Levels**: Choose which levels trigger notifications
- **Notification Types**: Browser notifications, toast notifications
- **Real-time Updates**: Live anomaly detection alerts

### Detection Rules
- **Rule-based Detection**: Enable/disable traditional rules
- **Specific Rules**: Failed login, suspicious activity, unusual traffic, data exfiltration
- **AI Integration**: Configure AI analysis parameters

## 🎯 Key Components

### AnomalyHeatmap
```tsx
<AnomalyHeatmap />
```
Calendar heatmap showing anomaly density over time with color-coded intensity levels.

### SeverityDistribution
```tsx
<SeverityDistribution />
```
Interactive donut chart with tooltips and legend showing severity breakdown.

### IPDetailsPanel
```tsx
<IPDetailsPanel 
  ip="192.168.1.1" 
  isOpen={true} 
  onClose={() => setOpen(false)} 
/>
```
Comprehensive IP analysis with tabs for overview, logs, anomalies, and timeline.

### GlobalSearch
```tsx
<GlobalSearch onClose={() => setSearchOpen(false)} />
```
Full-text search across all data with keyboard shortcuts and result highlighting.

## 🚀 Performance Optimizations

### Data Fetching
- **Apollo Client Caching**: Intelligent caching with cache policies
- **Pagination**: Efficient data loading with cursor-based pagination
- **Debounced Search**: Prevents excessive API calls during typing

### UI Performance
- **Skeleton Loaders**: Immediate feedback during data loading
- **Optimistic Updates**: Instant UI updates for better perceived performance
- **Lazy Loading**: Components loaded only when needed

### Bundle Optimization
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Next.js automatic image optimization

## 🧪 Testing

### Component Testing
```bash
npm run test
```

### E2E Testing
```bash
npm run test:e2e
```

### Accessibility Testing
```bash
npm run test:a11y
```

## 📦 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
```bash
docker build -t traceiq-frontend .
docker run -p 3000:3000 traceiq-frontend
```

### Static Export
```bash
npm run build
npm run export
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow the existing component structure
- Use Tailwind CSS for styling
- Write meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our Discord community

---

**TraceIQ Frontend** - Advanced security monitoring made simple and beautiful.