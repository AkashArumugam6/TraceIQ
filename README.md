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
- **Simulated anomaly detection** (generates dummy anomalies every 10 seconds)

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

## Simulated Anomaly Detection

The server automatically generates dummy anomalies every 10 seconds to demonstrate the subscription functionality.
