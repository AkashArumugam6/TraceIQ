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
