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

