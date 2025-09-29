import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer, Server } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers, pubsub } from './resolvers/index.js';
import { Anomaly } from './types/index.js';

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();
  const httpServer: Server = createServer(app);

  // Create WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Create GraphQL schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Use WebSocket server for subscriptions
  const serverCleanup = useServer({ schema }, wsServer);

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  // Apply Apollo GraphQL middleware
  app.use('/graphql', express.json(), expressMiddleware(server));

  // Health check endpoint
  app.get('/healthz', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Start the server
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`📊 Health check available at http://localhost:${PORT}/healthz`);
    console.log(`🔌 WebSocket server ready at ws://localhost:${PORT}/graphql`);
  });

  console.log('📊 Anomaly detection is now database-driven via log ingestion');
}

startServer().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});
