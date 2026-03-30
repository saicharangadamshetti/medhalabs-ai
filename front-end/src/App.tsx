import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AgentTabs } from './components/AgentTabs';
import { FeatureGrid } from './components/FeatureGrid';
import { Stats } from './components/Stats';
import { CTA } from './components/CTA';
import { FAQ } from './components/FAQ';
import { TranscriptBox } from './components/TranscriptBox';
import { ContactSales } from './components/ContactSales';
import { AnimatePresence, motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'contact'>('home');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {currentPage === 'home' ? (
        <main className="flex-grow">
          <Hero />
          <AgentTabs />
          <FeatureGrid />
          <FAQ />
          <CTA />
        </main>
      ) : (
        <main className="flex-grow">
          <ContactSales />
        </main>
      )}

      {/* Demo Mode Toggle */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsDemoMode(!isDemoMode)}
          className={`
            flex items-center gap-3 px-6 py-3 rounded-full font-bold text-sm shadow-2xl transition-all
            ${isDemoMode 
              ? 'bg-slate-900 text-white' 
              : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'}
          `}
        >
          <Terminal className={`w-4 h-4 ${isDemoMode ? 'text-mint' : 'text-slate-400'}`} />
          {isDemoMode ? 'Exit Demo Mode' : 'Enter Demo Mode'}
        </button>
      </div>

      {/* Transcript Box */}
      <AnimatePresence>
        {isDemoMode && <TranscriptBox />}
      </AnimatePresence>

      {/* Footer */}
      {currentPage === 'home' && (
        <footer className="w-full bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
              <div className="max-w-xs">
                <a className="text-2xl font-bold tracking-tighter text-slate-900 flex items-center gap-2 mb-6" href="#">
                  <img
                    alt="MedhaLabs AI Logo"
                    className="w-8 h-8 object-contain"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh0W8DwJC7a89OZ8k96ld54qlKO5vychcMnWjTE4KLyip46HtWSb2qyF0PYxXHjce45MyTEW967gOmjhhpn8wm_JmDC1S0rf5Hyva5HQFkjVV8O7iNEplEkWVlfMJVSpLfsp8kNuyBn2PQ6OTpweUYArILroXNzB1Em5GYFUDnVydHj9XxMKE6j5-TJ6IiODqTnURzlJIzzr1SXi6rhtgX7qPclf-b21roo8HpsrvgbeWYasm8SxG2K3QF0RRAr4IVuSblnMFS2-I"
                  />
                  MedhaLabs AI
                </a>
                <p className="text-slate-500 text-sm leading-relaxed">
                  The intelligence layer for secure, enterprise-grade voice automation. Deploy anywhere, automate everything.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                <div>
                  <h5 className="font-bold text-slate-900 mb-6 text-sm underline decoration-mint decoration-2 underline-offset-8">Product</h5>
                  <ul className="space-y-4 text-sm text-slate-500">
                    <li><a className="hover:text-mint transition-colors" href="#">Solutions</a></li>
                    <li><a className="hover:text-mint transition-colors" href="#">Features</a></li>
                    <li><a className="hover:text-mint transition-colors" href="#">Pricing</a></li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 mb-6 text-sm underline decoration-mint decoration-2 underline-offset-8">Company</h5>
                  <ul className="space-y-4 text-sm text-slate-500">
                    <li><a className="hover:text-mint transition-colors" href="#">About Us</a></li>
                    <li><a className="hover:text-mint transition-colors" href="#">Security</a></li>
                    <li><a className="hover:text-mint transition-colors" href="#">Privacy</a></li>
                  </ul>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <h5 className="font-bold text-slate-900 mb-6 text-sm underline decoration-mint decoration-2 underline-offset-8">Newsletter</h5>
                  <div className="flex gap-2">
                    <input
                      className="bg-slate-50 border-emerald-50 focus:ring-mint focus:border-mint rounded-full text-xs px-4 py-2 flex-1"
                      placeholder="Email address"
                      type="email"
                    />
                    <button className="bg-mint text-white p-2 rounded-full hover:scale-110 transition-transform">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-slate-100 text-[10px] font-bold tracking-widest uppercase text-slate-400">
              <p>© 2024 MedhaLabs AI. Agentic Intelligence. Data Sovereign.</p>
              <div className="flex gap-8">
                <a className="hover:text-mint transition-colors" href="#">Privacy Policy</a>
                <a className="hover:text-mint transition-colors" href="#">Terms</a>
                <a className="hover:text-mint transition-colors" href="#">Twitter</a>
                <a className="hover:text-mint transition-colors" href="#">LinkedIn</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
