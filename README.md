# TraceIQ

A Node.js anomaly detection system with AI-powered threat analysis built with TypeScript, Express, and Apollo Server.

## Features

- **GraphQL API** with real-time subscriptions
- **AI-powered analysis** using Google Gemini
- **Rule-based detection** for common threats
- **SQLite database** with Prisma ORM
- **Next.js frontend** with real-time dashboard


## API Endpoints

- **GraphQL**: `http://localhost:4000/graphql`
- **Health Check**: `http://localhost:4000/healthz`
- **Frontend**: `http://localhost:3000`

## Detection Types

- **RULE**: Traditional rule-based detection (brute force, privilege escalation)
- **AI**: AI-detected anomalies using Gemini analysis
- **HYBRID**: Rule-based anomalies enhanced with AI insights
