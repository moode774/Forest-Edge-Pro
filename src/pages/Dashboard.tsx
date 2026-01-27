import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    LayoutGrid,
    Search,
    Clock,
    ArrowRight,
    Trash2,
    Activity,
    FileText,
    MoreVertical
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();
    
    // States
    const [submittals, setSubmittals] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch Data
    useEffect(() => {
        const fetchSubmittals = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "submittals"));
                const docs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as any[];
                setSubmittals(docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching submittals:", error);
                setLoading(false);
            }
        };
        fetchSubmittals();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm("Move project file to trash?")) {
            try {
                await deleteDoc(doc(db, "submittals", id));
                setSubmittals(prev => prev.filter(item => item.id !== id));
            } catch (error) {
                console.error("Error deleting document: ", error);
            }
        }
    };

    const filteredSubmittals = submittals.filter(item =>
        item.submittalNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate Quick Stats
    const totalProjects = submittals.length;
    const activeToday = submittals.filter(i => i.date === new Date().toISOString().split('T')[0]).length;

    return (
        <div className={`min-h-screen bg-[#FDFDFB] text-[#1c1917] font-sans selection:bg-[#E7E5E4] pb-20 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* --- Top Navigation --- */}
            <nav className="fixed top-0 w-full z-40 bg-[#FDFDFB]/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1c1917] text-white rounded-xl flex items-center justify-center shadow-lg shadow-black/10 cursor-pointer hover:rotate-12 transition-transform" onClick={() => navigate('/home')}>
                        <LayoutGrid size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-serif font-bold text-[#1c1917] tracking-tight">Dashboard</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overview</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/editor')}
                        className="group flex items-center gap-2 bg-[#1c1917] text-white pl-4 pr-5 py-2.5 rounded-full hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
                    >
                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                            <Plus size={14} strokeWidth={3} />
                        </div>
                        <span className="text-xs font-bold tracking-widest uppercase">Create</span>
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-32">

                {/* --- Quick Stats Row (Dashboard Feel) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Active</p>
                            <h2 className="text-3xl font-serif text-[#1c1917]">{totalProjects}</h2>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                            <FileText size={20} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">New Today</p>
                            <h2 className="text-3xl font-serif text-[#1c1917]">{activeToday}</h2>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-emerald-500">
                            <Activity size={20} />
                        </div>
                    </div>
                    <div className="bg-[#1c1917] p-6 rounded-2xl text-white shadow-lg flex items-center justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">System Status</p>
                            <h2 className="text-xl font-serif">Optimal</h2>
                        </div>
                        <div className="relative z-10 flex items-center gap-2">
                             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                             <span className="text-xs font-mono text-gray-400">ONLINE</span>
                        </div>
                        {/* Abstract Decor */}
                        <div className="absolute right-[-20px] bottom-[-20px] w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                    </div>
                </div>

                {/* --- Search Section --- */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
                    <div className="w-full md:max-w-md relative group">
                        <Search size={18} className={`absolute bottom-4 ${isRTL ? 'right-0' : 'left-0'} text-gray-400 group-focus-within:text-black transition-colors`} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search active projects..." 
                            className={`w-full bg-transparent border-b border-gray-200 py-3 ${isRTL ? 'pr-8' : 'pl-8'} text-lg font-serif placeholder:font-sans placeholder:text-gray-300 focus:outline-none focus:border-black transition-all`}
                        />
                    </div>
                    <p className="text-[10px] font-mono text-gray-400 uppercase">
                        Showing {filteredSubmittals.length} results
                    </p>
                </div>

                {/* --- Projects Grid (Active Cards) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="h-48 bg-gray-50 rounded-2xl animate-pulse" />)
                    ) : filteredSubmittals.length > 0 ? (
                        filteredSubmittals.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => navigate(`/editor/${item.id}`)}
                                className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-black/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between h-[220px] relative overflow-hidden"
                            >
                                {/* Top: Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100 group-hover:bg-[#1c1917] group-hover:border-[#1c1917] transition-colors">
                                            <span className="text-[10px] font-mono font-bold text-gray-500 group-hover:text-white uppercase tracking-wider">
                                                {item.submittalNo}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDelete(e, item.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Middle: Title */}
                                <div>
                                    <h3 className="font-serif text-xl text-[#1c1917] line-clamp-2 leading-tight group-hover:text-emerald-800 transition-colors">
                                        {item.projectTitle}
                                    </h3>
                                </div>

                                {/* Bottom: Meta & Action */}
                                <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock size={12} />
                                        <span className="text-[10px] font-mono uppercase">{item.date}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#1c1917] group-hover:bg-[#1c1917] group-hover:text-white transition-all">
                                        <ArrowRight size={14} className={isRTL ? 'rotate-180' : ''} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                             <p className="text-gray-400 font-serif italic">No active projects found.</p>
                             <button onClick={() => navigate('/editor')} className="mt-4 text-xs font-bold uppercase tracking-widest text-[#1c1917] hover:underline">
                                 Start a new project
                             </button>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}