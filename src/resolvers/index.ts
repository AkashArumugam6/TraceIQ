import { PubSub } from 'graphql-subscriptions';
import { LogIngestResponse } from '../types/index.js';
import { prisma } from '../lib/prisma.js';

// Create a PubSub instance for subscriptions
export const pubsub = new PubSub();

export const resolvers = {
  Query: {
    anomalies: async () => {
      const anomalies = await prisma.anomaly.findMany({
        orderBy: { timestamp: 'desc' }
      });
      
      return anomalies.map(anomaly => ({
        id: anomaly.id.toString(),
        ip: anomaly.ip,
        severity: anomaly.severity,
        reason: anomaly.reason,
        timestamp: anomaly.timestamp.toISOString()
      }));
    }
  },

  Mutation: {
    ingestLog: async (_: any, { source, event, ip, user }: { source: string; event: string; ip: string; user: string }): Promise<LogIngestResponse> => {
      try {
        // Save log entry to database
        await prisma.logEntry.create({
          data: {
            source,
            event,
            ip,
            user,
            timestamp: new Date()
          }
        });

        // Create a dummy anomaly
        const anomaly = await prisma.anomaly.create({
          data: {
            ip,
            severity: 'low',
            reason: 'dummy anomaly',
            timestamp: new Date()
          }
        });

        // Publish the new anomaly to subscribers
        const anomalyForSubscription = {
          id: anomaly.id.toString(),
          ip: anomaly.ip,
          severity: anomaly.severity,
          reason: anomaly.reason,
          timestamp: anomaly.timestamp.toISOString()
        };

        pubsub.publish('ANOMALY_DETECTED', { anomalyDetected: anomalyForSubscription });

        console.log(`[LOG INGEST] Source: ${source}, Event: ${event}, IP: ${ip}, User: ${user}`);
        console.log(`[ANOMALY CREATED] ID: ${anomaly.id}, IP: ${anomaly.ip}`);

        return {
          success: true,
          message: 'Log received'
        };
      } catch (error) {
        console.error('Error ingesting log:', error);
        return {
          success: false,
          message: 'Failed to process log'
        };
      }
    }
  },

  Subscription: {
    anomalyDetected: {
      subscribe: () => pubsub.asyncIterator(['ANOMALY_DETECTED'])
    }
  }
};
