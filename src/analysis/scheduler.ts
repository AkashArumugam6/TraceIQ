import * as cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { aiAnalyzer } from './aiAnalyzer.js';
import { pubsub } from '../resolvers/index.js';
import { AnalysisCache } from '../types/ai.js';

export class AnalysisScheduler {
  private cache: AnalysisCache = {
    lastAnalysisTime: new Date(), // Initialize to current time instead of epoch
    processedLogIds: new Set<number>(),
    ttl: 2 * 60 * 1000 // 2 minutes TTL
  };
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning = false;

  start() {
    const intervalMinutes = parseInt(process.env.AI_ANALYSIS_INTERVAL_MINUTES || '5');
    const cronExpression = `*/${intervalMinutes} * * * *`; // Every N minutes

    console.log(`🕐 Starting AI analysis scheduler (every ${intervalMinutes} minutes)`);

    this.cronJob = cron.schedule(cronExpression, async () => {
      if (this.isRunning) {
        console.log('⏳ AI analysis already running, skipping this cycle');
        return;
      }

      await this.runAnalysis();
    }, {
      scheduled: false
    });

    this.cronJob.start();
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob.destroy();
      this.cronJob = null;
    }
    console.log('🛑 AI analysis scheduler stopped');
  }

  private async runAnalysis() {
    this.isRunning = true;
    
    try {
      console.log('🔍 Starting AI analysis cycle...');
      
      // Check if we should skip this analysis (cache TTL)
      const now = new Date();
      if (now.getTime() - this.cache.lastAnalysisTime.getTime() < this.cache.ttl) {
        console.log('⏭️  Skipping analysis due to cache TTL');
        return;
      }

      // Fetch recent logs
      const batchSize = parseInt(process.env.AI_BATCH_SIZE || '50');
      const logs = await this.fetchRecentLogs(batchSize);
      
      if (logs.length === 0) {
        console.log('📭 No recent logs to analyze');
        return;
      }

      // Fetch recent anomalies for context
      const recentAnomalies = await this.fetchRecentAnomalies();
      
      console.log(`📊 Analyzing ${logs.length} logs and ${recentAnomalies.length} recent anomalies`);

      // Run AI analysis
      const analysisResult = await aiAnalyzer.analyzeLogsWithGemini(logs, recentAnomalies);
      
      // Process new anomalies
      await this.processNewAnomalies(analysisResult, logs);
      
      // Update cache
      this.cache.lastAnalysisTime = now;
      this.cache.processedLogIds.clear();
      logs.forEach(log => this.cache.processedLogIds.add(log.id));
      
      console.log(`✅ AI analysis complete: ${analysisResult.newAnomalies.length} new anomalies processed`);
      
    } catch (error) {
      console.error('❌ Error in AI analysis cycle:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async fetchRecentLogs(batchSize: number) {
    try {
      return await prisma.logEntry.findMany({
        take: batchSize,
        orderBy: { timestamp: 'desc' },
        where: {
          // Only fetch logs that haven't been processed recently
          id: {
            notIn: Array.from(this.cache.processedLogIds)
          }
        }
      });
    } catch (error) {
      console.error('❌ Error fetching recent logs:', error);
      return [];
    }
  }

  private async fetchRecentAnomalies() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      return await prisma.anomaly.findMany({
        where: {
          timestamp: {
            gte: oneHourAgo
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 100
      });
    } catch (error) {
      console.error('❌ Error fetching recent anomalies:', error);
      return [];
    }
  }

  private async processNewAnomalies(analysisResult: any, logs: LogEntry[]) {
    for (const aiAnomaly of analysisResult.newAnomalies) {
      try {
        // Find the most relevant log entry for this anomaly
        const relevantLog = this.findRelevantLog(aiAnomaly.ip, logs);
        
        // Check if this anomaly already exists (to avoid duplicates)
        const existingAnomaly = await this.findExistingAnomaly(aiAnomaly, relevantLog);
        
        if (existingAnomaly) {
          // Update existing anomaly to HYBRID if it was rule-based
          if (existingAnomaly.detectionSource === 'RULE') {
            await prisma.anomaly.update({
              where: { id: existingAnomaly.id },
              data: {
                detectionSource: 'HYBRID',
                aiExplanation: aiAnomaly.aiExplanation,
                recommendedAction: aiAnomaly.recommendedAction,
                confidenceScore: aiAnomaly.confidenceScore
              }
            });
            
            console.log(`🔄 Updated anomaly ${existingAnomaly.id} to HYBRID detection`);
          }
        } else {
          // Create new AI-detected anomaly
          const newAnomaly = await prisma.anomaly.create({
            data: {
              ip: aiAnomaly.ip,
              severity: aiAnomaly.severity.toLowerCase(),
              reason: aiAnomaly.reason,
              timestamp: new Date(),
              detectionSource: 'AI',
              aiExplanation: aiAnomaly.aiExplanation,
              recommendedAction: aiAnomaly.recommendedAction,
              confidenceScore: aiAnomaly.confidenceScore,
              logEntryId: relevantLog?.id
            }
          });

          // Publish to subscription
          const anomalyForSubscription = {
            id: newAnomaly.id.toString(),
            ip: newAnomaly.ip,
            severity: newAnomaly.severity,
            reason: newAnomaly.reason,
            timestamp: newAnomaly.timestamp.toISOString(),
            aiExplanation: newAnomaly.aiExplanation,
            recommendedAction: newAnomaly.recommendedAction,
            detectionSource: newAnomaly.detectionSource,
            confidenceScore: newAnomaly.confidenceScore
          };

          pubsub.publish('ANOMALY_DETECTED', { anomalyDetected: anomalyForSubscription });
          
          console.log(`🤖 Created AI anomaly ${newAnomaly.id}: ${aiAnomaly.reason} (${aiAnomaly.severity})`);
        }
      } catch (error) {
        console.error('❌ Error processing AI anomaly:', error);
      }
    }
  }

  private findRelevantLog(ip: string, logs: LogEntry[]) {
    // Find the most recent log from the same IP
    return logs.find(log => log.ip === ip) || logs[0];
  }

  private async findExistingAnomaly(aiAnomaly: any, relevantLog: LogEntry | undefined) {
    if (!relevantLog) return null;

    // Look for existing anomalies with similar characteristics
    return await prisma.anomaly.findFirst({
      where: {
        ip: aiAnomaly.ip,
        logEntryId: relevantLog.id,
        timestamp: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // Within last 10 minutes
        }
      }
    });
  }

  getLastAnalysisTime(): Date {
    return this.cache.lastAnalysisTime;
  }

  isAnalysisRunning(): boolean {
    return this.isRunning;
  }

  // Method to manually trigger analysis for testing
  async triggerAnalysis(): Promise<void> {
    console.log('🔧 Manually triggering AI analysis...');
    await this.runAnalysisForced();
  }

  // Force analysis without TTL check
  private async runAnalysisForced() {
    this.isRunning = true;
    
    try {
      console.log('🔍 Starting forced AI analysis cycle...');
      
      // Fetch recent logs
      const batchSize = parseInt(process.env.AI_BATCH_SIZE || '50');
      const logs = await this.fetchRecentLogs(batchSize);
      
      if (logs.length === 0) {
        console.log('📭 No recent logs to analyze');
        return;
      }

      // Fetch recent anomalies for context
      const recentAnomalies = await this.fetchRecentAnomalies();
      
      console.log(`📊 Analyzing ${logs.length} logs and ${recentAnomalies.length} recent anomalies`);

      // Run AI analysis
      const analysisResult = await aiAnalyzer.analyzeLogsWithGemini(logs, recentAnomalies);
      
      // Process new anomalies
      await this.processNewAnomalies(analysisResult, logs);
      
      // Update cache
      this.cache.lastAnalysisTime = new Date();
      this.cache.processedLogIds.clear();
      logs.forEach(log => this.cache.processedLogIds.add(log.id));
      
      console.log(`✅ Forced AI analysis complete: ${analysisResult.newAnomalies.length} new anomalies processed`);
      
    } catch (error) {
      console.error('❌ Error in forced AI analysis cycle:', error);
    } finally {
      this.isRunning = false;
    }
  }
}

// Export singleton instance
export const analysisScheduler = new AnalysisScheduler();

