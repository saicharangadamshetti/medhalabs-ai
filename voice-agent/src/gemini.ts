import { WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import { getAgentConfig } from './prompts/index';
import { geminiTools, executeTool } from './tools';

/**
 * Generic handler for Gemini Live connections with different agent personalities.
 */
export const handleGenericAgent = async (ws: WebSocket, domainId: string, agentId: string) => {

  const startTime = Date.now();

  const config = getAgentConfig(domainId, agentId);

  if (!config) {
    console.error(`[Gemini SDK] No config found for ${domainId}/${agentId}`);
    ws.close(4404, 'Agent Not Found');
    return;
  }

  const { prompt: systemInstruction, useTools } = config;
  const toolsConfig = useTools ? [{ functionDeclarations: geminiTools as any }] : undefined;

  console.log(`[Gemini SDK] [+${Date.now() - startTime}ms] Agent Session Starting for: ${domainId}/${agentId} (Tools: ${useTools})...`);

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    ws.close();
    return;
  }

  // REVERT: Create a fresh AI client for every session to avoid internal state pollution
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  let session: any = null;

  try {
    const modelName = "gemini-3.1-flash-live-preview";
    const promptLength = systemInstruction?.length || 0;
    console.log(`[Gemini SDK] [+${Date.now() - startTime}ms] Initializing session with model: ${modelName} (Prompt: ${promptLength} characters)`);

    session = await ai.live.connect({
      model: modelName,
      config: {
        // REVERT: Most stable configuration for Live 3.1
        responseModalities: [Modality.AUDIO],
        systemInstruction: systemInstruction || "You are a helpful assistant.",
        tools: toolsConfig,
      },
      callbacks: {
        onopen: () => {
          console.log(`[Gemini SDK] [+${Date.now() - startTime}ms] SDK Handshake successful. Live context established.`);
        },
        onmessage: async (message: any) => {
          // Debugging transcripts: Check multiple paths as the SDK delivery varies by model version
          const inputTranscript = message.serverContent?.inputTranscription?.text;
          if (inputTranscript) console.log(`\x1b[32m[User Transcript]:\x1b[0m [+${Date.now() - startTime}ms] ${inputTranscript}`);

          const outputTranscript = message.outputTranscription?.text;
          if (outputTranscript) console.log(`\x1b[34m[Model Transcript]:\x1b[0m [+${Date.now() - startTime}ms] ${outputTranscript}`);

          const modelTurn = message.serverContent?.modelTurn;
          if (modelTurn?.parts) {
            for (const part of modelTurn.parts) {
              if (part.text) console.log(`\x1b[34m[Model Part]:\x1b[0m [+${Date.now() - startTime}ms] ${part.text}`);
              if (part.inlineData?.data) {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ type: 'audio', audio: part.inlineData.data }));
                }
              }
            }
          }

          if (message.toolCall && useTools) {
            console.log(`[Gemini SDK] Tool call detected: ${message.toolCall.functionCalls[0].name}`);
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
            console.error(`[Gemini SDK] Received error:`, JSON.stringify(message.error, null, 2));
          }
        },
        onerror: (error: any) => {
          console.error(`[Gemini SDK] Stream Error:`, error);
        },
        onclose: (event: any) => {
          console.log(`[Gemini SDK] Session closed remotely. Code: ${event?.code}`);
          if (ws.readyState === WebSocket.OPEN) ws.close();
        }
      }
    });

    console.log(`[Gemini SDK] [+${Date.now() - startTime}ms] Session operational.`);

  } catch (error) {
    console.error("[Gemini SDK] Handshake Rejection:", error);
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
      console.error('[Gemini SDK] Failed to process message from browser:', e);
    }
  });

  ws.on('close', () => {
    if (session) {
      console.log(`[Gemini SDK] Cleaning up session for ${domainId}/${agentId} due to WS close.`);
      session.close();
    }
  });
};
