import { PubSub } from 'graphql-subscriptions';
import { LogIngestResponse } from '../types/index.js';
import { prisma } from '../lib/prisma.js';
import { AnomalyDetectionRules } from '../detection/rules.js';

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
    ingestLog: async (_: any, { source, event, eventType, ip, user }: { source: string; event: string; eventType?: string; ip: string; user: string }): Promise<LogIngestResponse> => {
      try {
        // Save log entry to database
        const logEntry = await prisma.logEntry.create({
          data: {
            source,
            event,
            eventType,
            ip,
            user,
            timestamp: new Date()
          }
        });

        console.log(`[LOG INGEST] Source: ${source}, Event: ${event}, EventType: ${eventType}, IP: ${ip}, User: ${user}`);

        // Run rule-based anomaly detection
        const logData = {
          source,
          event,
          eventType,
          ip,
          user,
          timestamp: new Date()
        };

        const detectedAnomalies = await AnomalyDetectionRules.detectAnomalies(logData);

        // Create anomalies for each detection result
        for (const anomalyData of detectedAnomalies) {
          try {
            const anomaly = await prisma.anomaly.create({
              data: {
                ip,
                severity: anomalyData.severity,
                reason: anomalyData.reason,
                timestamp: new Date(),
                logEntryId: logEntry.id
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

            console.log(`[ANOMALY DETECTED] ID: ${anomaly.id}, IP: ${anomaly.ip}, Severity: ${anomaly.severity}, Reason: ${anomaly.reason}`);
          } catch (anomalyError) {
            console.error('Error creating anomaly:', anomalyError);
            // Continue processing even if anomaly creation fails
          }
        }

        // If no anomalies were detected, create a default low-severity anomaly
        if (detectedAnomalies.length === 0) {
          try {
            const defaultAnomaly = await prisma.anomaly.create({
              data: {
                ip,
                severity: 'low',
                reason: 'No specific anomalies detected',
                timestamp: new Date(),
                logEntryId: logEntry.id
              }
            });

            const anomalyForSubscription = {
              id: defaultAnomaly.id.toString(),
              ip: defaultAnomaly.ip,
              severity: defaultAnomaly.severity,
              reason: defaultAnomaly.reason,
              timestamp: defaultAnomaly.timestamp.toISOString()
            };

            pubsub.publish('ANOMALY_DETECTED', { anomalyDetected: anomalyForSubscription });

            console.log(`[DEFAULT ANOMALY] ID: ${defaultAnomaly.id}, IP: ${defaultAnomaly.ip}`);
          } catch (anomalyError) {
            console.error('Error creating default anomaly:', anomalyError);
          }
        }

        return {
          success: true,
          message: 'Log received and processed'
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
