import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
    ArrowLeft, 
    Globe, 
    Shield, 
    Smartphone, 
    Bell, 
    Moon, 
    Server, 
    CheckCircle2,
    ChevronRight 
} from 'lucide-react';

export default function Settings() {
    const navigate = useNavigate();
    const { t, isRTL, language, setLanguage } = useLanguage();

    // مكون فرعي لزر التبديل (Toggle Switch) لإضافة لمسة واقعية
    const ToggleItem = ({ icon, title, desc, active = false }) => (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className="text-gray-400 group-hover:text-[#1c1917] transition-colors">
                    {icon}
                </div>
                <div>
                    <h4 className="text-sm font-serif font-medium text-[#1c1917]">{title}</h4>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{desc}</p>
                </div>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-[#1c1917]' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? (isRTL ? 'left-1' : 'right-1') : (isRTL ? 'right-1' : 'left-1')}`} />
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen bg-[#FDFDFB] text-[#1c1917] font-sans selection:bg-[#E7E5E4] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            
            <main className="max-w-5xl mx-auto px-6 py-12">

                {/* --- Header --- */}
                <div className="flex items-end justify-between mb-16">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/home')}
                            className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#1c1917] hover:text-white hover:border-[#1c1917] transition-all duration-300 group"
                        >
                            <ArrowLeft size={20} className={`transition-transform ${isRTL ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                        </button>
                        <div>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-2">Configuration</span>
                            <h1 className="text-4xl font-serif text-[#1c1917]">System Settings</h1>
                        </div>
                    </div>
                </div>

                {/* --- Content Grid --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Language & System (Width: 7/12) */}
                    <div className="lg:col-span-7 space-y-8">
                        
                        {/* 1. Language Selector */}
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                <Globe size={14} /> {t('common.language', 'Interface Language')}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* English Option */}
                                <button 
                                    onClick={() => setLanguage('en')}
                                    className={`relative p-6 rounded-xl border flex items-start gap-4 text-left transition-all duration-300 ${language === 'en' ? 'bg-[#1c1917] text-white border-[#1c1917] shadow-xl' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                >
                                    <span className="text-lg font-serif">Aa</span>
                                    <div>
                                        <h3 className="font-bold tracking-wide">English</h3>
                                        <p className={`text-xs mt-1 ${language === 'en' ? 'text-gray-400' : 'text-gray-300'}`}>Default layout</p>
                                    </div>
                                    {language === 'en' && <CheckCircle2 size={18} className="absolute top-6 right-6 text-emerald-500" />}
                                </button>

                                {/* Arabic Option */}
                                <button 
                                    onClick={() => setLanguage('ar')}
                                    className={`relative p-6 rounded-xl border flex items-start gap-4 text-left transition-all duration-300 ${language === 'ar' ? 'bg-[#1c1917] text-white border-[#1c1917] shadow-xl' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                >
                                    <span className="text-lg font-serif">ض</span>
                                    <div>
                                        <h3 className="font-bold tracking-wide">العربية</h3>
                                        <p className={`text-xs mt-1 ${language === 'ar' ? 'text-gray-400' : 'text-gray-300'}`}>RTL layout</p>
                                    </div>
                                    {language === 'ar' && <CheckCircle2 size={18} className="absolute top-6 right-6 text-emerald-500" />}
                                </button>
                            </div>
                        </section>

                        {/* 2. General Preferences (Toggle List) */}
                        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Workspace Preferences</h3>
                            </div>
                            <div>
                                <ToggleItem icon={<Bell size={18} />} title="Notifications" desc="Email alerts for new submittals" active={true} />
                                <ToggleItem icon={<Moon size={18} />} title="Dark Mode" desc="Override system appearance" active={false} />
                                <ToggleItem icon={<Smartphone size={18} />} title="Responsive Layout" desc="Optimize for mobile devices" active={true} />
                            </div>
                        </section>
                    </div>

                    {/* Right Column: System Status (Width: 5/12) */}
                    <div className="lg:col-span-5 space-y-8">
                        
                        {/* System Identity Card */}
                        <div className="bg-[#1c1917] text-white p-8 rounded-2xl relative overflow-hidden shadow-2xl">
                            {/* Texture */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-500 to-transparent pointer-events-none" />
                            
                            <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <Shield size={24} />
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                                        Secure
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-serif mb-1">Forest Edge</h3>
                                    <p className="text-gray-400 text-xs uppercase tracking-widest">Enterprise Edition</p>
                                    
                                    <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
                                        <div className="flex justify-between text-sm font-mono text-gray-400">
                                            <span>Version</span>
                                            <span className="text-white">v2.4.0 (Stable)</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-mono text-gray-400">
                                            <span>Server</span>
                                            <span className="text-white">Riyadh-01</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-mono text-gray-400">
                                            <span>Database</span>
                                            <span className="text-emerald-400 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                                Connected
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Brief */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-between group hover:border-[#1c1917] transition-colors cursor-pointer">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Current User</p>
                                <h3 className="font-serif text-lg">Mohamed Abed</h3>
                                <p className="text-xs text-gray-500 font-mono">ID: ADMIN-8821</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#1c1917] group-hover:text-white transition-all">
                                <ChevronRight size={18} className={isRTL ? 'rotate-180' : ''} />
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}