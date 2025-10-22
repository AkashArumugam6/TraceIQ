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

