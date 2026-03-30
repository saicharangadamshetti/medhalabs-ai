import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/src/lib/utils';

interface AuraProps {
  isDemoMode: boolean;
  isHovered: boolean;
}

export function Aura({ isDemoMode, isHovered }: AuraProps) {
  return (
    <div className="relative w-full aspect-square max-w-xl mx-auto flex items-center justify-center">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: isHovered ? 1.1 : 1,
          opacity: isHovered ? 0.4 : 0.2,
        }}
        className="absolute inset-0 bg-mint-accent/20 blur-[120px] rounded-24"
      />

      {/* Main Aura Shape (Square) */}
      <motion.div
        animate={
          isDemoMode
            ? {
              scale: [1, 1.02, 1],
            }
            : {
              scale: [1, 1.03, 1],
            }
        }
        transition={{
          duration: isDemoMode ? 2 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "relative z-10 w-full h-full rounded-24 overflow-hidden flex items-center justify-center transition-all duration-500 shadow-2xl",
          isDemoMode
            ? "ring-4 ring-mint-accent/50"
            : "ring-1 ring-slate-200"
        )}
      >
        {/* Inner Ripple Rings (Demo Mode) */}
        <AnimatePresence>
          {isDemoMode && (
            <>
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.9, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 border-4 border-mint-accent rounded-24"
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Core Image/Visual */}
        <div className="w-full h-full">
          <motion.div
            animate={isDemoMode ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full h-full"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYZ2GRMNwqiBJzfDS5gAALhAK_Q9n4oEyUd5vHqgk5CUc0P5E3q2W_jjWbjb18zVr2eSlvC__MRbEXZim_iisQ70UjG2iLux4GHtLn3mPNnRUfDeUFODMIMyI9OvtDlS9G5qu8WEb1CWf0O5MysuJqAPtGUhoT-VyXo1ydkkujX5ct0rJJ08Kn2waXecfjTBEKwFhpNo2xL8G2kRzdqzw_whmSKIdNwC_PaoAPGLxI0pJ18rM5F7HtqZa839c3ILLFtvRPYVJn_XY"
              alt="Neural Aura Sculpture"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Floating Card Overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white flex items-center gap-4 z-20">
              <div className="w-12 h-12 rounded-xl bg-mint/10 flex items-center justify-center text-mint flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5v14M22 10v4M7 5v14M2 10v4" /></svg>
              </div>
              <div className="text-left">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Hi, I'm Emma</p>
                <p className="text-sm font-semibold text-slate-900">"Confirming an appointment for 2 PM..."</p>
              </div>
              <div className="ml-auto w-2.5 h-2.5 rounded-full bg-mint shadow-[0_0_10px_rgba(0,108,73,0.5)] animate-pulse" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, i % 2 === 0 ? 10 : -10, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute w-2 h-2 bg-mint/40 rounded-full"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
