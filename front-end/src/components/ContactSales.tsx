import React, { useState } from 'react';

export function ContactSales() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    companyName: '',
    phone: '',
    primaryUseCase: 'Customer Support',
    context: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdoMFiPVy1oMKPRiarWYmauQnERSeU4WK8UxYq-XIqVBBNuTw/formResponse';
    
    const data = new URLSearchParams();
    data.append('entry.185540212', `${formData.firstName} ${formData.lastName}`.trim());
    data.append('entry.265526274', formData.workEmail);
    data.append('entry.1552640746', formData.phone);
    data.append('entry.846027483', formData.companyName);
    data.append('entry.1360312045', formData.primaryUseCase);
    data.append('entry.2145074007', formData.context);
    
    try {
      await fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      });
      setStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        workEmail: '',
        companyName: '',
        phone: '',
        primaryUseCase: 'Customer Support',
        context: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="bg-slate-50 min-h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          
          {/* Left Text Segment */}
          <div className="pt-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-mint/20 text-mint font-bold text-xs tracking-widest uppercase mb-8">
              SCALE INTELLIGENCE
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight">
              Talk to <span className="text-mint">Sales.</span>
            </h1>
            <p className="text-xl text-slate-700 max-w-lg leading-relaxed font-medium">
              Ready to deploy your next digital employee? Whether you need to automate your clinic's scheduling or scale your real estate lead desk, our team is here to help you configure the perfect AI voice strategy. Connect with us today to experience the sub-500ms future of autonomous business communication.
            </p>
          </div>

          {/* Right Form Card */}
          <div className="bg-white p-10 lg:p-12 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {status === 'success' && (
                <div className="bg-mint/10 border border-mint/20 text-mint px-6 py-4 rounded-xl font-medium mb-6">
                  Thank you! Your strategy session request has been received. We'll be in touch shortly.
                </div>
              )}
              {status === 'error' && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl font-medium mb-6">
                  Something went wrong. Please try again or email us directly.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">First Name</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" placeholder="John" className="w-full bg-slate-50 border border-transparent focus:border-mint/30 focus:bg-white focus:ring-1 focus:ring-mint/30 rounded-2xl px-5 py-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Last Name</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" placeholder="Doe" className="w-full bg-slate-50 border border-transparent focus:border-mint/30 focus:bg-white focus:ring-1 focus:ring-mint/30 rounded-2xl px-5 py-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Work Email</label>
                <input required name="workEmail" value={formData.workEmail} onChange={handleChange} type="email" placeholder="john@company.com" className="w-full bg-slate-50 border border-transparent focus:border-mint/30 focus:bg-white focus:ring-1 focus:ring-mint/30 rounded-2xl px-5 py-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Company Name</label>
                  <input required name="companyName" value={formData.companyName} onChange={handleChange} type="text" placeholder="Acme Inc." className="w-full bg-slate-50 border border-transparent focus:border-mint/30 focus:bg-white focus:ring-1 focus:ring-mint/30 rounded-2xl px-5 py-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Phone Number</label>
                  <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-slate-50 border border-transparent focus:border-mint/30 focus:bg-white focus:ring-1 focus:ring-mint/30 rounded-2xl px-5 py-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Primary Industry</label>
                <select name="primaryUseCase" value={formData.primaryUseCase} onChange={handleChange} className="w-full bg-slate-50 border border-transparent focus:border-mint/30 focus:bg-white focus:ring-1 focus:ring-mint/30 rounded-2xl px-5 py-4 outline-none transition-all font-medium text-slate-900 appearance-none">
                  <option>Customer Support</option>
                  <option>Sales Outreach</option>
                  <option>Healthcare & Wellness</option>
                  <option>Real Estate & Real Estate Leasing</option>
                  <option>Insurance & POSP</option>
                  <option>Hospitality & Restaurants</option>
                  <option>E-commerce Logistics</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Additional Context</label>
                <textarea name="context" value={formData.context} onChange={handleChange} rows={4} placeholder="Tell us about your automation goals..." className="w-full bg-slate-50 border border-transparent focus:border-mint/30 focus:bg-white focus:ring-1 focus:ring-mint/30 rounded-2xl px-5 py-4 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 resize-none"></textarea>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={status === 'submitting'}
                  className={`w-full text-white font-bold text-lg py-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all active:scale-[0.98] ${
                    status === 'submitting' 
                      ? 'bg-mint/70 cursor-not-allowed shadow-none' 
                      : status === 'success'
                        ? 'bg-mint-dark'
                        : 'bg-mint hover:bg-mint-dark hover:shadow-2xl hover:shadow-mint/30 shadow-mint/20'
                  }`}
                >
                  {status === 'submitting' ? 'Submitting...' : status === 'success' ? 'Request Sent!' : 'Book Strategy Session'}
                </button>
              </div>

              <p className="text-center text-xs text-slate-600 mt-6 font-medium">
                By submitting, you agree to our <a href="#" className="text-mint hover:underline">Privacy Policy</a> and <a href="#" className="text-mint hover:underline">Terms of Service</a>.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="border-t border-slate-200 mt-auto bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            © 2024 MEDHALABS AI. BUILT FOR THE ETHEREAL INTELLIGENCE.
          </p>
          <div className="flex items-center gap-8 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            <a href="#" className="hover:text-mint transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-mint transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-mint transition-colors">Security</a>
            <a href="#" className="hover:text-mint transition-colors">Status</a>
          </div>
        </div>
      </div>
    </section>
  );
}
