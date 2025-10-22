import { gql } from '@apollo/client'

export const INGEST_LOG = gql`
  mutation IngestLog(
    $source: String!
    $event: String!
    $eventType: String
    $ip: String!
    $user: String!
  ) {
    ingestLog(
      source: $source
      event: $event
      eventType: $eventType
      ip: $ip
      user: $user
    ) {
      success
      message
    }
  }
`

export const UPDATE_ANOMALY_STATUS = gql`
  mutation UpdateAnomalyStatus(
    $id: ID!
    $status: String!
    $resolutionNotes: String
    $resolvedBy: String
  ) {
    updateAnomalyStatus(
      id: $id
      status: $status
      resolutionNotes: $resolutionNotes
      resolvedBy: $resolvedBy
    ) {
      success
      message
    }
  }
`

export const TRIGGER_AI_ANALYSIS = gql`
  mutation TriggerAiAnalysis {
    triggerAiAnalysis {
      success
      message
    }
  }
`

