import { useState, useRef, useCallback, useEffect } from 'react';

export type VoiceAgentType = 'openai' | 'gemini';

export function useVoiceAgent() {
  const [isCalling, setIsCalling] = useState(false);
  const [agentType, setAgentType] = useState<VoiceAgentType | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  const ws = useRef<WebSocket | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const processor = useRef<ScriptProcessorNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextPlayTime = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (processor.current) {
      processor.current.disconnect();
      processor.current = null;
    }
    if (microphone.current) {
      microphone.current.disconnect();
      microphone.current = null;
    }
    if (audioContext.current) {
      audioContext.current.close().catch(() => { });
      audioContext.current = null;
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsCalling(false);
    setAgentType(null);
    setStatus('idle');
  }, []);

  const playAudio = useCallback((base64Audio: string) => {
    if (!audioContext.current) return;

    try {
      const binaryString = window.atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;
      const view = new DataView(arrayBuffer);
      const audioData = new Float32Array(view.byteLength / 2);

      for (let i = 0; i < audioData.length; i++) {
        let int16 = view.getInt16(i * 2, true);
        audioData[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7FFF;
      }

      // 24kHz is standard for Gemini/OpenAI TTS output
      const sampleRate = 24000;
      const buffer = audioContext.current.createBuffer(1, audioData.length, sampleRate);
      buffer.copyToChannel(audioData, 0);

      const source = audioContext.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.current.destination);

      if (nextPlayTime.current < audioContext.current.currentTime) {
        nextPlayTime.current = audioContext.current.currentTime;
      }

      source.start(nextPlayTime.current);
      nextPlayTime.current += buffer.duration;
    } catch (e) {
      console.warn('Failed to play audio chunk', e);
    }
  }, []);

  const start = useCallback(async (type: VoiceAgentType, customUrl?: string) => {
    if (isCalling) return;
    
    setIsCalling(true);
    setAgentType(type);
    setStatus('connecting');

    // Default to production Gemini Live (Vikas) unless a custom URL is provided
    const wsUrl = customUrl || 'wss://medha-labs-ai.site/agent/vikas';

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = async () => {
      setStatus('connected');
      console.log('[RealTime] Connection established. Sending start message.');
      ws.current?.send(JSON.stringify({ type: 'start' }));

      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      nextPlayTime.current = audioContext.current.currentTime;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone.current = audioContext.current.createMediaStreamSource(stream);
        processor.current = audioContext.current.createScriptProcessor(2048, 1, 1);

        microphone.current.connect(processor.current);
        processor.current.connect(audioContext.current.destination);

        processor.current.onaudioprocess = (e) => {
          if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
          const channelData = e.inputBuffer.getChannelData(0);
          const buffer = new ArrayBuffer(channelData.length * 2);
          const view = new DataView(buffer);

          // floatTo16BitPCM
          for (let i = 0; i < channelData.length; i++) {
            let s = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
          }

          const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
          ws.current.send(JSON.stringify({ type: 'audio', audio: base64 }));
        };
      } catch (err) {
        console.error('Mic access error', err);
        setStatus('error');
        cleanup();
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'audio' && data.audio) {
          // Summary log to avoid flooding
          if (Math.random() < 0.01) console.log('[RealTime] Receiving audio data...');
          playAudio(data.audio);
        }
      } catch (e) {
        console.warn('Error parsing WS message', e);
      }
    };

    ws.current.onclose = () => {
      cleanup();
    };

    ws.current.onerror = () => {
      setStatus('error');
      cleanup();
    };
  }, [isCalling, cleanup, playAudio]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return { isCalling, agentType, status, start, stop: cleanup };
}
