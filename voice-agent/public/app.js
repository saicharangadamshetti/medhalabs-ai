let ws = null;
let audioContext = null;
let microphone = null;
let processor = null;

// Audio playback queue
const playbackQueue = [];
let isPlaying = false;
let nextPlayTime = 0;

const statusEl = document.getElementById('status');
const stopBtn = document.getElementById('stopBtn');
const btnOpenAI = document.getElementById('startOpenAI');
const btnGemini = document.getElementById('startGemini');

const setStatus = (msg) => { statusEl.innerText = msg; };

// Base64 helper
function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  // Convert 16-bit PCM arrays directly to base64
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

const startConnection = async (type) => {
  btnOpenAI.style.display = 'none';
  btnGemini.style.display = 'none';
  stopBtn.style.display = 'block';
  
  setStatus(`Connecting to ${type} flow...`);
  
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.host || 'localhost:3001';
  ws = new WebSocket(`${protocol}://${host}/${type}`);
  
  ws.onopen = async () => {
    setStatus(`Connected to ${type}. Starting mic...`);
    ws.send(JSON.stringify({ type: 'start' }));
    
    // Setup Audio Context at 16kHz for OpenAI/Gemini input
    audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    nextPlayTime = audioContext.currentTime;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      microphone = audioContext.createMediaStreamSource(stream);
      processor = audioContext.createScriptProcessor(2048, 1, 1);
      
      microphone.connect(processor);
      processor.connect(audioContext.destination);
      
      processor.onaudioprocess = (e) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        const channelData = e.inputBuffer.getChannelData(0);
        const buffer = new ArrayBuffer(channelData.length * 2);
        const view = new DataView(buffer);
        floatTo16BitPCM(view, 0, channelData);
        
        ws.send(JSON.stringify({
          type: 'audio',
          audio: arrayBufferToBase64(buffer)
        }));
      };
      
      setStatus(`Connected to ${type}. Speak now!`);
    } catch (err) {
      setStatus(`Mic error: ${err.message}`);
    }
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'audio' && data.audio) {
      playAudio(data.audio);
    }
  };

  ws.onclose = () => {
    cleanup();
  };
};

function playAudio(base64Audio) {
  if (!audioContext) return;
  
  try {
    const arrayBuffer = base64ToArrayBuffer(base64Audio);
    const view = new DataView(arrayBuffer);
    const audioData = new Float32Array(view.byteLength / 2);
    
    // Convert Int16 PCM to Float32
    for(let i=0; i<audioData.length; i++) {
      let int16 = view.getInt16(i * 2, true);
      audioData[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7FFF;
    }

    // Playback rate from Google/OpenAI typically 24kHz for TTS, we must resample or interpret correctly.
    // Assuming standard 24kHz for Google Gemini and OpenAI standard PCM voice
    const sampleRate = 24000; 
    const buffer = audioContext.createBuffer(1, audioData.length, sampleRate);
    buffer.copyToChannel(audioData, 0);

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    
    if (nextPlayTime < audioContext.currentTime) {
      nextPlayTime = audioContext.currentTime;
    }
    
    source.start(nextPlayTime);
    nextPlayTime += buffer.duration;
  } catch(e) {
    console.warn("Failed to decode base64 audio fragment", e);
  }
}

const cleanup = () => {
  if (processor) {
    processor.disconnect();
    processor = null;
  }
  if (microphone) {
    microphone.disconnect();
    microphone = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
  
  btnOpenAI.style.display = 'block';
  btnGemini.style.display = 'block';
  stopBtn.style.display = 'none';
  setStatus('Disconnected');
};

btnOpenAI.onclick = () => startConnection('openai');
btnGemini.onclick = () => startConnection('gemini');
stopBtn.onclick = cleanup;
