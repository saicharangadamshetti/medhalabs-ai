import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '99.99%', label: 'SLA Uptime' },
  { value: '<40ms', label: 'System Latency' },
  { value: 'Unlimited', label: 'Concurrent Agents' },
  { value: '0', label: 'Data Leak Risk' },
];

export function Stats() {
  return (
    <motion.section 
      id="scalability" 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="bg-white border-y border-slate-100 py-32"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Scalability at its peak.</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Lightning-fast inference and high-concurrency processing designed for massive enterprise demand.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-mint mb-3 tracking-tight">
                {stat.value}
              </div>
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
