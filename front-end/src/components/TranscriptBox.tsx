import React from 'react';
import { motion } from 'framer-motion';

export function TranscriptBox() {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] p-6"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-mint rounded-full animate-pulse" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Transcript</span>
        </div>
        
        <div className="space-y-4 max-h-48 overflow-y-auto pr-4">
          <div className="flex gap-4">
            <span className="text-mint font-bold text-sm shrink-0">AI:</span>
            <p className="text-slate-600 text-sm leading-relaxed">
              Hello! This is Julian from MedhaLabs Real Estate. I noticed you were looking at the property on 5th Avenue. Would you like to schedule a viewing for this Thursday?
            </p>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-400 font-bold text-sm shrink-0">User:</span>
            <p className="text-slate-600 text-sm leading-relaxed italic">
              [User is speaking...]
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
