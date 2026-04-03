import express from 'express';
import twilio from 'twilio';

export const twilioRouter = express.Router();

let twilioClient: twilio.Twilio | null = null;
function getTwilioClient() {
  if (twilioClient) return twilioClient;
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    return twilioClient;
  }
  return null;
}

// Ensure body parser is mapped
twilioRouter.use(express.urlencoded({ extended: true }));
twilioRouter.use(express.json());

// PHASE 1: Outbound Call Trigger
// Used by your backend/system to dial a customer.
twilioRouter.post('/outbound', async (req, res) => {
  const client = getTwilioClient();
  if (!client) {
    return res.status(500).json({ error: "Twilio credentials missing in .env" });
  }

  const { to, domainId, agentId } = req.body;
  if (!to) {
    return res.status(400).json({ error: "Missing 'to' phone number" });
  }

  try {
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const host = req.get('host');
    
    // We attach the desired agent identity to the call URL
    const qs = `?domainId=${encodeURIComponent(domainId || 'real-estate')}&agentId=${encodeURIComponent(agentId || 'lead-qualification')}`;
    
    const call = await client.calls.create({
      url: `https://${host}/twilio/voice${qs}`,
      to,
      from: fromNumber!
    });
    
    res.json({ success: true, callSid: call.sid });
  } catch (error: any) {
    console.error("Outbound call failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// PHASE 1 & 2: Main Twilio Voice Webhook
// Twilio hits this when a call starts (both outbound delivery and inbound answers).
twilioRouter.post('/voice', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const connect = twiml.connect();
  
  const domainId = req.query.domainId || 'real-estate';
  const agentId = req.query.agentId || 'lead-qualification';

  // Open the duplex stream
  const stream = connect.stream({ url: `wss://${req.get('host')}/media-stream` });
  
  // Pass agent configs down to the media stream handler
  stream.parameter({ name: 'domainId', value: domainId as string });
  stream.parameter({ name: 'agentId', value: agentId as string });

  res.type('text/xml');
  res.send(twiml.toString());
});
