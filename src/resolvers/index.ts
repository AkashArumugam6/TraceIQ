import { PubSub } from 'graphql-subscriptions';
import { LogIngestResponse } from '../types/index.js';
import { AiSummary } from '../types/ai.js';
import { prisma } from '../lib/prisma.js';
import { AnomalyDetectionRules } from '../detection/rules.js';
import { analysisScheduler } from '../analysis/scheduler.js';

// Create a PubSub instance for subscriptions
export const pubsub = new PubSub();

export const resolvers = {
  Query: {
    anomalies: async (_: any, { limit = 15, offset = 0 }: { limit?: number; offset?: number }) => {
      // Get total count for pagination info
      const totalCount = await prisma.anomaly.count();
      
      // Get paginated anomalies
      const anomalies = await prisma.anomaly.findMany({
        include: {
          logEntry: true
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      });
      
      const hasNextPage = offset + limit < totalCount;
      const hasPreviousPage = offset > 0;
      
      return {
        anomalies: anomalies.map(anomaly => ({
          id: anomaly.id.toString(),
          ip: anomaly.ip,
          severity: anomaly.severity,
          reason: anomaly.reason,
          timestamp: anomaly.timestamp.toISOString(),
          aiExplanation: anomaly.aiExplanation,
          recommendedAction: anomaly.recommendedAction,
          detectionSource: anomaly.detectionSource || 'RULE',
          confidenceScore: anomaly.confidenceScore,
          logEntry: anomaly.logEntry ? {
            id: anomaly.logEntry.id.toString(),
            source: anomaly.logEntry.source,
            event: anomaly.logEntry.event,
            eventType: anomaly.logEntry.eventType,
            ip: anomaly.logEntry.ip,
            user: anomaly.logEntry.user,
            timestamp: anomaly.logEntry.timestamp.toISOString()
          } : null
        })),
        totalCount,
        hasNextPage,
        hasPreviousPage
      };
    },

    logsByIp: async (_: any, { ip }: { ip: string }) => {
      const logs = await prisma.logEntry.findMany({
        where: { ip },
        orderBy: { timestamp: 'desc' },
        take: 100
      });
      
      return logs.map(log => ({
        id: log.id.toString(),
        source: log.source,
        event: log.event,
        eventType: log.eventType,
        ip: log.ip,
        user: log.user,
        timestamp: log.timestamp.toISOString()
      }));
    },

    aiAnalysisSummary: async (): Promise<AiSummary> => {
      try {
        // Get AI analysis metadata
        const lastAnalysisTime = analysisScheduler.getLastAnalysisTime();
        
        // Get recent AI anomalies
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const aiAnomalies = await prisma.anomaly.findMany({
          where: {
            detectionSource: {
              in: ['AI', 'HYBRID']
            },
            timestamp: {
              gte: oneHourAgo
            }
          },
          orderBy: { timestamp: 'desc' }
        });

        // Calculate overall risk score based on recent anomalies
        const overallRiskScore = aiAnomalies.length > 0 
          ? Math.min(100, aiAnomalies.reduce((sum, anomaly) => sum + (anomaly.confidenceScore || 50), 0) / aiAnomalies.length)
          : 0;

        // Extract top threats and patterns
        const topThreats = [...new Set(aiAnomalies.map(a => a.reason))].slice(0, 5);
        const attackPatternsDetected = [...new Set(aiAnomalies.map(a => a.reason))].slice(0, 3);

        return {
          lastAnalysisTime: lastAnalysisTime.toISOString(),
          overallRiskScore: Math.round(overallRiskScore),
          topThreats,
          attackPatternsDetected,
          totalAiAnomalies: aiAnomalies.length
        };
      } catch (error) {
        console.error('Error fetching AI analysis summary:', error);
        return {
          lastAnalysisTime: new Date(0).toISOString(),
          overallRiskScore: 0,
          topThreats: [],
          attackPatternsDetected: [],
          totalAiAnomalies: 0
        };
      }
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
                logEntryId: logEntry.id,
                detectionSource: 'RULE',
                confidenceScore: 0.8
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
                logEntryId: logEntry.id,
                detectionSource: 'RULE',
                confidenceScore: 0.1
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
    },

    triggerAiAnalysis: async (): Promise<LogIngestResponse> => {
      try {
        console.log('🔧 Manual AI analysis triggered via GraphQL');
        await analysisScheduler.triggerAnalysis();
        
        return {
          success: true,
          message: 'AI analysis triggered successfully'
        };
      } catch (error) {
        console.error('❌ Error triggering AI analysis:', error);
        return {
          success: false,
          message: 'Failed to trigger AI analysis'
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
