"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGenericAgent = void 0;
const ws_1 = require("ws");
const genai_1 = require("@google/genai");
const index_1 = require("./prompts/index");
const tools_1 = require("./tools");
/**
 * Generic handler for Gemini Live connections with different agent personalities.
 */
const handleGenericAgent = async (ws, agentId) => {
    const systemInstruction = (0, index_1.getPrompt)(agentId);
    if (!systemInstruction) {
        console.error(`[Gemini SDK] No prompt found for agentId: ${agentId}`);
        ws.close();
        return;
    }
    // Only real-estate/vikas needs tools. 
    // Others (EdTech/E-commerce) should remain clean to avoid handshake issues.
    const needsTools = agentId === 'vikas' || agentId === 'real-estate';
    const toolsConfig = needsTools ? [{ functionDeclarations: tools_1.geminiTools }] : undefined;
    console.log(`[Gemini SDK] Agent Session Starting for: ${agentId} (Tools: ${needsTools})...`);
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set');
        ws.close();
        return;
    }
    const ai = new genai_1.GoogleGenAI({ apiKey: GEMINI_API_KEY });
    let session = null;
    try {
        session = await ai.live.connect({
            model: "gemini-3.1-flash-live-preview",
            config: {
                responseModalities: [genai_1.Modality.AUDIO],
                systemInstruction: systemInstruction,
                tools: toolsConfig
            },
            callbacks: {
                onopen: () => {
                    console.log(`[Gemini SDK] Connection established for ${agentId} securely via SDK.`);
                },
                onmessage: async (message) => {
                    if (message.serverContent?.modelTurn?.parts) {
                        for (const part of message.serverContent.modelTurn.parts) {
                            if (part.inlineData?.data) {
                                ws.send(JSON.stringify({
                                    type: 'audio',
                                    audio: part.inlineData.data
                                }));
                            }
                        }
                    }
                    if (message.toolCall && needsTools) {
                        const functionResponses = await Promise.all(message.toolCall.functionCalls.map(async (call) => {
                            try {
                                const result = (0, tools_1.executeTool)(call.name, call.args);
                                return { id: call.id, name: call.name, response: { result } };
                            }
                            catch (error) {
                                return { id: call.id, name: call.name, response: { error: error.message } };
                            }
                        }));
                        session.sendToolResponse({ functionResponses });
                    }
                    if (message.error) {
                        console.error(`[Gemini SDK] Server Error for ${agentId}:`, JSON.stringify(message.error, null, 2));
                    }
                },
                onerror: (error) => {
                    console.error(`[Gemini SDK] Stream Error for ${agentId}:`, error);
                },
                onclose: (event) => {
                    console.log(`[Gemini SDK] Session Closed for ${agentId}. Code: ${event?.code}, Reason: ${event?.reason}`);
                    if (ws.readyState === ws_1.WebSocket.OPEN)
                        ws.close();
                }
            }
        });
    }
    catch (error) {
        console.error("[Gemini SDK] Handshake Connection Failed:", error);
        ws.close();
        return;
    }
    ws.on('message', (data) => {
        try {
            if (!session)
                return;
            const clientMsg = JSON.parse(data.toString());
            if (clientMsg.type === 'audio' && clientMsg.audio) {
                session.sendRealtimeInput({
                    audio: {
                        mimeType: "audio/pcm;rate=16000",
                        data: clientMsg.audio
                    }
                });
            }
        }
        catch (e) {
            console.error('[Gemini SDK] Failed to ingest browser message:', e);
        }
    });
    ws.on('close', () => {
        if (session)
            session.close();
    });
};
exports.handleGenericAgent = handleGenericAgent;
