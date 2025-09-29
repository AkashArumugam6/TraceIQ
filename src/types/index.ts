export interface Anomaly {
  id: string;
  ip: string;
  severity: string;
  reason: string;
  timestamp: string;
}

export interface LogIngestResponse {
  success: boolean;
  message: string;
}

export interface LogIngestInput {
  source: string;
  event: string;
  ip: string;
  user: string;
}
