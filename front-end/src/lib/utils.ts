import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAgentWsUrl(domainId: string, agentId: string) {
  const isLocal = window.location.hostname === 'localhost';
  const baseUrl = isLocal ? 'ws://localhost:3001' : 'wss://medha-labs-ai.site';
  return `${baseUrl}/agent/${domainId}/${agentId}`;
}
