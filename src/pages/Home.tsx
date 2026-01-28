import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FilePlus,
    Database,
    Settings,
    User,
    LogOut,
    ArrowUpRight,
    Search,
    X,
    AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ForestEdgeDashboard() {
    const navigate = useNavigate();
    const { t, language, setLanguage, isRTL } = useLanguage();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    const handleLogout = () => {
        // Here you would clear session/local storage
        navigate('/');
    };

    const menuItems = [
        {
            title: t('home.createTitle', 'Create Entry'),
            subtitle: t('home.createDesc', 'New Submittal'),
            icon: <FilePlus strokeWidth={1.5} size={28} />,
            path: "/editor",
            stat: "Draft"
        },
        {
            title: t('home.historyTitle', 'Registry'),
            subtitle: t('home.historyDesc', 'Archives & Logs'),
            icon: <Database strokeWidth={1.5} size={28} />,
            path: "/history",
            stat: "842 Records"
        },
        {
            title: t('home.statsTitle', 'Analytics'),
            subtitle: t('home.statsDesc', 'System Metrics'),
            icon: <LayoutDashboard strokeWidth={1.5} size={28} />,
            path: "/dashboard",
            stat: "Live"
        },
        {
            title: t('home.veneerTitle', 'Materials'),
            subtitle: t('home.veneerDesc', 'Veneer Library'),
            icon: <Database strokeWidth={1.5} size={28} />, // Reusing icon for now, or could import another
            path: "/veneers",
            stat: "Veneers"
        },
        {
            title: t('home.settingsTitle', 'Settings'),
            subtitle: t('home.settingsDesc', 'Configuration'),
            icon: <Settings strokeWidth={1.5} size={28} />,
            path: "/settings",
            stat: "v2.4"
        }
    ];

    return (
        <div className={`min-h-screen bg-[#FDFDFB] font-sans text-[#1c1917] selection:bg-[#E7E5E4] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Background Grain Texture (Very subtle) */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* --- Navbar (Fixed & Glassy) --- */}
            <nav className="fixed top-0 w-full z-40 bg-[#FDFDFB]/80 backdrop-blur-xl border-b border-gray-100 h-24 transition-all">
                <div className="max-w-[1600px] mx-auto px-8 h-full flex justify-between items-center">

                    {/* Brand */}
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-[#1c1917] text-white flex items-center justify-center rounded-xl shadow-lg shadow-black/10">
                            <span className="font-serif font-bold text-xl">F</span>
                        </div>
                        <div>
                            <span className="block font-serif text-sm tracking-[0.2em] uppercase font-bold text-[#1c1917] leading-none mb-1">
                                Forest Edge
                            </span>
                            <span className="block text-[10px] text-gray-400 font-mono tracking-widest uppercase leading-none">
                                Operational Hub
                            </span>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-6">

                        {/* Search Pill */}
                        <div className="hidden lg:flex items-center gap-3 bg-white border border-gray-200 px-4 py-2.5 rounded-full w-72 shadow-sm hover:border-gray-300 transition-all group">
                            <Search size={14} className="text-gray-400 group-hover:text-black transition-colors" />
                            <input
                                type="text"
                                placeholder="Type to search..."
                                className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-gray-400"
                            />
                            <div className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-400 border border-gray-200">⌘K</div>
                        </div>

                        <div className="h-8 w-[1px] bg-gray-200 hidden md:block"></div>

                        {/* Language Toggle */}
                        <button onClick={toggleLanguage} className="text-[10px] font-bold tracking-widest uppercase text-gray-500 hover:text-[#1c1917] transition-colors">
                            {language === 'en' ? 'AR' : 'EN'}
                        </button>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="text-right hidden md:block">
                                <p className="text-xs font-bold text-[#1c1917]">Mohamed Abed</p>
                                <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[#1c1917]">
                                <User size={18} />
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all ml-2"
                            title="Sign Out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- Main Content --- */}
            <main className="relative z-10 pt-44 px-8 pb-20 max-w-[1600px] mx-auto">

                {/* --- Hero Section --- */}
                <div className="mb-16">
                    <h1 className="text-5xl md:text-7xl font-serif text-[#1c1917] mb-6 tracking-tight">
                        Overview
                    </h1>
                    <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between border-t border-gray-200 pt-6">
                        <p className="text-gray-500 text-lg font-light max-w-2xl">
                            Manage your submittals, track progress, and configure system parameters from a single unified interface.
                        </p>
                        <div className="flex gap-4">
                            <div className="text-right px-6 py-2 border-r border-gray-200 last:border-0">
                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Active Tasks</p>
                                <p className="font-serif text-2xl">12</p>
                            </div>
                            <div className="text-right px-6 py-2">
                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Pending Review</p>
                                <p className="font-serif text-2xl">04</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Modern Cards Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {menuItems.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate(item.path)}
                            className="group relative bg-white p-8 rounded-[32px] border border-gray-100 hover:border-gray-300 transition-all duration-500 cursor-pointer flex flex-col h-[360px] justify-between shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2 overflow-hidden"
                        >
                            {/* Top Section */}
                            <div className="flex justify-between items-start z-10">
                                {/* The Icon is ALWAYS Black now */}
                                <div className="w-16 h-16 rounded-2xl bg-[#1c1917] flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500">
                                    {item.icon}
                                </div>
                                <div className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:bg-[#1c1917] group-hover:text-white transition-colors duration-500">
                                    {item.stat}
                                </div>
                            </div>

                            {/* Bottom Section */}
                            <div className="z-10">
                                <h3 className="text-2xl font-serif text-[#1c1917] mb-3 group-hover:translate-x-1 transition-transform duration-300">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-400 font-medium leading-relaxed mb-6">
                                    {item.subtitle}
                                </p>

                                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#1c1917] border-t border-gray-100 pt-6 group-hover:border-[#1c1917] transition-colors duration-500">
                                    <span>Open Module</span>
                                    <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                                </div>
                            </div>

                            {/* Decorative Background Blur (Modern Touch) */}
                            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gray-50 rounded-full blur-3xl group-hover:bg-gray-100 transition-colors duration-500 pointer-events-none"></div>
                        </div>
                    ))}
                </div>

            </main>

            {/* --- Professional Logout Modal --- */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop with Blur */}
                    <div
                        className="absolute inset-0 bg-[#1c1917]/20 backdrop-blur-md transition-opacity duration-300"
                        onClick={() => setShowLogoutConfirm(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-[32px] p-8 md:p-12 max-w-md w-full shadow-2xl shadow-black/20 transform scale-100 animate-fade-in-up border border-gray-100">
                        <button
                            onClick={() => setShowLogoutConfirm(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-[#1c1917] transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                            <AlertCircle size={32} />
                        </div>

                        <h3 className="text-2xl font-serif text-[#1c1917] mb-3">
                            {isRTL ? 'تسجيل الخروج؟' : 'End Session?'}
                        </h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            {isRTL
                                ? 'أنت على وشك إنهاء الجلسة الآمنة. سيتم حفظ جميع البيانات تلقائياً.'
                                : 'You are about to terminate your secure session. All unsaved changes are automatically synced.'}
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-4 rounded-xl border border-gray-200 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors text-[#1c1917]"
                            >
                                {t('common.cancel', 'Cancel')}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-4 rounded-xl bg-[#1c1917] text-white font-bold text-xs uppercase tracking-widest hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                            >
                                {t('common.logout', 'Confirm Exit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}