import { gql } from '@apollo/client'

export const GET_ANOMALIES = gql`
  query GetAnomalies($limit: Int, $offset: Int) {
    anomalies(limit: $limit, offset: $offset) {
      anomalies {
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
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
`

export const GET_AI_SUMMARY = gql`
  query GetAiSummary {
    aiAnalysisSummary {
      lastAnalysisTime
      overallRiskScore
      topThreats
      attackPatternsDetected
      totalAiAnomalies
    }
  }
`

export const GET_LOGS_BY_IP = gql`
  query GetLogsByIp($ip: String!) {
    logsByIp(ip: $ip) {
      id
      source
      event
      eventType
      ip
      user
      timestamp
    }
  }
`
