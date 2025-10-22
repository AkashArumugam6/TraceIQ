# TraceIQ

A Node.js anomaly detection system with AI-powered threat analysis built with TypeScript, Express, and Apollo Server.

## Features

- **GraphQL API** with real-time subscriptions
- **AI-powered analysis** using Google Gemini
- **Rule-based detection** for common threats
- **SQLite database** with Prisma ORM
- **Next.js frontend** with real-time dashboard

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file:
   ```env
   GEMINI_API_KEY=your_api_key_here
   AI_ANALYSIS_ENABLED=true
   ```

3. **Set up database**:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

## API Endpoints

- **GraphQL**: `http://localhost:4000/graphql`
- **Health Check**: `http://localhost:4000/healthz`
- **Frontend**: `http://localhost:3000`

## Detection Types

- **RULE**: Traditional rule-based detection (brute force, privilege escalation)
- **AI**: AI-detected anomalies using Gemini analysis
- **HYBRID**: Rule-based anomalies enhanced with AI insights

## Usage Examples

### Ingest Log
```graphql
mutation {
  ingestLog(
    source: "web-server"
    event: "login_attempt"
    eventType: "FAILED_LOGIN"
    ip: "192.168.1.100"
    user: "admin"
  ) {
    success
    message
  }
}
```

### Query Anomalies
```graphql
query {
  anomalies {
    id
    ip
    severity
    reason
    timestamp
    aiExplanation
    detectionSource
  }
}
```

### Subscribe to Real-time Anomalies
```graphql
subscription {
  anomalyDetected {
    id
    ip
    severity
    reason
    aiExplanation
    recommendedAction
  }
}
```

## Project Structure

```
src/
├── index.ts              # Main server
├── schema/typeDefs.ts    # GraphQL schema
├── resolvers/index.ts    # GraphQL resolvers
├── detection/rules.ts     # Detection rules
└── analysis/             # AI analysis modules

frontend/
├── app/                  # Next.js pages
├── components/           # React components
└── lib/graphql/         # GraphQL queries
```

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run prisma:studio  # Open database GUI
```