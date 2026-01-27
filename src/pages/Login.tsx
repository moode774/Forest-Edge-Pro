import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Command } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
    const navigate = useNavigate();
    const { t, isRTL, language, setLanguage } = useLanguage();

    return (
        <div className={`min-h-screen w-full flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} bg-white font-sans selection:bg-stone-200`}>

            {/* --- Left Side: The Brand Statement (Apple-like Dark Mode) --- */}
            <div className="hidden lg:flex w-[45%] bg-[#0f0f0f] text-white flex-col relative overflow-hidden p-12 justify-between">
                
                {/* Subtle Ambient Light (No cheap gradients) */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-white/5 blur-[150px] rounded-full pointer-events-none"></div>

                {/* 1. The Logo (As requested: The Circle F) */}
                <div className="relative z-10 flex items-center gap-4 animate-fade-in">
                    <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <span className="font-serif font-bold text-xl translate-y-[1px]">F</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-serif text-lg tracking-[0.2em] text-white uppercase font-bold leading-none mb-1">
                            Forest Edge
                        </span>
                        <span className="text-[10px] text-stone-500 tracking-[0.3em] uppercase">
                            System v2.0
                        </span>
                    </div>
                </div>

                {/* 2. The Main Typography Art */}
                <div className="relative z-10 space-y-6 max-w-md">
                    <h1 className="font-serif text-6xl leading-[1.1] text-white/90">
                        Operational <br />
                        <span className="italic text-stone-500">Gateway.</span>
                    </h1>
                    <div className="h-[1px] w-12 bg-stone-700 my-6"></div>
                    <p className="text-stone-400 font-light text-sm leading-relaxed tracking-wide max-w-xs">
                        Authorized personnel access only. 
                        Connection is encrypted and monitored.
                    </p>
                </div>

                {/* 3. Footer */}
                <div className="relative z-10 text-[10px] text-stone-600 tracking-widest uppercase font-medium">
                    © 2026 Forest Edge Corp.
                </div>
            </div>

            {/* --- Right Side: The Login Form (Clean Apple Style) --- */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-24 bg-white text-[#1c1917]">
                <div className="w-full max-w-[400px] space-y-12 animate-slide-up">
                    
                    {/* Header */}
                    <div className="text-center lg:text-left space-y-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 bg-stone-50 border border-stone-100 rounded-full mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                             <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400">Secure Environment</span>
                        </div>
                        <h2 className="text-3xl font-serif text-[#1c1917] tracking-tight">{t('login.title', 'Sign in to System')}</h2>
                        <p className="text-stone-400 text-sm font-medium">Enter your corporate credentials below.</p>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-[0.1em] text-stone-400 block ml-1">
                                {t('login.emailLabel', 'Corporate ID')}
                            </label>
                            {/* Apple Style Input: Minimalist, Light Background, Subtle Border */}
                            <input
                                type="email"
                                placeholder="name@forestedge.com"
                                className={`w-full bg-[#FAFAFA] border border-[#E5E5E5] text-[#1c1917] text-base px-5 py-4 rounded-xl focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all duration-300 placeholder:text-stone-300 ${isRTL ? 'text-right' : 'text-left'}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1 mr-1">
                                <label className="text-xs font-bold uppercase tracking-[0.1em] text-stone-400 block">
                                    {t('login.passwordLabel', 'Passcode')}
                                </label>
                                <a href="#" className="text-xs font-medium text-stone-400 hover:text-stone-900 transition-colors">Help?</a>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className={`w-full bg-[#FAFAFA] border border-[#E5E5E5] text-[#1c1917] text-base px-5 py-4 rounded-xl focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all duration-300 placeholder:text-stone-300 ${isRTL ? 'text-right' : 'text-left'}`}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-8">
                        <button
                            onClick={() => navigate('/home')}
                            className="group w-full bg-[#1c1917] text-white h-14 rounded-xl font-medium text-sm tracking-wide hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-stone-200"
                        >
                            <span>{t('login.button', 'Authenticate')}</span>
                            <ArrowRight size={16} className={`opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${isRTL ? 'rotate-180' : ''}`} />
                        </button>

                        <div className="flex justify-center items-center gap-2 text-stone-300">
                             <Command size={14} />
                             <span className="text-[10px] font-mono uppercase tracking-widest">Forest Edge OS</span>
                        </div>

                        <div className="flex justify-center pt-4 border-t border-stone-50">
                            <button
                                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                                className="text-xs font-bold tracking-widest uppercase text-stone-300 hover:text-stone-900 transition-colors"
                            >
                                {language === 'en' ? 'العربية' : 'English'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}