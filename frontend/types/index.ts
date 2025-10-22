export interface LogEntry {
  id: string
  source: string
  event: string
  eventType?: string
  ip: string
  user: string
  timestamp: string
}

export interface Anomaly {
  id: string
  ip: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'critical' | 'high' | 'medium' | 'low'
  reason: string
  timestamp: string
  aiExplanation?: string
  recommendedAction?: string
  detectionSource: 'RULE' | 'AI' | 'HYBRID'
  confidenceScore?: number
  logEntry?: LogEntry
}

export interface AiSummary {
  lastAnalysisTime: string
  overallRiskScore: number
  topThreats: string[]
  attackPatternsDetected: string[]
  totalAiAnomalies: number
}

export interface LogIngestResponse {
  success: boolean
  message: string
}

export interface LogIngestInput {
  source: string
  event: string
  eventType?: string
  ip: string
  user: string
}

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type DetectionSource = 'RULE' | 'AI' | 'HYBRID'

// GraphQL Response Types
export interface GetAnomaliesResponse {
  anomalies: {
    anomalies: Anomaly[]
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface GetAiSummaryResponse {
  aiAnalysisSummary: AiSummary
}

export interface GetLogsByIpResponse {
  logsByIp: LogEntry[]
}

export interface IngestLogResponse {
  ingestLog: LogIngestResponse
}

export interface AnomalyDetectedResponse {
  anomalyDetected: Anomaly
}