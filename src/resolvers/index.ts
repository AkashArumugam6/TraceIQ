import { PubSub } from 'graphql-subscriptions';
import { Anomaly, LogIngestResponse } from '../types/index.js';

// Create a PubSub instance for subscriptions
export const pubsub = new PubSub();

// Hardcoded anomalies data
const anomalies: Anomaly[] = [
  {
    id: '1',
    ip: '192.168.1.100',
    severity: 'HIGH',
    reason: 'Multiple failed login attempts',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    ip: '10.0.0.50',
    severity: 'MEDIUM',
    reason: 'Unusual data transfer pattern',
    timestamp: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
  },
  {
    id: '3',
    ip: '172.16.0.25',
    severity: 'LOW',
    reason: 'Suspicious user agent string',
    timestamp: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
  }
];

export const resolvers = {
  Query: {
    anomalies: () => anomalies
  },

  Mutation: {
    ingestLog: (_: any, { source, event, ip, user }: { source: string; event: string; ip: string; user: string }): LogIngestResponse => {
      console.log(`[LOG INGEST] Source: ${source}, Event: ${event}, IP: ${ip}, User: ${user}`);
      return {
        success: true,
        message: 'Log received'
      };
    }
  },

  Subscription: {
    anomalyDetected: {
      subscribe: () => pubsub.asyncIterator(['ANOMALY_DETECTED'])
    }
  }
};
