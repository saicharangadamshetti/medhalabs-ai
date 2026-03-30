import { WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import { getPrompt } from './prompts/index';
import { geminiTools, executeTool } from './tools';

/**
 * Generic handler for Gemini Live connections with different agent personalities.
 */
export const handleGenericAgent = async (ws: WebSocket, agentId: string) => {
  const systemInstruction = getPrompt(agentId);

  if (!systemInstruction) {
    console.error(`[Gemini SDK] No prompt found for agentId: ${agentId}`);
    ws.close();
    return;
  }

  // Only real-estate/vikas needs tools. 
  // Others (EdTech/E-commerce) should remain clean to avoid handshake issues.
  const needsTools = agentId === 'vikas' || agentId === 'real-estate';
  const toolsConfig = needsTools ? [{ functionDeclarations: geminiTools as any }] : undefined;

  console.log(`[Gemini SDK] Agent Session Starting for: ${agentId} (Tools: ${needsTools})...`);

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    ws.close();
    return;
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  let session: any = null;

  try {
    session = await ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: systemInstruction,
        tools: toolsConfig
      },
      callbacks: {
        onopen: () => {
          console.log(`[Gemini SDK] Connection established for ${agentId} securely via SDK.`);
        },
        onmessage: async (message: any) => {
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
            const functionResponses = await Promise.all(
              message.toolCall.functionCalls.map(async (call: any) => {
                try {
                  const result = executeTool(call.name, call.args);
                  return { id: call.id, name: call.name, response: { result } };
                } catch (error: any) {
                  return { id: call.id, name: call.name, response: { error: error.message } };
                }
              })
            );
            session.sendToolResponse({ functionResponses });
          }

          if (message.error) {
            console.error(`[Gemini SDK] Server Error for ${agentId}:`, JSON.stringify(message.error, null, 2));
          }
        },
        onerror: (error: any) => {
          console.error(`[Gemini SDK] Stream Error for ${agentId}:`, error);
        },
        onclose: (event: any) => {
          console.log(`[Gemini SDK] Session Closed for ${agentId}. Code: ${event?.code}, Reason: ${event?.reason}`);
          if (ws.readyState === WebSocket.OPEN) ws.close();
        }
      }
    });

  } catch (error) {
    console.error("[Gemini SDK] Handshake Connection Failed:", error);
    ws.close();
    return;
  }

  ws.on('message', (data: any) => {
    try {
      if (!session) return;
      const clientMsg = JSON.parse(data.toString());
      if (clientMsg.type === 'audio' && clientMsg.audio) {
        session.sendRealtimeInput({
          audio: {
            mimeType: "audio/pcm;rate=16000",
            data: clientMsg.audio
          }
        });
      }
    } catch (e) {
      console.error('[Gemini SDK] Failed to ingest browser message:', e);
    }
  });

  ws.on('close', () => {
    if (session) session.close();
  });
};

