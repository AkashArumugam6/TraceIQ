export interface AiAnomaly {
  ip: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  aiExplanation: string;
  recommendedAction: string;
  confidenceScore: number;
}

export interface AiAnalysisResult {
  newAnomalies: AiAnomaly[];
  overallRiskScore: number;
  threatSummary: string;
  attackPatternsDetected: string[];
}

export interface AiSummary {
  lastAnalysisTime: string;
  overallRiskScore: number;
  topThreats: string[];
  attackPatternsDetected: string[];
  totalAiAnomalies: number;
}

export type DetectionSource = 'RULE' | 'AI' | 'HYBRID';

export interface AnalysisCache {
  lastAnalysisTime: Date;
  processedLogIds: Set<number>;
  ttl: number; // Time to live in milliseconds
}

