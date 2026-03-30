import express from 'express';
import { WebSocketServer } from 'ws';
import * as http from 'http';
import dotenv from 'dotenv';
import path from 'path';

import { handleOpenAIConnection } from './openai';
import { handleGenericAgent } from './gemini';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const serveStatic = express.static(path.join(process.cwd(), 'public'));

// Serve static files for the local testing UI
app.use(serveStatic);

const server = http.createServer(app);

// Setup WebSocket server mapped to dynamic paths
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const url = req.url || '';
  const origin = req.headers.origin;
  
  // Basic origin check for production readiness
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'https://medha-labs-ai.site'];
  
  if (origin && !allowedOrigins.includes(origin) && process.env.NODE_ENV === 'production') {
    console.warn(`[WS] Blocked connection from unauthorized origin: ${origin}`);
    ws.close();
    return;
  }

  console.log(`[WS] Incoming connection to ${url} from ${origin}`);

  // Dynamic Routing
  if (url === '/openai') {
    handleOpenAIConnection(ws);
  } else if (url.startsWith('/agent/')) {
    const agentId = url.split('/').pop() || '';
    handleGenericAgent(ws, agentId);
  } else if (url === '/voice-widget-live' || url === '/gemini') {
    // Backward compatibility for legacy endpoints
    handleGenericAgent(ws, 'vikas');
  } else if (url === '/cart-recovery') {
    handleGenericAgent(ws, 'kartik');
  } else {
    console.warn(`[WS] Unknown path: ${url}`);
    ws.close();
  }
});

server.listen(port, () => {
  console.log(`Voice Agent testing server running on http://localhost:${port}`);
  console.log('Available WebSocket endpoints:');
  console.log(` - ws://localhost:${port}/agent/:id (vikas, kartik, sonali)`);
  console.log(` - ws://localhost:${port}/openai`);
});
