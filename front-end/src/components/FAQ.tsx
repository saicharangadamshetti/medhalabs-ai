import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'framer-motion';

const faqs = [
  {
    question: "What is Agentic Voice AI?",
    answer: "Unlike traditional IVRs, Agentic Voice AI utilizes large neural models to understand context, reason through complex workflows, and take autonomous actions within your connected business systems in real-time."
  },
  {
    question: "How does in-infrastructure deployment work?",
    answer: "We deploy our model containers directly onto your private cloud (AWS, Azure, GCP) or on-premise servers. This means your customer audio and data never travel to our servers, giving you 100% data sovereignty."
  },
  {
    question: "Does MedhaLabs AI support regional languages?",
    answer: "Yes, we specialize in high-fidelity multilingual support including English, Hindi, and regional Indian dialects. Our models are fine-tuned to understand local nuances and accents naturally."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto px-6 md:px-12 py-32"
    >
      <div className="text-center mb-16">
        <h2 className="text-[2.5rem] font-bold text-slate-900 mb-4 tracking-tight leading-tight">Frequently Asked Questions</h2>
        <p className="text-slate-500 text-lg">
          Everything you need to know about our agentic infrastructure.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={cn(
                "border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all duration-300",
                isOpen ? "border-emerald-100 shadow-md" : "hover:border-slate-300 shadow-sm"
              )}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-8 py-6 text-left flex justify-between items-center bg-white"
              >
                <span className="font-bold text-slate-900">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-slate-400 transition-transform duration-500",
                    isOpen ? "rotate-180 text-mint" : ""
                  )}
                />
              </button>
              <div
                className={cn(
                  "px-8 overflow-hidden transition-all duration-500 ease-in-out",
                  isOpen ? "max-h-60 pb-8 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="pt-4 border-t border-emerald-50 text-slate-600 leading-relaxed text-sm font-medium">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
