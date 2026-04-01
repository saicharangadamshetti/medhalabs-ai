import { SYSTEM_INSTRUCTION as ecommerceServiceRequest } from './ecommerce/service-request';
import { SYSTEM_INSTRUCTION as ecommerceCustomerSupport } from './ecommerce/customer-support';
import { SYSTEM_INSTRUCTION as ecommerceCartReminder } from './ecommerce/cart-reminder';
import { SYSTEM_INSTRUCTION as healthcareAppointmentBooking } from './healthcare/appointment-booking';
import { SYSTEM_INSTRUCTION as healthcareFollowUp } from './healthcare/follow-up';
import { SYSTEM_INSTRUCTION as edtechLeadQualification } from './edtech/lead-qualification';
import { SYSTEM_INSTRUCTION as bfsiPaymentFollowUps } from './bfsi/payment-follow-ups';
import { SYSTEM_INSTRUCTION as bfsiInsuranceClaim } from './bfsi/insurance-claim';
import { SYSTEM_INSTRUCTION as hospitalityRestaurantFrontDesk } from './hospitality/restaurant-front-desk';
import { SYSTEM_INSTRUCTION as hospitalityAirlinesBooking } from './hospitality/airlines-booking';
import { SYSTEM_INSTRUCTION as realEstateLeadQualification } from './real-estate/lead-qualification';

export interface AgentConfig {
  prompt: string;
  useTools: boolean;
}

export const AGENT_CONFIG: Record<string, Record<string, AgentConfig>> = {
  'ecommerce': {
    'service-request': { prompt: ecommerceServiceRequest, useTools: false },
    'customer-support': { prompt: ecommerceCustomerSupport, useTools: false },
    'cart-reminder': { prompt: ecommerceCartReminder, useTools: false },
  },
  'healthcare': {
    'appointment-booking': { prompt: healthcareAppointmentBooking, useTools: false },
    'follow-up': { prompt: healthcareFollowUp, useTools: false },
  },
  'edtech': {
    'lead-qualification': { prompt: edtechLeadQualification, useTools: false },
  },
  'bfsi': {
    'payment-follow-ups': { prompt: bfsiPaymentFollowUps, useTools: false },
    'insurance-claim': { prompt: bfsiInsuranceClaim, useTools: false },
  },
  'hospitality': {
    'restaurant-front-desk': { prompt: hospitalityRestaurantFrontDesk, useTools: false },
    'airlines-booking': { prompt: hospitalityAirlinesBooking, useTools: false },
  },
  'real-estate': {
    'lead-qualification': { prompt: realEstateLeadQualification, useTools: true },
  },
};

export const getAgentConfig = (domainId: string, agentId: string): AgentConfig | undefined => {
  return AGENT_CONFIG[domainId.toLowerCase()]?.[agentId.toLowerCase()];
};
