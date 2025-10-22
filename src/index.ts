import 'dotenv/config';
import express from 'express';
import cors from 'cors';
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
import { analysisScheduler } from './analysis/scheduler.js';
import { aiAnalyzer } from './analysis/aiAnalyzer.js';
import { Anomaly } from './types/index.js';

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();
  
  // Enable CORS
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    credentials: true,
  }));
  
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
  
  // Start AI analysis scheduler
  if (aiAnalyzer.isAiEnabled()) {
    analysisScheduler.start();
    console.log('🤖 AI-powered analysis scheduler started');
  } else {
    console.log('⚠️  AI analysis disabled - check GEMINI_API_KEY configuration');
  }
}

startServer().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  analysisScheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  analysisScheduler.stop();
  process.exit(0);
});
