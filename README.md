# TraceIQ

A Node.js anomaly detection system built with TypeScript, Express, and Apollo Server for GraphQL.

## Features

- **GraphQL API** with Apollo Server
- **Real-time subscriptions** for anomaly detection
- **REST health check** endpoint
- **TypeScript** with ES modules
- **WebSocket support** for subscriptions

## GraphQL Schema

```graphql
type Anomaly {
  id: ID!
  ip: String!
  severity: String!
  reason: String!
  timestamp: String!
}

type Query {
  anomalies: [Anomaly!]!
}

type Mutation {
  ingestLog(source: String!, event: String!, ip: String!, user: String!): LogIngestResponse!
}

type Subscription {
  anomalyDetected: Anomaly!
}
```

## Installation

```bash
npm install
```

## Features

- **GraphQL API** with Apollo Server
- **Real-time subscriptions** for anomaly detection
- **REST health check** endpoint
- **TypeScript** with ES modules
- **WebSocket support** for subscriptions
- **SQLite database** with Prisma ORM
- **Persistent data storage** for logs and anomalies

## Database Setup

1. Generate Prisma client:
```bash
npm run prisma:generate
```

2. Run database migrations:
```bash
npm run prisma:migrate
```

3. (Optional) Open Prisma Studio to view data:
```bash
npm run prisma:studio
```

## 🤖 AI-Powered Analysis

TraceIQ now includes Google Gemini AI integration for intelligent threat detection and analysis.

### Getting Started with AI Analysis

1. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key for configuration

2. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   AI_ANALYSIS_ENABLED=true
   AI_ANALYSIS_INTERVAL_MINUTES=5
   AI_BATCH_SIZE=50
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Database Migration** (for AI fields):
   ```bash
   npm run prisma:migrate
   ```

### How AI Analysis Works

- **Scheduled Analysis**: AI runs every 5 minutes (configurable) to analyze recent logs
- **Batch Processing**: Analyzes up to 50 recent logs per cycle (configurable)
- **Intelligent Detection**: Identifies patterns missed by rule-based detection
- **Real-time Updates**: AI-detected anomalies are published via GraphQL subscriptions
- **Hybrid Detection**: Can enhance existing rule-based anomalies with AI insights

### Detection Sources

- **RULE**: Traditional rule-based detection (brute force, privilege escalation)
- **AI**: Pure AI-detected anomalies using Gemini analysis
- **HYBRID**: Rule-based anomalies enhanced with AI explanations and recommendations

### AI Analysis Features

- **Threat Pattern Recognition**: Identifies complex attack patterns across multiple logs
- **Contextual Analysis**: Considers timing, frequency, and relationships between events
- **Severity Assessment**: AI rates threats as CRITICAL, HIGH, MEDIUM, or LOW
- **Actionable Recommendations**: Provides specific remediation steps
- **Confidence Scoring**: AI confidence level (0-100) for each detection
- **Risk Assessment**: Overall system risk score based on recent activity

### Cost Considerations

- **Gemini Flash Free Tier**: 15 requests per minute
- **Batch Processing**: Reduces API calls by analyzing multiple logs together
- **Configurable Intervals**: Adjust analysis frequency based on your needs
- **Graceful Degradation**: System continues working if AI is unavailable

### Example AI-Generated Anomalies

```json
{
  "id": "123",
  "ip": "192.168.1.100",
  "severity": "HIGH",
  "reason": "Suspicious data exfiltration pattern",
  "aiExplanation": "Detected unusual data transfer patterns with large file sizes during off-hours, combined with multiple failed authentication attempts suggesting potential data breach attempt.",
  "recommendedAction": "Immediately block this IP, audit data access logs, and check for any unauthorized data transfers.",
  "detectionSource": "AI",
  "confidenceScore": 87
}
```

## Development

```bash
npm run dev
```

This will start the development server with hot reloading.

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## API Endpoints

- **GraphQL**: `http://localhost:4000/graphql`
- **Health Check**: `http://localhost:4000/healthz`
- **WebSocket**: `ws://localhost:4000/graphql`

## Usage Examples

### Query Anomalies

```graphql
query {
  anomalies {
    id
    ip
    severity
    reason
    timestamp
  }
}
```

### Ingest Log

```graphql
mutation {
  ingestLog(
    source: "web-server"
    event: "login_attempt"
    ip: "192.168.1.100"
    user: "admin"
  ) {
    success
    message
  }
}
```

### Subscribe to Anomalies

```graphql
subscription {
  anomalyDetected {
    id
    ip
    severity
    reason
    timestamp
    aiExplanation
    recommendedAction
    detectionSource
    confidenceScore
  }
}
```

### Query Logs by IP

```graphql
query {
  logsByIp(ip: "192.168.1.100") {
    id
    source
    event
    eventType
    ip
    user
    timestamp
  }
}
```

### Get AI Analysis Summary

```graphql
query {
  aiAnalysisSummary {
    lastAnalysisTime
    overallRiskScore
    topThreats
    attackPatternsDetected
    totalAiAnomalies
  }
}
```

## Project Structure

```
src/
├── index.ts              # Main server file
├── schema/
│   └── typeDefs.ts       # GraphQL schema definitions
├── resolvers/
│   └── index.ts          # GraphQL resolvers
└── types/
    └── index.ts          # TypeScript type definitions
```

## Database-Driven Anomaly Detection

Anomalies are now created automatically when logs are ingested via the `ingestLog` mutation. Each log ingestion creates a corresponding anomaly entry in the database and publishes it to subscribers.

## Database Schema

- **LogEntry**: Stores ingested logs with source, event, eventType, IP, user, and timestamp
- **Anomaly**: Stores detected anomalies with IP, severity, reason, timestamp, and reference to LogEntry

## Rule-based Detection

TraceIQ includes a modular rule-based anomaly detection system that analyzes incoming logs in real-time:

### Current Detection Rules

1. **Brute Force Detection**
   - **Trigger**: `eventType = "FAILED_LOGIN"`
   - **Logic**: Count failed login attempts from the same IP in the last 10 minutes
   - **Threshold**: > 5 failed attempts
   - **Severity**: HIGH
   - **Reason**: "Brute force attempt detected"

2. **Privilege Escalation Detection**
   - **Trigger**: `eventType` contains "sudo" or "root"
   - **Logic**: Pattern matching on event type
   - **Severity**: MEDIUM
   - **Reason**: "Privilege escalation detected"

3. **Geo Anomaly Detection** (Placeholder)
   - **Trigger**: Unusual geographic location
   - **Status**: Ready for implementation
   - **Future**: Integration with geolocation services

### Detection Architecture

- **Modular Design**: Rules are defined in `src/detection/rules.ts`
- **Error Handling**: Detection failures don't crash the ingestion process
- **Real-time**: Anomalies are published immediately via GraphQL subscriptions
- **Extensible**: Easy to add new rules or integrate AI-based detection

### Testing Detection Rules

```graphql
# Test brute force detection (run this 6 times quickly)
mutation {
  ingestLog(
    source: "auth-server"
    event: "login_failed"
    eventType: "FAILED_LOGIN"
    ip: "192.168.1.100"
    user: "attacker"
  ) {
    success
    message
  }
}

# Test privilege escalation detection
mutation {
  ingestLog(
    source: "system"
    event: "user_command"
    eventType: "sudo_command"
    ip: "10.0.0.50"
    user: "suspicious_user"
  ) {
    success
    message
  }
}
```
