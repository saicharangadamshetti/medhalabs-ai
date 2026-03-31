"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http = __importStar(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const openai_1 = require("./openai");
const gemini_1 = require("./gemini");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
const serveStatic = express_1.default.static(path_1.default.join(process.cwd(), 'public'));
// Serve static files for the local testing UI
app.use(serveStatic);
const server = http.createServer(app);
// Setup WebSocket server mapped to dynamic paths
const wss = new ws_1.WebSocketServer({ server });
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
        (0, openai_1.handleOpenAIConnection)(ws);
    }
    else if (url.startsWith('/agent/')) {
        const agentId = url.split('/').pop() || '';
        (0, gemini_1.handleGenericAgent)(ws, agentId);
    }
    else if (url === '/voice-widget-live' || url === '/gemini') {
        // Backward compatibility for legacy endpoints
        (0, gemini_1.handleGenericAgent)(ws, 'vikas');
    }
    else if (url === '/cart-recovery') {
        (0, gemini_1.handleGenericAgent)(ws, 'kartik');
    }
    else {
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
