import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Printer, Plus, Trash2, X, Save, ArrowLeft,
    Check, Upload, ChevronDown, Palette,
    Calendar, Hash, User, Building, Layers,
    FileText, Image as ImageIcon, MoreVertical, LayoutGrid
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { PrintTemplate } from '../components/PrintTemplate';

// --- Types (بقيت كما هي) ---
export interface Veneer {
    id: string;
    name: string;
    imageUrl: string;
}

export interface LineItem {
    id: string;
    itemNo: string;
    copies: number;
    date: string;
    specSection: string;
    description: string;
    barcode: string;
    color: string;
    dimensions: string;
    model: string;
    itemImages: string[];
    unitPrice: number;
    discount: number;
    taxes: number;
    amount: number;
    action: string;
    reviewerInitials: string;
    comments: string;
    veneer?: Veneer;
    glossiness?: string;
}

export interface SubmittalData {
    submittalNo: string;
    projectTitle: string;
    contractorName: string;
    contractNo: string;
    consultantName: string;
    priority: string;
    revision: string;
    dueDate: string;
    date: string;
    updatedAt: string;
    logo: string;
    clientPhone: string;
    createdBy: string;
    lineItems: LineItem[];
    images: string[];
    remarks: string;
}

const INITIAL_DATA: SubmittalData = {
    submittalNo: '',
    projectTitle: '',
    contractorName: '',
    contractNo: '',
    consultantName: '',
    priority: 'Medium',
    revision: '0',
    dueDate: '',
    date: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    logo: '',
    clientPhone: '',
    createdBy: '',
    lineItems: [],
    images: [],
    remarks: ''
};

// --- UI Components (New Design System) ---

const SectionHeader = ({ title, icon: Icon, action }: any) => (
    <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-sm text-black dark:text-white">
                {Icon && <Icon size={18} strokeWidth={2.5} />}
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
                {title}
            </h3>
        </div>
        {action}
    </div>
);

const Label = ({ children, required }: any) => (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
        {children} {required && <span className="text-red-400">*</span>}
    </label>
);

const StyledInput = ({ className = "", ...props }: any) => (
    <input
        className={`w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-600 rounded-sm px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-black dark:focus:border-white transition-colors outline-none placeholder-gray-400 ${className}`}
        {...props}
    />
);

const StyledSelect = ({ className = "", children, ...props }: any) => (
    <div className="relative">
        <select
            className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-black dark:focus:border-white transition-all outline-none appearance-none cursor-pointer ${className}`}
            {...props}
        >
            {children}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
    </div>
);

const Card = ({ children, className = "" }: any) => (
    <div className={`bg-white dark:bg-[#1c1917] rounded-sm shadow-sm border border-gray-300 dark:border-gray-700 p-6 ${className}`}>
        {children}
    </div>
);

// --- Main Component ---
export default function Editor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();
    const [data, setData] = useState<SubmittalData>(INITIAL_DATA);
    const [saving, setSaving] = useState(false);
    const [veneers, setVeneers] = useState<Veneer[]>([]);
    const [showVeneerModal, setShowVeneerModal] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Logic (Fetching & Saving) ---
    useEffect(() => {
        const fetchVeneers = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'veneers'));
                setVeneers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Veneer)));
            } catch (e) { console.log("Veneers fetch error") }
        };
        fetchVeneers();

        if (id) {
            const fetchDocument = async () => {
                const docSnap = await getDoc(doc(db, "submittals", id));
                if (docSnap.exists()) setData({ ...INITIAL_DATA, ...docSnap.data() } as SubmittalData);
            };
            fetchDocument();
        }
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const docId = id || doc(collection(db, "submittals")).id;
            await setDoc(doc(db, "submittals", docId), { ...data, updatedAt: new Date().toISOString() });
            setSaving(false);
            if (!id) navigate(`/editor/${docId}`);
        } catch (error) { setSaving(false); }
    };

    // --- Logic (Items) ---
    const addLineItem = () => {
        const newItem: LineItem = {
            id: Math.random().toString(36).substr(2, 9),
            itemNo: (data.lineItems.length + 1).toString(),
            copies: 1, date: new Date().toISOString().split('T')[0],
            specSection: "", description: "", barcode: "", color: "",
            dimensions: "", model: "", itemImages: [], unitPrice: 0,
            discount: 0, taxes: 15, amount: 0, action: "",
            reviewerInitials: "", comments: ""
        };
        setData(prev => ({ ...prev, lineItems: [...prev.lineItems, newItem] }));
    };

    const removeLineItem = (itemId: string) => {
        setData(prev => ({ ...prev, lineItems: prev.lineItems.filter(i => i.id !== itemId) }));
    };

    const updateLineItem = (itemId: string, field: keyof LineItem, value: any) => {
        setData(prev => ({
            ...prev,
            lineItems: prev.lineItems.map(item => item.id === itemId ? { ...item, [field]: value } : item)
        }));
    };

    // --- Image Handling ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isLineItem: boolean = false, itemId?: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const MAX_SIZE = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_SIZE || height > MAX_SIZE) {
                        if (width > height) { height = (height / width) * MAX_SIZE; width = MAX_SIZE; }
                        else { width = (width / height) * MAX_SIZE; height = MAX_SIZE; }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    ctx?.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

                    if (isLineItem && itemId) {
                        const item = data.lineItems.find(i => i.id === itemId);
                        if (item) updateLineItem(itemId, 'itemImages', [...(item.itemImages || []), compressedBase64]);
                    } else {
                        setData(prev => ({ ...prev, images: [...prev.images, compressedBase64] }));
                    }
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`min-h-screen bg-[#F8F9FA] dark:bg-black font-sans text-slate-900 dark:text-slate-100 ${isRTL ? 'rtl' : 'ltr'}`}>

            {/* --- Top Navigation Bar --- */}
            <nav className="sticky top-0 z-40 bg-white/80 dark:bg-[#1c1917]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 px-4 md:px-8 flex justify-between items-center transition-all print:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/home')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors">
                        <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#1c1917] dark:bg-white animate-pulse"></span>
                            <h1 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                                {data.submittalNo || 'New Submittal'}
                            </h1>
                        </div>
                        <p className="text-xs text-gray-400 font-medium truncate max-w-[200px] md:max-w-md">
                            {data.projectTitle || 'Untitled Project'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10">
                        <span className="text-[10px] font-bold uppercase text-gray-500">Status</span>
                        <select
                            value={data.priority}
                            onChange={(e) => setData({ ...data, priority: e.target.value })}
                            className="bg-transparent text-xs font-bold outline-none cursor-pointer text-gray-900 dark:text-white"
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`hidden md:flex items-center gap-2 h-10 px-4 rounded-xl border font-bold text-xs transition-colors ${showPreview ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                        {showPreview ? 'Stop Preview' : 'Preview RFQ'}
                    </button>
                    <button onClick={() => window.print()} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                        <Printer size={18} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-10 px-6 rounded-xl bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black flex items-center gap-2 text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                        <span>Save Changes</span>
                    </button>
                </div>
            </nav>

            {/* --- Main Workspace --- */}
            <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 print:p-0 print:max-w-none">

                {/* 1. Project Information Card (Simplified) */}
                <Card className="print:hidden">
                    <SectionHeader title="RFQ - Request" icon={Hash} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Row 1 */}
                        <div>
                            <Label>Order Number</Label>
                            <StyledInput
                                value={data.submittalNo}
                                onChange={(e: any) => setData({ ...data, submittalNo: e.target.value })}
                                placeholder="Order #"
                                className="font-mono text-lg font-bold"
                            />
                        </div>
                        <div>
                            <Label>Order By (Name)</Label>
                            <StyledInput
                                value={data.createdBy}
                                onChange={(e: any) => setData({ ...data, createdBy: e.target.value })}
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <Label>Order Date</Label>
                            <StyledInput
                                type="date"
                                value={data.dueDate}
                                onChange={(e: any) => setData({ ...data, dueDate: e.target.value })}
                            />
                        </div>

                        {/* Row 2 */}
                        <div className="md:col-span-1">
                            <Label>Client Name</Label>
                            <StyledInput
                                value={data.contractorName}
                                onChange={(e: any) => setData({ ...data, contractorName: e.target.value })}
                                placeholder="Client / Company Name"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <Label>Client Phone</Label>
                            <StyledInput
                                type="tel"
                                value={data.clientPhone}
                                onChange={(e: any) => setData({ ...data, clientPhone: e.target.value })}
                                placeholder="055 555 5555"
                            />
                        </div>
                    </div>
                </Card>

                {/* 2. Line Items Section */}
                <div>
                    <div className="flex justify-between items-end mb-4 print:hidden">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Line Items
                                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">{data.lineItems.length}</span>
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Manage specifications, quantities, and materials.</p>
                        </div>
                        <button onClick={addLineItem} className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center gap-2">
                            <Plus size={16} /> Add New Item
                        </button>
                    </div>

                    <div className="space-y-4 print:hidden">
                        {data.lineItems.length === 0 && (
                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center bg-white dark:bg-[#1c1917]">
                                <LayoutGrid size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-400 font-medium">No items in this submittal yet.</p>
                                <button onClick={addLineItem} className="text-emerald-600 font-bold text-sm mt-2 hover:underline">Create your first item</button>
                            </div>
                        )}

                        {data.lineItems.map((item, idx) => (
                            <div key={item.id} className="bg-white dark:bg-[#1c1917] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                {/* Item Header Bar */}
                                <div className="bg-gray-50/80 dark:bg-white/5 px-6 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-sm flex items-center justify-center text-xs font-bold font-mono text-gray-600 dark:text-gray-300">
                                            {idx + 1}
                                        </div>
                                        <span className="text-xs font-bold uppercase text-gray-400 tracking-widest">Item Specification</span>
                                    </div>
                                    <button onClick={() => removeLineItem(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors" title="Remove Item">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Item Body */}
                                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Left: Specs */}
                                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="col-span-2 md:col-span-4">
                                            <Label>Product Name</Label>
                                            <StyledInput
                                                value={item.description}
                                                onChange={(e: any) => updateLineItem(item.id, 'description', e.target.value)}
                                                placeholder="e.g. Executive Desk"
                                                className="font-bold"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Label>Quantity</Label>
                                            <StyledInput type="number" value={item.copies} onChange={(e: any) => updateLineItem(item.id, 'copies', e.target.value)} className="text-center font-bold" />
                                        </div>
                                        <div className="col-span-1">
                                            <Label>Model Ref</Label>
                                            <StyledInput value={item.model} onChange={(e: any) => updateLineItem(item.id, 'model', e.target.value)} />
                                        </div>
                                        <div className="col-span-1">
                                            <Label>Code</Label>
                                            <StyledInput value={item.barcode} onChange={(e: any) => updateLineItem(item.id, 'barcode', e.target.value)} />
                                        </div>
                                        <div className="col-span-1">
                                            <Label>Color</Label>
                                            <StyledInput value={item.color} onChange={(e: any) => updateLineItem(item.id, 'color', e.target.value)} />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>Dimensions (WxDxH)</Label>
                                            <div className="flex items-center gap-1">
                                                <StyledInput placeholder="W" className="text-center px-1" value={item.dimensions?.split('x')[0] || ''}
                                                    onChange={(e: any) => {
                                                        const parts = (item.dimensions || '').split('x');
                                                        updateLineItem(item.id, 'dimensions', `${e.target.value}x${parts[1] || ''}x${parts[2] || ''}`)
                                                    }}
                                                />
                                                <span className="text-gray-300">×</span>
                                                <StyledInput placeholder="D" className="text-center px-1" value={item.dimensions?.split('x')[1] || ''}
                                                    onChange={(e: any) => {
                                                        const parts = (item.dimensions || '').split('x');
                                                        updateLineItem(item.id, 'dimensions', `${parts[0] || ''}x${e.target.value}x${parts[2] || ''}`)
                                                    }}
                                                />
                                                <span className="text-gray-300">×</span>
                                                <StyledInput placeholder="H" className="text-center px-1" value={item.dimensions?.split('x')[2] || ''}
                                                    onChange={(e: any) => {
                                                        const parts = (item.dimensions || '').split('x');
                                                        updateLineItem(item.id, 'dimensions', `${parts[0] || ''}x${parts[1] || ''}x${e.target.value}`)
                                                    }}
                                                />
                                            </div>
                                        </div>

                                    </div>

                                    {/* Right: Material & Visuals */}
                                    <div className="lg:col-span-4 space-y-4">
                                        {/* Reference Images (Top of Right Column) */}
                                        <div className="bg-gray-50 dark:bg-white/5 rounded-sm p-4 border border-gray-200 dark:border-white/5">
                                            <Label>Product Images</Label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {item.itemImages?.map((img, i) => (
                                                    <div key={i} className="relative w-16 h-16 rounded-sm overflow-hidden group/img cursor-pointer border border-gray-300 hover:border-black transition-colors">
                                                        <img src={img} className="w-full h-full object-cover" />
                                                        <div onClick={() => {
                                                            const newImgs = [...(item.itemImages || [])];
                                                            newImgs.splice(i, 1);
                                                            updateLineItem(item.id, 'itemImages', newImgs);
                                                        }}
                                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                        >
                                                            <X size={14} className="text-white" />
                                                        </div>
                                                    </div>
                                                ))}
                                                <label className="w-16 h-16 rounded-sm border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-black transition-all text-gray-400 hover:text-black">
                                                    <Plus size={20} />
                                                    <span className="text-[9px] uppercase font-bold mt-0.5">Add</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true, item.id)} />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-white/5 rounded-sm p-4 border border-gray-200 dark:border-white/5">
                                            <div className="flex justify-between mb-2">
                                                <Label>Material Finish</Label>
                                                <input
                                                    type="number"
                                                    placeholder="Gloss %"
                                                    className="w-16 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-sm px-2 py-0.5 text-xs text-center outline-none font-bold"
                                                    value={item.glossiness || ''}
                                                    onChange={(e) => updateLineItem(item.id, 'glossiness', e.target.value)}
                                                />
                                            </div>
                                            <button
                                                onClick={() => setShowVeneerModal(item.id)}
                                                className="w-full flex items-center gap-3 bg-white dark:bg-black p-3 rounded-sm border border-gray-300 dark:border-gray-700 hover:border-gray-500 transition-all text-left group/btn"
                                            >
                                                {item.veneer ? (
                                                    <>
                                                        <img src={item.veneer.imageUrl} className="w-10 h-10 rounded-sm object-cover border border-gray-200" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold truncate">{item.veneer.name}</p>
                                                            <p className="text-[10px] text-gray-400">Click to change</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-sm bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                                            <Palette size={18} />
                                                        </div>
                                                        <span className="text-sm text-gray-400 font-medium">Select Material...</span>
                                                    </>
                                                )}
                                                <ChevronDown size={14} className="text-gray-400" />
                                            </button>
                                        </div>

                                    </div>



                                    {/* Full Width: Note */}
                                    <div className="col-span-1 lg:col-span-12 mt-2">
                                        <Label>Note</Label>
                                        <input
                                            value={item.comments}
                                            onChange={(e) => updateLineItem(item.id, 'comments', e.target.value)}
                                            className="w-full bg-transparent border-b border-dashed border-gray-300 dark:border-gray-700 py-2 text-sm text-gray-600 dark:text-gray-400 focus:border-gray-900 outline-none transition-colors"
                                            placeholder="Add notes..."
                                        />
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. General Remarks & Attachments */}


            </main>

            {/* --- Modals --- */}
            {/* Veneer Selector - Improved */}
            {showVeneerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowVeneerModal(null)} />
                    <div className="relative bg-white dark:bg-[#1c1917] rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#1c1917]">
                            <h2 className="text-xl font-bold font-serif">Material Library</h2>
                            <button onClick={() => setShowVeneerModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 dark:bg-black/20">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {veneers.map(v => {
                                    const activeItem = data.lineItems.find(i => i.id === showVeneerModal);
                                    const isSelected = activeItem?.veneer?.id === v.id;
                                    return (
                                        <div
                                            key={v.id}
                                            onClick={() => updateLineItem(showVeneerModal, 'veneer', v)}
                                            className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${isSelected ? 'border-gray-900 dark:border-white shadow-lg transform scale-[1.02]' : 'border-transparent hover:border-gray-300 shadow-sm'}`}
                                        >
                                            <div className="aspect-[4/3] overflow-hidden">
                                                <img src={v.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{v.name}</h4>
                                                <p className="text-xs text-gray-400 mt-1">ID: {v.id.substring(0, 6)}</p>
                                            </div>
                                            {isSelected && <div className="absolute top-3 right-3 bg-gray-900 text-white p-1.5 rounded-full shadow-md"><Check size={12} /></div>}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1c1917] flex justify-end">
                            <button onClick={() => setShowVeneerModal(null)} className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-black transition-colors">Confirm Selection</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Print Template (Separate Component) --- */}
            {/* --- Print Template (Separate Component) --- */}
            <PrintTemplate data={data} className={`${showPreview ? 'block fixed inset-0 z-50 overflow-y-auto' : 'hidden'} print:block print:static print:z-[9999]`} />

        </div>
    );
}