import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Anomaly {
    id: ID!
    ip: String!
    severity: String!
    reason: String!
    timestamp: String!
    aiExplanation: String
    recommendedAction: String
    detectionSource: String
    confidenceScore: Float
    logEntry: LogEntry
  }

  type LogEntry {
    id: ID!
    source: String!
    event: String!
    eventType: String
    ip: String!
    user: String!
    timestamp: String!
  }

  type LogIngestResponse {
    success: Boolean!
    message: String!
  }

  type AnomaliesResponse {
    anomalies: [Anomaly!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type Query {
    anomalies(limit: Int, offset: Int): AnomaliesResponse!
    logsByIp(ip: String!): [LogEntry!]!
    aiAnalysisSummary: AiSummary!
  }

  type AiSummary {
    lastAnalysisTime: String!
    overallRiskScore: Int!
    topThreats: [String!]!
    attackPatternsDetected: [String!]!
    totalAiAnomalies: Int!
  }

  type Mutation {
    ingestLog(source: String!, event: String!, eventType: String, ip: String!, user: String!): LogIngestResponse!
    triggerAiAnalysis: LogIngestResponse!
  }

  type Subscription {
    anomalyDetected: Anomaly!
  }
`;
