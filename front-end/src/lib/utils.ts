import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAgentWsUrl(agentId: string) {
  const isLocal = window.location.hostname === 'localhost';
  const protocol = isLocal ? 'ws' : 'wss';
  const host = isLocal ? 'localhost:3001' : 'medha-labs-ai.site';
  return `${protocol}://${host}/agent/${agentId}`;
}
