import React from 'react';
import { Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INDUSTRIES = [
  "E-commerce & Retail",
  "Hospitals & Clinics",
  "EdTech & Learning",
  "BFSI & Insurance",
  "Restaurants & Hospitality"
];

export function Hero() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % INDUSTRIES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="min-h-screen flex items-center relative pt-20 overflow-hidden" id="solutions">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-100/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-emerald-50/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-mint text-[10px] font-bold tracking-widest uppercase mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          Voice Workforce 2.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[clamp(2.5rem,5vw,4rem)] leading-[1.1] tracking-[-0.04em] font-bold text-slate-900 mb-8"
        >
          Human-like AI Voice Agents For <br className="hidden lg:block" />
          <span className="text-mint inline-flex flex-col h-[1.1em] overflow-hidden relative align-bottom">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={index}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                {INDUSTRIES[index]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-600 max-w-2xl mb-12 leading-relaxed mx-auto"
        >
          The first AI voice workforce that sounds, listens, and responds exactly like a human. Deploy autonomous digital employees that handle your most critical business conversations with human-level intelligence and 100% compliance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <button
            className="group bg-mint text-white px-10 py-5 rounded-full font-bold text-xl hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            Try our Voice Agent <Phone className="group-hover:rotate-12 transition-transform" size={20} />
          </button>
          <button
            className="bg-white border border-slate-200 text-slate-700 px-8 py-5 rounded-full font-bold text-lg hover:bg-slate-50 transition-all shadow-sm"
          >
            Book a Demo
          </button>
        </motion.div>
      </div>
    </section>
  );
}
