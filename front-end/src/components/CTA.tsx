import React from 'react';
import { motion } from 'framer-motion';

export function CTA() {
  return (
    <motion.section 
      id="pricing" 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="max-w-7xl mx-auto px-6 md:px-12 mb-32"
    >
      <div className="bg-white p-16 md:p-24 rounded-[3rem] text-center border border-slate-100 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-transparent -z-10 group-hover:scale-105 transition-transform duration-1000" />
        
        <h2 className="text-[2.5rem] md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
          Build the secure voice future.
        </h2>
        
        <p className="text-lg text-slate-500 max-w-xl mx-auto mb-12 leading-relaxed font-medium">
          MedhaLabs AI is the infrastructure layer for agentic voice. Automate high-volume workflows without compromising on security or personality.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-mint text-white px-10 py-5 rounded-full font-bold text-lg hover:shadow-xl hover:shadow-mint/20 hover:-translate-y-1 transition-all active:scale-95">
            Get Started
          </button>
          <button className="text-mint font-bold px-10 py-5 rounded-full border border-mint/20 hover:bg-emerald-50 transition-all active:scale-95">
            Contact Sales
          </button>
        </div>
      </div>
    </motion.section>
  );
}
