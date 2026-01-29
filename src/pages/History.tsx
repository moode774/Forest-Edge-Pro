import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    FileText,
    ArrowLeft,
    Search,
    Calendar,
    Trash2,
    ChevronRight,
    Filter,
    MoreHorizontal
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';

export default function Registry() {
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();

    // States
    const [submittals, setSubmittals] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'draft', 'submitted'
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

    // Delete Logic
    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // منع فتح الصفحة عند الضغط على الحذف
        if (window.confirm("Confirm deletion of registry entry? This action cannot be undone.")) {
            try {
                await deleteDoc(doc(db, "submittals", id));
                setSubmittals(prev => prev.filter(item => item.id !== id));
            } catch (error) {
                console.error("Error deleting document: ", error);
            }
        }
    };

    // Advanced Filtering Logic
    const filteredSubmittals = submittals.filter(item => {
        const matchesSearch =
            item.submittalNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase());

        // افتراض وجود حقل status، إذا لم يوجد نعرض الكل (يمكنك تعديل المنطق حسب الداتا بيس)
        const matchesFilter = filterStatus === 'all' ? true : (item.status === filterStatus);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className={`min-h-screen bg-[#FDFDFB] dark:bg-[#1c1917] text-[#1c1917] dark:text-white font-sans selection:bg-[#E7E5E4] dark:selection:bg-gray-700 pb-20 transition-colors ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>

            {/* --- Header & Navigation --- */}
            <header className="sticky top-0 z-20 bg-[#FDFDFB]/90 dark:bg-[#1c1917]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 transition-all">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/home')}
                            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white hover:scale-105 transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-xl font-serif font-bold tracking-wide text-[#1c1917] dark:text-white">{t('registry.title')}</h1>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono">{t('registry.subtext')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">{submittals.length} {t('common.results', 'ENTRIES')}</span>
                        </div>
                        <button
                            onClick={() => navigate('/editor')}
                            className="flex items-center gap-2 bg-[#1c1917] dark:bg-white text-white dark:text-[#1c1917] px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-200 dark:shadow-none"
                        >
                            <Plus size={16} />
                            <span className="hidden sm:inline">{t('registry.initiate')}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-12">

                {/* --- Search & Filter Toolbar --- */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-6">

                    {/* Search Field (Minimalist Line) */}
                    <div className="w-full md:w-1/2 relative group">
                        <Search size={18} className={`absolute bottom-3 ${isRTL ? 'right-0' : 'left-0'} text-gray-400 dark:text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors`} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('registry.searchPlaceholder')}
                            className={`w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-3 ${isRTL ? 'pr-8' : 'pl-8'} text-lg font-serif placeholder:font-sans placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:border-black dark:focus:border-white transition-all text-[#1c1917] dark:text-white`}
                        />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <Filter size={16} className="text-gray-400 dark:text-gray-500 mx-2" />
                        {['all', 'draft', 'submitted'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${filterStatus === status
                                        ? 'bg-[#1c1917] dark:bg-white text-white dark:text-[#1c1917] border-[#1c1917] dark:border-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                            >
                                {status.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- The Registry List (Elegant Rows) --- */}
                <div className="space-y-3 min-h-[400px]">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />)}
                        </div>
                    ) : filteredSubmittals.length > 0 ? (
                        filteredSubmittals.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/editor/${item.id}`)}
                                className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 flex items-center justify-between hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-black/20 transition-all duration-300 cursor-pointer overflow-hidden"
                            >
                                {/* Active Indicator Strip */}
                                <div className={`absolute top-0 bottom-0 w-1 bg-[#1c1917] dark:bg-white transition-all duration-300 ${isRTL ? 'right-0 opacity-0 group-hover:opacity-100' : 'left-0 opacity-0 group-hover:opacity-100'}`} />

                                <div className="flex items-center gap-6 md:gap-8 flex-1">
                                    {/* Icon Box */}
                                    <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-[#1c1917] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#1c1917] transition-colors duration-300">
                                        <FileText size={20} strokeWidth={1.5} />
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 flex-1">
                                        <div className="min-w-[120px]">
                                            <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">{t('editor.submittalNo', 'ID Ref')}</span>
                                            <h3 className="font-mono text-sm font-medium text-[#1c1917] dark:text-white">{item.submittalNo}</h3>
                                        </div>

                                        <div className="flex-1">
                                            <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">{t('editor.projectTitle', 'Project')}</span>
                                            <h3 className="font-serif text-lg text-[#1c1917] dark:text-white truncate max-w-md group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                                {item.projectTitle}
                                            </h3>
                                        </div>

                                        <div className="hidden sm:block min-w-[120px]">
                                            <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">{t('editor.date', 'Date Logged')}</span>
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-mono">
                                                <Calendar size={12} />
                                                {item.date}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                                    <button
                                        onClick={(e) => handleDelete(e, item.id)}
                                        className="p-2 text-gray-300 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                                        title="Delete Entry"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="p-2 text-gray-300 group-hover:text-[#1c1917] transition-colors">
                                        <ChevronRight size={20} className={isRTL ? 'rotate-180' : ''} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/30 dark:bg-gray-800/30">
                            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                                <MoreHorizontal size={24} className="text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="font-serif text-xl text-[#1c1917] dark:text-white mb-2">{t('registry.empty')}</h3>
                            <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs mx-auto">{t('registry.emptyDesc')}</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">End of Registry</p>
                </div>

            </main>
        </div>
    );
}