import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Anomaly {
    id: ID!
    ip: String!
    severity: String!
    reason: String!
    timestamp: String!
  }

  type LogIngestResponse {
    success: Boolean!
    message: String!
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
`;
