import { gql } from '@apollo/client'

export const ANOMALY_DETECTED = gql`
  subscription AnomalyDetected {
    anomalyDetected {
      id
      ip
      severity
      reason
      timestamp
      aiExplanation
      recommendedAction
      detectionSource
      confidenceScore
      status
      resolutionNotes
      resolvedAt
      resolvedBy
      logEntry {
        id
        source
        event
        eventType
        ip
        user
        timestamp
      }
    }
  }
`

export const ANOMALY_DETECTED_SUBSCRIPTION = ANOMALY_DETECTED

