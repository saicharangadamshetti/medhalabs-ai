import { SYSTEM_INSTRUCTION as realEstate } from './real-estate';
import { SYSTEM_INSTRUCTION as cartRecovery } from './cart-recovery';
import { SYSTEM_INSTRUCTION as edtech } from './edtech';

export const PROMPTS: Record<string, string> = {
  'vikas': realEstate,
  'kartik': cartRecovery,
  'sonali': edtech,
  'real-estate': realEstate,
  'cart-recovery': cartRecovery,
  'edtech': edtech,
};

export const getPrompt = (agentId: string): string | undefined => {
  return PROMPTS[agentId.toLowerCase()];
};
