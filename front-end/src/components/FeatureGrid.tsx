import { motion } from 'framer-motion';

// Mocking Material Icons with Lucide equivalents or similar to avoid extra deps if needed, 
// but the user's temp.html used Material Symbols. I'll use Lucide icons for consistency with our project.
import { Clock, Brain, Languages, ChevronDown } from 'lucide-react';

export function FeatureGrid() {
  return (
    <section className="bg-emerald-50/30 py-32" id="advantage">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 md:px-12"
      >
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">The MedhaLabs Advantage.</h2>
            <p className="text-slate-600 text-lg">
              Built for the complexity of enterprise scale and the nuances of human speech.
            </p>
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-bold text-mint flex items-center gap-2 cursor-pointer group uppercase tracking-widest">
              EXPLORE TECH STACK 
              <ChevronDown className="group-hover:translate-y-1 transition-transform" />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Point 1 */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-mint mb-10 group-hover:rotate-12 transition-transform">
              <Clock size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4 tracking-tight text-slate-900">Sub-500ms Response Time</h3>
            <p className="text-slate-500 leading-relaxed">
              Natural interruptions and seamless back-and-forth flow without awkward AI pauses. Conversations that feel instantaneous.
            </p>
          </div>

          {/* Point 2 */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-mint mb-10 group-hover:rotate-12 transition-transform">
              <Brain size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4 tracking-tight text-slate-900">Emotionally Intelligent</h3>
            <p className="text-slate-500 leading-relaxed">
              A specialized "Voice Brain" that detects customer mood, sentiment, and urgency, adjusting tone and response style accordingly.
            </p>
          </div>

          {/* Point 3 */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-mint mb-10 group-hover:rotate-12 transition-transform">
              <Languages size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4 tracking-tight text-slate-900">Multilingual Fluency</h3>
            <p className="text-slate-500 leading-relaxed">
              Native-level mastery in English, Hindi, and regional Indian dialects. Seamlessly switch languages mid-conversation.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
