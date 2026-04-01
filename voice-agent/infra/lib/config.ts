export interface AppConfig {
  readonly account: string;
  readonly region: string;
  readonly projectName: string;
  readonly instanceType: string;
  readonly vpcCidr: string;
  readonly domainName?: string;
  readonly hostedZoneId?: string;
  readonly allowedOrigins: string[];
}

export const appConfig: { [key: string]: AppConfig } = {
  'us-east-1': {
    account: '470362823291',
    region: 'us-east-1',
    projectName: 'medhalabs-voice-backend-us',
    instanceType: 't3.small', // Optimized for Gemini Live Handshake
    vpcCidr: '10.0.0.0/16',
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001'
    ],
  },
  'ap-south-1': {
    account: '470362823291',
    region: 'ap-south-1',
    projectName: 'medhalabs-voice-backend-in',
    instanceType: 't3.small',
    vpcCidr: '10.1.0.0/16',
    domainName: 'medha-labs-ai.site',
    hostedZoneId: 'Z00263211JORPM2EM8Q1S',
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001',
      'https://medha-labs-ai.site',
      'https://medha-labs-ai.com',
      'https://www.medha-labs-ai.com'
    ],
  },
};

export const DEFAULT_REGION = 'ap-south-1';
