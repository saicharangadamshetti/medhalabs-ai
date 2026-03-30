import { WebSocket } from 'ws';
import { SYSTEM_INSTRUCTION } from './prompts/real-estate';
import { openAiTools, executeTool } from './tools';

export const handleOpenAIConnection = (ws: WebSocket) => {
  console.log('[OpenAI Route] Client connected.');

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    ws.close();
    return;
  }

  const openaiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
    headers: {
      "Authorization": "Bearer " + OPENAI_API_KEY,
      "OpenAI-Beta": "realtime=v1"
    }
  });

  openaiWs.on('open', () => {
    console.log('[OpenAI Route] Connected to OpenAI Realtime API');
    
    // Send session update with tools
    openaiWs.send(JSON.stringify({
      type: "session.update",
      session: {
        instructions: SYSTEM_INSTRUCTION,
        voice: "alloy",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        tools: openAiTools,
        tool_choice: "auto",
        temperature: 0.8
      }
    }));
  });

  // Handle messages from OpenAI -> send back to our client
  openaiWs.on('message', (data: any) => {
    try {
      const response = JSON.parse(data.toString());

      if (response.type === 'response.audio.delta' && response.delta) {
        // Send base64 audio delta directly to the frontend client
        ws.send(JSON.stringify({
          type: 'audio',
          audio: response.delta
        }));
      } else if (response.type === 'response.function_call_arguments.done') {
        const { call_id, name, arguments: argsString } = response;
        console.log(`[OpenAI Route] Function call requested: ${name}`);
        
        let args = {};
        try {
          args = JSON.parse(argsString);
        } catch (e) {
          console.error("Failed to parse args", argsString);
        }

        try {
          const result = executeTool(name, args);
          
          // Send tool output back to OpenAI
          openaiWs.send(JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: call_id,
              output: JSON.stringify(result)
            }
          }));

          // Trigger response generation after providing tool output
          openaiWs.send(JSON.stringify({
            type: "response.create"
          }));
          
        } catch (error: any) {
          console.error(`Error executing tool ${name}`, error);
        }
      } else if (response.type === 'error') {
        console.error('[OpenAI Route] Error from OpenAI:', response.error);
      }
    } catch (e) {
      console.error('[OpenAI Route] Failed to parse message from OpenAI', e);
    }
  });

  // Handle messages from client -> send to OpenAI
  ws.on('message', (data: any) => {
    try {
      const clientMsg = JSON.parse(data.toString());

      if (clientMsg.type === 'audio' && clientMsg.audio) {
        // Append audio from client microphone
        openaiWs.send(JSON.stringify({
          type: "input_audio_buffer.append",
          audio: clientMsg.audio
        }));
      } else if (clientMsg.type === 'start') {
        // Just acknowledging start
      }
    } catch (e) {
      console.error('[OpenAI Route] Failed to parse message from client', e);
    }
  });

  const cleanup = () => {
    if (openaiWs.readyState === WebSocket.OPEN) openaiWs.close();
    if (ws.readyState === WebSocket.OPEN) ws.close();
  };

  ws.on('close', cleanup);
  openaiWs.on('close', () => {
    console.log('[OpenAI Route] OpenAI disconnected.');
    cleanup();
  });
};
