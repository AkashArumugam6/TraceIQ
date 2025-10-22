import { GoogleGenerativeAI } from '@google/generative-ai';
import { LogEntry, Anomaly } from '@prisma/client';
import { AiAnalysisResult, AiAnomaly } from '../types/ai.js';
import { SECURITY_ANALYSIS_PROMPT, MOCK_AI_RESPONSE } from './promptTemplates.js';

export class AiAnalyzer {
  private genAI: GoogleGenerativeAI | null = null;
  private isEnabled: boolean = false;

  constructor() {
    this.initializeGemini();
  }

  private initializeGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    const isEnabled = process.env.AI_ANALYSIS_ENABLED === 'true';

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('⚠️  GEMINI_API_KEY not configured. AI analysis disabled.');
      this.isEnabled = false;
      return;
    }

    if (!isEnabled) {
      console.log('ℹ️  AI analysis disabled via AI_ANALYSIS_ENABLED=false');
      this.isEnabled = false;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.isEnabled = true;
      console.log('🤖 AI analysis enabled with Google Gemini');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
      this.isEnabled = false;
    }
  }

  async analyzeLogsWithGemini(
    logs: LogEntry[],
    existingAnomalies: Anomaly[]
  ): Promise<AiAnalysisResult> {
    if (!this.isEnabled || !this.genAI) {
      console.log('🔄 AI analysis disabled, returning mock response');
      return MOCK_AI_RESPONSE;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Prepare log data for analysis
      const logsData = this.formatLogsForAnalysis(logs);
      const existingAnomaliesData = this.formatAnomaliesForAnalysis(existingAnomalies);
      
      // Build the prompt
      const prompt = SECURITY_ANALYSIS_PROMPT
        .replace('{LOGS_DATA}', logsData)
        .replace('{EXISTING_ANOMALIES}', existingAnomaliesData);

      console.log('🔍 Sending analysis request to Gemini AI...');
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📊 Received AI analysis response');
      
      // Parse JSON response
      const analysisResult = this.parseAiResponse(text);
      
      console.log(`✅ AI analysis complete: ${analysisResult.newAnomalies.length} new anomalies detected`);
      
      return analysisResult;
    } catch (error) {
      console.error('❌ Error in AI analysis:', error);
      
      // Return mock response on error to keep system running
      return MOCK_AI_RESPONSE;
    }
  }

  private formatLogsForAnalysis(logs: LogEntry[]): string {
    return logs.map(log => ({
      id: log.id,
      source: log.source,
      event: log.event,
      eventType: log.eventType,
      ip: log.ip,
      user: log.user,
      timestamp: log.timestamp.toISOString()
    })).map(log => 
      `[${log.timestamp}] ${log.source} - ${log.event} (${log.eventType}) - IP: ${log.ip} - User: ${log.user}`
    ).join('\n');
  }

  private formatAnomaliesForAnalysis(anomalies: Anomaly[]): string {
    return anomalies.map(anomaly => ({
      id: anomaly.id,
      ip: anomaly.ip,
      severity: anomaly.severity,
      reason: anomaly.reason,
      timestamp: anomaly.timestamp.toISOString()
    })).map(anomaly => 
      `[${anomaly.timestamp}] ${anomaly.severity} - ${anomaly.reason} - IP: ${anomaly.ip}`
    ).join('\n');
  }

  private parseAiResponse(text: string): AiAnalysisResult {
    try {
      // Clean the response text (remove markdown code blocks if present)
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanedText);
      
      // Validate the response structure
      if (!parsed.newAnomalies || !Array.isArray(parsed.newAnomalies)) {
        throw new Error('Invalid response structure: missing newAnomalies array');
      }

      // Validate each anomaly
      parsed.newAnomalies.forEach((anomaly: any, index: number) => {
        if (!anomaly.ip || !anomaly.severity || !anomaly.reason) {
          throw new Error(`Invalid anomaly at index ${index}: missing required fields`);
        }
        
        // Ensure confidence score is within valid range
        if (anomaly.confidenceScore && (anomaly.confidenceScore < 0 || anomaly.confidenceScore > 100)) {
          anomaly.confidenceScore = Math.max(0, Math.min(100, anomaly.confidenceScore));
        }
      });

      return {
        newAnomalies: parsed.newAnomalies,
        overallRiskScore: Math.max(0, Math.min(100, parsed.overallRiskScore || 0)),
        threatSummary: parsed.threatSummary || 'No specific threats detected',
        attackPatternsDetected: parsed.attackPatternsDetected || []
      };
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      console.log('Raw response:', text);
      
      // Return mock response on parsing error
      return MOCK_AI_RESPONSE;
    }
  }

  isAiEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const aiAnalyzer = new AiAnalyzer();

