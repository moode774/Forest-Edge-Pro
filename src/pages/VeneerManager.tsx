import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Save, X, Loader } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Veneer } from '../../types';

export default function VeneerManager() {
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();
    const [veneers, setVeneers] = useState<Veneer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // New Veneer Form State
    const [newVeneerName, setNewVeneerName] = useState('');
    const [newVeneerDesc, setNewVeneerDesc] = useState('');
    const [newVeneerImage, setNewVeneerImage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchVeneers();
    }, []);

    const fetchVeneers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "veneers"));
            const fetchedVeneers: Veneer[] = [];
            querySnapshot.forEach((doc) => {
                fetchedVeneers.push({ id: doc.id, ...doc.data() } as Veneer);
            });
            setVeneers(fetchedVeneers);
        } catch (error) {
            console.error("Error fetching veneers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewVeneerImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddVeneer = async () => {
        if (!newVeneerName || !newVeneerImage) return;
        setUploading(true);
        try {
            await addDoc(collection(db, "veneers"), {
                name: newVeneerName,
                description: newVeneerDesc,
                imageUrl: newVeneerImage
            });
            setShowAddModal(false);
            setNewVeneerName('');
            setNewVeneerDesc('');
            setNewVeneerImage('');
            fetchVeneers();
        } catch (error) {
            console.error("Error adding veneer:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteVeneer = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this veneer?")) {
            try {
                await deleteDoc(doc(db, "veneers", id));
                fetchVeneers();
            } catch (error) {
                console.error("Error deleting veneer:", error);
            }
        }
    };

    return (
        <div className={`min-h-screen bg-[#FDFDFB] font-sans text-[#1c1917] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-40 bg-[#FDFDFB]/80 backdrop-blur-xl border-b border-gray-100 h-20">
                <div className="max-w-[1600px] mx-auto px-6 h-full flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/home')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#1c1917] hover:text-[#1c1917] transition-all">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="font-serif text-xl font-bold text-[#1c1917]">Veneer Library</h1>
                            <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Material Management</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#1c1917] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add New Veneer
                    </button>
                </div>
            </nav>

            {/* Content */}
            <main className="pt-32 px-6 pb-20 max-w-[1600px] mx-auto">
                {loading ? (
                    <div className="flex justify-center pt-20">
                        <div className="animate-spin w-8 h-8 border-2 border-[#1c1917] border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {veneers.map((veneer) => (
                            <div key={veneer.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                    <img src={veneer.imageUrl} alt={veneer.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => handleDeleteVeneer(veneer.id)}
                                            className="w-10 h-10 rounded-full bg-white text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-serif text-lg font-bold text-[#1c1917] mb-1">{veneer.name}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-2">{veneer.description || 'No description'}</p>
                                </div>
                            </div>
                        ))}

                        {/* Empty State / Add Card */}
                        <div
                            onClick={() => setShowAddModal(true)}
                            className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all min-h-[300px]"
                        >
                            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 mb-4">
                                <Plus size={24} />
                            </div>
                            <h3 className="font-serif text-lg text-gray-400">Add Material</h3>
                        </div>
                    </div>
                )}
            </main>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-fade-in-up">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
                            <X size={24} />
                        </button>

                        <h2 className="font-serif text-2xl font-bold mb-6">Add New Veneer</h2>

                        <div className="space-y-6">
                            {/* Image Upload */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#1c1917] hover:bg-gray-50 transition-all overflow-hidden relative"
                            >
                                {newVeneerImage ? (
                                    <img src={newVeneerImage} className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <ImageIcon size={32} className="text-gray-300 mb-2" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Click to upload image</span>
                                    </>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Veneer Name</label>
                                    <input
                                        value={newVeneerName}
                                        onChange={(e) => setNewVeneerName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#1c1917] transition-colors"
                                        placeholder="e.g., American Walnut"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description (Optional)</label>
                                    <textarea
                                        value={newVeneerDesc}
                                        onChange={(e) => setNewVeneerDesc(e.target.value)}
                                        rows={3}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#1c1917] transition-colors resize-none"
                                        placeholder="Wood grain details, origin..."
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAddVeneer}
                                disabled={uploading || !newVeneerName || !newVeneerImage}
                                className="w-full bg-[#1c1917] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {uploading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                Save Veneer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
