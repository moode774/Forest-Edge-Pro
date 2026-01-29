import React from 'react';
import { ShieldAlert, RefreshCw, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Maintenance() {
    const { t, isRTL } = useLanguage();

    return (
        <div className={`min-h-screen w-full bg-[#FDFDFB] dark:bg-[#0F172A] flex items-center justify-center p-6 overflow-hidden relative transition-colors duration-500 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Animations */}
            <div className="absolute inset-0 z-0 opacity-50 dark:opacity-100 transition-opacity">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
                <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
                {/* Icon Section */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                    <div className="relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl border border-gray-200 dark:border-white/10 p-8 rounded-[40px] shadow-2xl transform hover:rotate-2 transition-all duration-500">
                        <ShieldAlert size={80} className="text-red-500 animate-bounce" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black text-[#1c1917] dark:text-white tracking-tighter uppercase italic transition-colors">
                        {t('maintenance.title').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">{t('maintenance.title').split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed transition-colors">
                        {t('maintenance.message')}
                    </p>
                </div>

                {/* Status Indicator */}
                <div className="flex flex-col items-center gap-6 pt-8">
                    <div className="px-6 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full backdrop-blur-md flex items-center gap-3 shadow-inner transition-colors">
                        <RefreshCw size={20} className="text-blue-500 dark:text-blue-400 animate-spin" />
                        <span className="text-sm font-bold text-gray-600 dark:text-slate-300 uppercase tracking-widest transition-colors">{t('maintenance.reconnecting')}</span>
                    </div>

                    <div className="flex items-center gap-8 py-4 px-10 bg-white dark:bg-slate-900/80 rounded-2xl border border-gray-200 dark:border-white/5 shadow-2xl transition-colors">
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{t('maintenance.statusCode')}</p>
                            <p className="text-xl font-mono font-bold text-[#1c1917] dark:text-white transition-colors">503_SERVICE_LOCK</p>
                        </div>
                        <div className="w-[1px] h-10 bg-gray-200 dark:bg-white/10 transition-colors" />
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{t('maintenance.access')}</p>
                            <p className="text-xl font-mono font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-2 transition-colors">
                                <Lock size={18} /> {t('maintenance.restricted')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Branding */}
                <div className="pt-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5 opacity-50 hover:opacity-100 transition-all">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-slate-300 uppercase tracking-widest transition-colors">{t('maintenance.footer')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
