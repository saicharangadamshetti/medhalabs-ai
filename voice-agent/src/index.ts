import express from 'express';
import { WebSocketServer } from 'ws';
import * as http from 'http';
import dotenv from 'dotenv';
import path from 'path';

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
  // Allowed origins from environment variable (CDK injected)
  const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    ...envOrigins
  ];

  if (origin && !allowedOrigins.includes(origin) && process.env.NODE_ENV === 'production') {
    console.warn(`[WS] Blocked connection from unauthorized origin: ${origin}`);
    ws.close();
    return;
  }

  console.log(`[WS] Incoming connection to ${url} from ${origin}`);

  // Dynamic Routing: /agent/:domainId/:agentId
  const parts = url.split('/').filter(Boolean);
  
  if (parts.length === 3 && parts[0] === 'agent') {
    const domainId = parts[1];
    const agentId = parts[2];
    handleGenericAgent(ws, domainId, agentId);
  } else {
    console.warn(`[WS] Unknown path or missing parameters: ${url}`);
    ws.close(4404, 'Path Not Found');
  }
});

server.listen(port, () => {
  console.log(`Voice Agent testing server running on http://localhost:${port}`);
  console.log('Available WebSocket endpoints:');
  console.log(` - ws://localhost:${port}/agent/:domainId/:agentId`);
});
