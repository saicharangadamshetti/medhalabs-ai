export interface AppConfig {
  readonly account: string;
  readonly region: string;
  readonly projectName: string;
  readonly instanceType: string;
  readonly vpcCidr: string;
}

export const appConfig: { [key: string]: AppConfig } = {
  'us-east-1': {
    account: '470362823291',
    region: 'us-east-1',
    projectName: 'medhalabs-voice-backend-us',
    instanceType: 't3.small', // Optimized for Gemini Live Handshake
    vpcCidr: '10.0.0.0/16',
  },
  'ap-south-1': {
    account: '470362823291',
    region: 'ap-south-1',
    projectName: 'medhalabs-voice-backend-in',
    instanceType: 't3.small',
    vpcCidr: '10.1.0.0/16',
  },
};

export const DEFAULT_REGION = 'ap-south-1';
