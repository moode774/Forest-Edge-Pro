import React from 'react';
import { ShieldAlert, RefreshCw, Lock } from 'lucide-react';

export default function Maintenance() {
    return (
        <div className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center p-6 overflow-hidden relative">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
                {/* Icon Section */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                    <div className="relative bg-slate-900/50 backdrop-blur-3xl border border-white/10 p-8 rounded-[40px] shadow-2xl transform hover:rotate-2 transition-transform duration-500">
                        <ShieldAlert size={80} className="text-red-500 animate-bounce" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic">
                        System <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Suspended</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed">
                        The ProSubmit Enterprise AI portal is currently undergoing critical security updates or maintenance.
                    </p>
                </div>

                {/* Status Indicator */}
                <div className="flex flex-col items-center gap-6 pt-8">
                    <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-md flex items-center gap-3 shadow-inner">
                        <RefreshCw size={20} className="text-blue-400 animate-spin" />
                        <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">Attempting Reconnection...</span>
                    </div>

                    <div className="flex items-center gap-8 py-4 px-10 bg-slate-900/80 rounded-2xl border border-white/5 shadow-2xl">
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status Code</p>
                            <p className="text-xl font-mono font-bold text-white">503_SERVICE_LOCK</p>
                        </div>
                        <div className="w-[1px] h-10 bg-white/10" />
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access</p>
                            <p className="text-xl font-mono font-bold text-emerald-400 flex items-center gap-2">
                                <Lock size={18} /> RESTRICTED
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Branding */}
                <div className="pt-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5 opacity-50">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Controlled by ProSubmit Cloud Operations</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
