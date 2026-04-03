import { WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import { getAgentConfig } from './prompts/index';
import { geminiTools, executeTool } from './tools';
import { WaveFile } from 'wavefile';

export const handleTwilioStream = (ws: WebSocket) => {
  let streamSid: string | null = null;
  let session: any = null;
  let domainId = 'real-estate';
  let agentId = 'lead-qualification';
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY missing');
    ws.close();
    return;
  }
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  ws.on('message', async (message: string) => {
    try {
      const msg = JSON.parse(message);

      if (msg.event === 'start') {
        streamSid = msg.start.streamSid;
        
        // Extract parameters passed from TwiML
        const params = msg.start.customParameters || {};
        domainId = params.domainId || domainId;
        agentId = params.agentId || agentId;

        const config = getAgentConfig(domainId, agentId);
        if (!config) {
          console.error(`[TwilioStream] No config found for ${domainId}/${agentId}`);
          ws.close();
          return;
        }

        const { prompt: systemInstruction, useTools } = config;
        const toolsConfig = useTools ? [{ functionDeclarations: geminiTools as any }] : undefined;

        console.log(`[TwilioStream] Stream started: ${streamSid} (${domainId}/${agentId})`);

        // Connect Gemini
        session = await ai.live.connect({
          model: "gemini-3.1-flash-live-preview",
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: systemInstruction || "You are a helpful assistant.",
            tools: toolsConfig,
          },
          callbacks: {
            onopen: () => {
              console.log(`[Twilio->Gemini] Session open.`);
            },
            onmessage: async (geminiMsg: any) => {
              const modelTurn = geminiMsg.serverContent?.modelTurn;
              if (modelTurn?.parts) {
                for (const part of modelTurn.parts) {
                  // Text Transcript logging
                  if (part.text) {
                    console.log(`\x1b[34m[Twilio Agent Part]:\x1b[0m ${part.text}`);
                  }
                  
                  // Audio processing (Gemini 24kHz PCM -> Twilio 8kHz MuLaw)
                  if (part.inlineData?.data) {
                    if (ws.readyState === WebSocket.OPEN && streamSid) {
                      const b = Buffer.from(part.inlineData.data, 'base64');
                      const pcm24Data = new Int16Array(b.buffer, b.byteOffset, b.length / 2);
                      
                      const wavOut = new WaveFile();
                      wavOut.fromScratch(1, 24000, '16', pcm24Data); 
                      wavOut.toSampleRate(8000);
                      wavOut.toMuLaw();
                      
                      const mulawOut = Buffer.from((wavOut.data as any).samples as Uint8Array).toString('base64');
                      ws.send(JSON.stringify({
                        event: 'media',
                        streamSid: streamSid,
                        media: { payload: mulawOut }
                      }));
                    }
                  }
                }
              }

              if (geminiMsg.toolCall && useTools) {
                console.log(`[Twilio->Gemini] Tool call: ${geminiMsg.toolCall.functionCalls[0].name}`);
                const functionResponses = await Promise.all(
                  geminiMsg.toolCall.functionCalls.map(async (call: any) => {
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
              
              if (geminiMsg.error) {
                console.error(`[Twilio->Gemini] Error:`, JSON.stringify(geminiMsg.error, null, 2));
              }
            },
            onerror: (err: any) => console.error('[Twilio->Gemini] Connect Error', err),
            onclose: () => console.log('[Twilio->Gemini] Connect Closed')
          }
        });
      } else if (msg.event === 'media' && msg.media?.payload) {
        if (!session) return; // Wait until Gemini is connected
        
        // Twilio 8kHz MuLaw -> Gemini 16kHz PCM
        const mulawBuf = Buffer.from(msg.media.payload, 'base64');
        const wav = new WaveFile();
        wav.fromScratch(1, 8000, '8m', mulawBuf);
        wav.fromMuLaw();
        wav.toSampleRate(16000);
        
        const pcmBuf = wav.toBuffer().slice(44);
        
        session.sendRealtimeInput({
          audio: {
            mimeType: "audio/pcm;rate=16000",
            data: Buffer.from(pcmBuf).toString('base64')
          }
        });
      } else if (msg.event === 'mark') {
        // Not used right now but Twilio sends mark events
      } else if (msg.event === 'stop') {
        console.log(`[TwilioStream] Stream stopped by Twilio.`);
        if (session) session.close();
        ws.close();
      }
    } catch (e) {
      console.error('[TwilioStream] Error processing message:', e);
    }
  });

  ws.on('close', () => {
    if (session) session.close();
  });
};
