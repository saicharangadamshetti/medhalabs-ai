import { SYSTEM_INSTRUCTION as ecommerceServiceRequest } from './ecommerce/service-request';
import { SYSTEM_INSTRUCTION as ecommerceCustomerSupport } from './ecommerce/customer-support';
import { SYSTEM_INSTRUCTION as ecommerceCartReminder } from './ecommerce/cart-reminder';
import { SYSTEM_INSTRUCTION as healthcareAppointmentBooking } from './healthcare/appointment-booking';

import { SYSTEM_INSTRUCTION as edtechLeadQualification } from './edtech/lead-qualification';
import { SYSTEM_INSTRUCTION as bfsiPaymentFollowUps } from './bfsi/payment-follow-ups';
import { SYSTEM_INSTRUCTION as bfsiInsuranceClaim } from './bfsi/insurance-claim';
import { SYSTEM_INSTRUCTION as hospitalityRestaurantFrontDesk } from './hospitality/restaurant-front-desk';
import { SYSTEM_INSTRUCTION as hospitalityHotelSurvey } from './hospitality/hotel-survey-agent';
import { SYSTEM_INSTRUCTION as realEstateLeadQualification } from './real-estate/lead-qualification';

export interface AgentConfig {
  prompt: string;
  useTools: boolean;
  voiceId: string;
}

export const AGENT_CONFIG: Record<string, Record<string, AgentConfig>> = {
  'ecommerce': {
    'service-request': { prompt: ecommerceServiceRequest, useTools: false, voiceId: 'Aoede' },
    'customer-support': { prompt: ecommerceCustomerSupport, useTools: false, voiceId: 'Aoede' },
    'cart-reminder': { prompt: ecommerceCartReminder, useTools: false, voiceId: 'Puck' },
  },
  'healthcare': {
    'appointment-booking': { prompt: healthcareAppointmentBooking, useTools: false, voiceId: 'Aoede' },
  },
  'edtech': {
    'lead-qualification': { prompt: edtechLeadQualification, useTools: false, voiceId: 'Aoede' },
  },
  'bfsi': {
    'payment-follow-ups': { prompt: bfsiPaymentFollowUps, useTools: false, voiceId: 'Aoede' },
    'insurance-claim': { prompt: bfsiInsuranceClaim, useTools: false, voiceId: 'Puck' },
  },
  'hospitality': {
    'restaurant-front-desk': { prompt: hospitalityRestaurantFrontDesk, useTools: false, voiceId: 'Aoede' },
    'hotel-survey': { prompt: hospitalityHotelSurvey, useTools: false, voiceId: 'Aoede' },
  },
  'real-estate': {
    'lead-qualification': { prompt: realEstateLeadQualification, useTools: true, voiceId: 'Puck' },
  },
};

export const getAgentConfig = (domainId: string, agentId: string): AgentConfig | undefined => {
  return AGENT_CONFIG[domainId.toLowerCase()]?.[agentId.toLowerCase()];
};
