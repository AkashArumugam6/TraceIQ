'use client'

import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_HTTP || 'http://localhost:4000/graphql',
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_WS || 'ws://localhost:4000/graphql',
    connectionParams: {
      // Add any auth headers if needed
    },
  })
)

// Split the link based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Anomaly: {
        fields: {
          timestamp: {
            merge: false,
          },
        },
      },
      LogEntry: {
        fields: {
          timestamp: {
            merge: false,
          },
        },
      },
    },
  }),
})

export { apolloClient as client }
