import React from 'react';
import { cn } from '@/src/lib/utils';

const navItems = [
  { name: 'Solutions', href: '#solutions' },
  { name: 'Our Agents', href: '#agents' },
  { name: 'Advantage', href: '#advantage' },
  { name: 'Pricing', href: '#pricing' },
];

export function Header({ currentPage = 'home', setCurrentPage }: { currentPage?: 'home' | 'contact', setCurrentPage?: (p: 'home' | 'contact') => void }) {
  // Navigation is sticky via CSS class 'glass-nav' but we'll use standard Tailwind for transparency-to-white transition
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 w-full z-[100] transition-all duration-500 py-4",
      isScrolled ? "bg-white/80 backdrop-blur-xl shadow-sm" : "bg-transparent"
    )}>
      <div className="flex justify-between items-center px-6 md:px-12 py-0 max-w-7xl mx-auto w-full">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setCurrentPage?.('home'); }}
          className="text-2xl font-bold tracking-tighter text-slate-900 flex items-center gap-2"
        >
          <img
            alt="MedhaLabs AI Logo"
            className="w-8 h-8 object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh0W8DwJC7a89OZ8k96ld54qlKO5vychcMnWjTE4KLyip46HtWSb2qyF0PYxXHjce45MyTEW967gOmjhhpn8wm_JmDC1S0rf5Hyva5HQFkjVV8O7iNEplEkWVlfMJVSpLfsp8kNuyBn2PQ6OTpweUYArILroXNzB1Em5GYFUDnVydHj9XxMKE6j5-TJ6IiODqTnURzlJIzzr1SXi6rhtgX7qPclf-b21roo8HpsrvgbeWYasm8SxG2K3QF0RRAr4IVuSblnMFS2-I"
          />
          MedhaLabs AI
        </a>

        <div className="hidden md:flex items-center gap-10 font-medium text-sm">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-slate-600 hover:text-mint transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage?.('contact')}
            className="hidden sm:block text-slate-600 hover:text-mint font-semibold text-sm px-4 py-2"
          >
            Talk to Sales
          </button>
          <button
            onClick={() => setCurrentPage?.('home')}
            className="bg-mint text-white px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-mint/20"
          >
            Build Your Agent
          </button>
        </div>
      </div>
    </nav>
  );
}
