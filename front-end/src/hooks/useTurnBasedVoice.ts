import { useState, useRef, useCallback, useEffect } from 'react';

export type TurnBasedState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface TurnBasedOptions {
  url: string;
  agentId: string;
  sessionId?: string;
  silenceThreshold?: number; // Volume threshold for silence (0-1)
  silenceDuration?: number;  // How many ms of silence before triggering end
}

export function useTurnBasedVoice(options: TurnBasedOptions) {
  const [isCalling, setIsCalling] = useState(false);
  const [agentState, setAgentState] = useState<TurnBasedState>('idle');
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  const ws = useRef<WebSocket | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const processor = useRef<ScriptProcessorNode | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextPlayTime = useRef<number>(0);
  
  // VAD tracking
  const silenceStart = useRef<number | null>(null);
  const hasSpoken = useRef(false);
  
  // Ref for the current state to avoid stale closures in onaudioprocess
  const agentStateRef = useRef<TurnBasedState>('idle');
  useEffect(() => {
    agentStateRef.current = agentState;
  }, [agentState]);

  const cleanup = useCallback(() => {
    if (processor.current) {
      processor.current.disconnect();
      processor.current = null;
    }
    if (analyser.current) {
      analyser.current.disconnect();
      analyser.current = null;
    }
    if (microphone.current) {
      microphone.current.disconnect();
      microphone.current = null;
    }
    if (audioContext.current) {
      audioContext.current.close().catch(() => {});
      audioContext.current = null;
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsCalling(false);
    setAgentState('idle');
    setTranscript('');
    setStatus('idle');
    silenceStart.current = null;
    hasSpoken.current = false;
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
      
      // The backend returns WAV (with header)
      audioContext.current.decodeAudioData(bytes.buffer).then((buffer) => {
        if (!audioContext.current) return;
        const source = audioContext.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.current.destination);

        if (nextPlayTime.current < audioContext.current.currentTime) {
          nextPlayTime.current = audioContext.current.currentTime;
        }

        source.start(nextPlayTime.current);
        nextPlayTime.current += buffer.duration;
      });
    } catch (e) {
      console.warn('Failed to play audio chunk', e);
    }
  }, []);

  const triggerAudioEnd = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('[TurnBased] Auto-VAD: Silence detected. Sending audio.end');
      ws.current.send(JSON.stringify({ type: 'audio.end' }));
      setAgentState('thinking');
      silenceStart.current = null;
      hasSpoken.current = false;
    }
  }, []);

  const start = useCallback(async () => {
    if (isCalling) return;

    setIsCalling(true);
    setStatus('connecting');

    ws.current = new WebSocket(options.url);

    ws.current.onopen = () => {
      setStatus('connected');
      const sessionStart = {
        type: 'session.start',
        sessionId: options.sessionId || `session-${Math.random().toString(36).substr(2, 9)}`,
        agentId: options.agentId
      };
      console.log('[TurnBased] Sending session.start:', sessionStart);
      ws.current?.send(JSON.stringify(sessionStart));

      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      nextPlayTime.current = audioContext.current.currentTime;

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        if (!audioContext.current) return;
        
        microphone.current = audioContext.current.createMediaStreamSource(stream);
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 256;
        
        processor.current = audioContext.current.createScriptProcessor(2048, 1, 1);

        microphone.current.connect(analyser.current);
        analyser.current.connect(processor.current);
        processor.current.connect(audioContext.current.destination);

        const bufferLength = analyser.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        processor.current.onaudioprocess = (e) => {
          if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
          
          // Gate audio if the AI is thinking or speaking
          if (agentStateRef.current === 'thinking' || agentStateRef.current === 'speaking') {
            // Optional: Log once when gating starts
            return;
          }

          // 1. Send Audio Data
          const channelData = e.inputBuffer.getChannelData(0);
          const pcmBuffer = new ArrayBuffer(channelData.length * 2);
          const view = new DataView(pcmBuffer);
          for (let i = 0; i < channelData.length; i++) {
            let s = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
          }
          const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmBuffer)));
          
          const audioPayload = { 
            type: 'audio', 
            audio_base64: base64, 
            format: 'audio/wav', 
            sample_rate: 16000 
          };

          // Throttle logs for chunk sending to avoid console lag
          if (Math.random() < 0.05) {
            console.log('[TurnBased] Sending audio:', audioPayload);
          }
          
          ws.current.send(JSON.stringify(audioPayload));

          // 2. VAD: Monitor volume
          analyser.current?.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          const volume = average / 255; // Normalized volume
          
          const threshold = options.silenceThreshold || 0.05;
          const duration = options.silenceDuration || 1500;

          if (volume > threshold) {
            hasSpoken.current = true;
            silenceStart.current = null;
          } else if (hasSpoken.current) {
            if (!silenceStart.current) {
              silenceStart.current = Date.now();
            } else if (Date.now() - silenceStart.current > duration) {
              triggerAudioEnd();
            }
          }
        };
      }).catch((err) => {
        console.error('Mic access error', err);
        setStatus('error');
        cleanup();
      });
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`[TurnBased] Received ${data.type} from server:`, data);
        
        switch (data.type) {
          case 'state':
            console.log(`[TurnBased] Agent state changed to: ${data.state}`);
            setAgentState(data.state);
            break;
          case 'transcript':
            setTranscript(data.text);
            break;
          case 'reply.audio':
            playAudio(data.audio_base64);
            break;
          case 'reply.text':
            console.log('[TurnBased] AI text reply:', data.text);
            break;
          case 'error':
            console.error('[TurnBased] Error from server:', data.message);
            break;
        }
      } catch (e) {
        console.warn('Error parsing WS message', e);
      }
    };

    ws.current.onclose = () => cleanup();
    ws.current.onerror = () => {
      setStatus('error');
      cleanup();
    };
  }, [isCalling, options, cleanup, playAudio, triggerAudioEnd, agentState]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return { isCalling, agentState, transcript, status, start, stop: cleanup };
}
