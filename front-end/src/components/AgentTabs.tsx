import React, { useState } from 'react';
import { cn, getAgentWsUrl } from '@/src/lib/utils';
import { Play, Building2, Stethoscope, Shield, Utensils, ShoppingBag, Calendar, HeartPulse, Phone, PhoneOff, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceAgent } from '../hooks/useVoiceAgent';

const categories = [
  { id: 'ecommerce', name: 'E-commerce', icon: ShoppingBag },
  { id: 'healthcare', name: 'Healthcare', icon: Stethoscope },
  { id: 'edtech', name: 'EdTech', icon: Calendar },
  { id: 'bfsi', name: 'BFSI', icon: Shield },
  { id: 'hospitality', name: 'Hospitality', icon: Utensils },
  { id: 'real-estate', name: 'Real Estate', icon: Building2 },
];

const agents = {
  'ecommerce': [
    {
      slug: 'service-request',
      name: 'Service Request Agent',
      icon: ShoppingBag,
      role: 'For faulty appliances: verifies warranty, creates tickets, assigns technicians, and sends SMS confirmations instantly.',
      isLive: true,
      isRealTime: true
    },
    {
      slug: 'customer-support',
      name: 'Customer Support Agent',
      icon: ShoppingBag,
      role: '24/7 support for product enquiries, orders, refunds, and real-time delivery status tracking.',
      isLive: true,
      isRealTime: true
    },
    {
      slug: 'cart-reminder',
      name: 'Cart Reminder Agent',
      icon: ShoppingBag,
      role: 'Nudges customers to complete bookings by reminding them about items left in their cart with personalized incentives.',
      isLive: true,
      isRealTime: true
    },
  ],
  'healthcare': [
    {
      slug: 'appointment-booking',
      name: 'Appointment Booking Agent',
      icon: Calendar,
      role: 'Collects required patient information and streamlines doctor appointment bookings with seamless calendar integration.',
      isLive: true,
      isRealTime: true
    },
    {
      slug: 'follow-up',
      name: 'Follow Up Agent',
      icon: HeartPulse,
      role: 'Conducts post-treatment check-ins with patients to ensure recovery is on track and addresses any immediate concerns.',
      isLive: true,
      isRealTime: true
    },
  ],
  'edtech': [
    {
      slug: 'lead-qualification',
      name: 'Lead Qualification Agent',
      icon: Calendar,
      role: 'Engages with prospective students to understand learning goals, budget, and preferences to recommend the perfect course fit.',
      isLive: true,
      isRealTime: true
    },
  ],
  'bfsi': [
    {
      slug: 'payment-follow-ups',
      name: 'Payment Follow-ups Agent',
      icon: Shield,
      role: 'Gently follows up with customers to recover loan amounts or pending payment dues with a professional and respectful tone.',
      isLive: true,
      isRealTime: true
    },
    {
      slug: 'insurance-claim',
      name: 'Insurance Claim Assistant',
      icon: Shield,
      role: 'Assists customers in initiating claims or providing additional required information to expedite the settlement process.',
      isLive: false,
      isRealTime: true
    },
  ],
  'hospitality': [
    {
      slug: 'restaurant-front-desk',
      name: 'Restaurant Front Desk Agent',
      icon: Utensils,
      role: 'Answers queries related to reservations, timings, online orders, and handles adhoc enquiries during peak hours.',
      isLive: true,
      isRealTime: true
    },
    {
      slug: 'airlines-booking',
      name: 'Airlines Booking Support',
      icon: ShoppingBag,
      role: 'Provides guided information to book a flight or updates customers on their current booking details with zero latency.',
      isLive: false,
      isRealTime: true
    },
  ],
  'real-estate': [
    {
      slug: 'lead-qualification',
      name: 'Lead Qualification Agent (Vikas)',
      icon: Building2,
      role: 'Our loyal, enthusiastic sales expert. Vikas knows every property, remembers your preferences, and helps you find your home.',
      isLive: true,
      isRealTime: true
    },
  ],
};

export function AgentTabs() {
  const [activeTab, setActiveTab] = useState('healthcare');
  const realTime = useVoiceAgent();

  const handleCall = (agent: any) => {
    if (realTime.isCalling) {
      realTime.stop();
    } else if (agent.isLive) {
      const url = getAgentWsUrl(activeTab, agent.slug);
      realTime.start('gemini', url);
    }
  };

  return (
    <section className="relative py-32 overflow-hidden" id="agents">
      {/* Dynamic Background Auras */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-mint/5 rounded-full blur-[120px] animate-aura" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-mint/10 rounded-full blur-[100px] animate-aura" style={{ animationDelay: '-2s' }} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Voice Agents</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Meet the digital employees who handle your calls with zero latency and 100% personality.
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-2xl mb-12 flex flex-wrap gap-1 max-w-5xl mx-auto border border-slate-200 shadow-sm">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              disabled={realTime.isCalling}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                activeTab === cat.id
                  ? "bg-white shadow-sm text-mint-accent"
                  : "text-slate-500 hover:text-slate-900 text-xs sm:text-[13px]",
                realTime.isCalling && activeTab !== cat.id && "opacity-50 cursor-not-allowed"
              )}
            >
              <cat.icon className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline whitespace-nowrap">{cat.name}</span>
              <span className="lg:hidden whitespace-nowrap text-xs">{cat.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {agents[activeTab as keyof typeof agents].map((agent: any, idx) => {
              const isCurrentActive = realTime.isCalling && realTime.url?.includes(agent.slug) && realTime.url?.includes(activeTab);

              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="w-14 h-14 bg-mint/5 text-mint rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    <agent.icon className="w-7 h-7" />
                  </div>

                  <h4 className="font-bold text-xl mb-3 text-on-surface flex items-center gap-2">
                    {agent.name}
                    {agent.isLive && (
                      <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    )}
                  </h4>

                  <p className="text-sm text-on-surface-variant mb-10 min-h-[4rem] leading-relaxed">
                    {agent.role}
                  </p>

                  <div className="space-y-3">
                    {/* Voice Sample Button - Always visible */}
                    <button
                      className="w-full bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900 py-3.5 rounded-full flex items-center justify-center gap-2 font-bold transition-all text-sm active:scale-95 border border-emerald-100/50"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Hear Voice Sample
                    </button>

                    {/* Talk to Agent Button - Primary action */}
                    <button
                      disabled={realTime.isCalling && !isCurrentActive}
                      onClick={() => agent.isLive && handleCall(agent)}
                      className={cn(
                        "w-full py-3.5 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 font-bold text-sm",
                        isCurrentActive
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : agent.isLive
                            ? "bg-mint text-white hover:bg-mint-dark shadow-lg shadow-mint/20"
                            : "bg-white border border-slate-200 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {isCurrentActive ? (
                        <>
                          <PhoneOff className="w-4 h-4" />
                          End Live Call
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4" />
                          Talk to Agent (Live)
                        </>
                      )}
                    </button>
                  </div>

                  {isCurrentActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t border-slate-100"
                    >
                      <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-slate-400 mb-4 tracking-wider uppercase">
                        <div className="flex gap-1 h-3.5 items-end">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [4, 14, 4] }}
                              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                              className="w-1 bg-mint-accent rounded-full"
                            />
                          ))}
                        </div>
                        <span className="animate-pulse">
                          {realTime.status === 'connecting' ? 'Establishing link...' : 
                           realTime.status === 'not-found' ? 'Error 404: Agent Configuration Not Found' :
                           'Listening...'}
                        </span>
                      </div>
                      {realTime.status === 'not-found' && (
                        <p className="text-[10px] text-red-500 text-center mt-2 font-medium">
                          The requested agent profile is currently unavailable or misconfigured in the backend.
                        </p>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

