import React, { useState, useRef, useEffect } from 'react';
import { SubmittalData, INITIAL_DATA, LineItem, Veneer, Glossiness } from '../../types';
import { Printer, Plus, Trash2, X, Save, ArrowLeft, AlertCircle, Check, FileText, Upload, ChevronDown, Palette } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { QRCodeComponent } from '../components/QRCode';

export default function Editor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();
    const [data, setData] = useState<SubmittalData>({ ...INITIAL_DATA, priority: 'Medium', revision: '0', dueDate: '' });
    const [saving, setSaving] = useState(false);

    // Veneer Logic
    const [veneers, setVeneers] = useState<Veneer[]>([]);
    const [showVeneerModal, setShowVeneerModal] = useState<string | null>(null); // itemId to edit

    useEffect(() => {
        const fetchVeneers = async () => {
            const snapshot = await getDocs(collection(db, 'veneers'));
            setVeneers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Veneer)));
        };
        fetchVeneers();
    }, []);

    // مقاييس الصفحة (نفس المنطق الفيزيائي السابق)
    const [pageMetrics, setPageMetrics] = useState({
        availableHeight: 0,
        contentHeight: 0,
        imagesHeight: 0,
        canFitImages: true,
        suggestedImageHeight: 150
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // --- Logic: Fetch Data ---
    useEffect(() => {
        if (id) {
            const fetchDocument = async () => {
                try {
                    const docSnap = await getDoc(doc(db, "submittals", id));
                    if (docSnap.exists()) {
                        setData(docSnap.data() as SubmittalData);
                    } else {
                        navigate('/history');
                    }
                } catch (error) {
                    console.error("Error fetching document:", error);
                }
            };
            fetchDocument();
        }
    }, [id, navigate]);

    // --- Logic: Intelligent Physics System ---
    useEffect(() => {
        if (contentRef.current) {
            const A4_HEIGHT_MM = 297;
            const PADDING_MM = 30;
            const availableHeightMM = A4_HEIGHT_MM - PADDING_MM;
            const availableHeightPX = (availableHeightMM / 297) * contentRef.current.offsetHeight;

            // Measure sections
            const header = contentRef.current.querySelector('.header-section')?.clientHeight || 0;
            const projectInfo = contentRef.current.querySelector('.project-info-section')?.clientHeight || 0;
            const checkboxes = contentRef.current.querySelector('.checkboxes-section')?.clientHeight || 0;
            const table = contentRef.current.querySelector('.table-section')?.clientHeight || 0;
            const remarks = contentRef.current.querySelector('.remarks-section')?.clientHeight || 0;
            const certification = contentRef.current.querySelector('.certification-section')?.clientHeight || 0;
            const footer = contentRef.current.querySelector('.footer-section')?.clientHeight || 0;

            const contentHeight = header + projectInfo + checkboxes + table + remarks + certification + footer;
            const remainingSpace = availableHeightPX - contentHeight - 100;

            // Image calculation logic
            const imageCount = data.images.length;
            let suggestedImageHeight = 150;
            let canFitImages = true;

            if (imageCount > 0) {
                const MIN_IMAGE_HEIGHT = 80;
                const MAX_IMAGE_HEIGHT = 200;
                const SPACING = 12;

                if (imageCount <= 2) {
                    suggestedImageHeight = Math.min(MAX_IMAGE_HEIGHT, Math.max(MIN_IMAGE_HEIGHT, remainingSpace - 80));
                } else if (imageCount <= 4) {
                    const rowHeight = (remainingSpace - SPACING - 80) / 2;
                    suggestedImageHeight = Math.min(MAX_IMAGE_HEIGHT, Math.max(MIN_IMAGE_HEIGHT, rowHeight));
                } else {
                    const rows = Math.ceil(imageCount / 3);
                    const rowHeight = (remainingSpace - (SPACING * (rows - 1)) - 80) / rows;
                    suggestedImageHeight = Math.min(MAX_IMAGE_HEIGHT, Math.max(MIN_IMAGE_HEIGHT, rowHeight));
                }

                const totalImagesHeight = imageCount <= 3
                    ? suggestedImageHeight + 80
                    : (Math.ceil(imageCount / 3) * suggestedImageHeight) + (Math.ceil(imageCount / 3) * SPACING) + 80;

                canFitImages = totalImagesHeight <= remainingSpace;
            }

            setPageMetrics({
                availableHeight: availableHeightPX,
                contentHeight,
                imagesHeight: remainingSpace,
                canFitImages,
                suggestedImageHeight: Math.round(suggestedImageHeight)
            });
        }
    }, [data.lineItems.length, data.remarks, data.images.length]);

    // --- Logic: Handlers ---
    const handleSave = async () => {
        setSaving(true);
        try {
            const docId = id || doc(collection(db, "submittals")).id;
            const submittalToSave = {
                ...data,
                date: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString(),
            };
            await setDoc(doc(db, "submittals", docId), submittalToSave);
            setSaving(false);
            if (!id) navigate(`/editor/${docId}`);
        } catch (error) {
            console.error("Error saving:", error);
            setSaving(false);
        }
    };

    const handlePrint = () => window.print();

    const addLineItem = () => {
        const newItem: LineItem = {
            id: Math.random().toString(36).substr(2, 9),
            itemNo: (data.lineItems.length + 1).toString(), // Auto number
            copies: 1,
            date: new Date().toISOString().split('T')[0],
            specSection: "",
            description: "",
            barcode: "",
            color: "",
            dimensions: "",
            model: "",
            itemImages: [],
            unitPrice: 0,
            discount: 0,
            taxes: 15, // Default 15% VAT
            amount: 0,
            action: "",
            reviewerInitials: "",
            comments: ""
        };
        setData(prev => ({ ...prev, lineItems: [...prev.lineItems, newItem] }));
    };

    const removeLineItem = (id: string) => {
        setData(prev => ({ ...prev, lineItems: prev.lineItems.filter(i => i.id !== id) }));
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
        setData(prev => ({
            ...prev,
            lineItems: prev.lineItems.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) return; // Limit 5MB

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Simple compression logic simulation for brevity
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
                    setData(prev => ({ ...prev, images: [...prev.images, compressedBase64] }));
                };
                img.src = base64String;
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index: number) => {
        setData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== index) }));
    };

    const getEmptyRowsCount = () => {
        const minRows = 3;
        const currentRows = data.lineItems.length;
        if (currentRows < minRows) return minRows - currentRows;
        return 0;
    };

    // --- Helper for "Architect" Inputs ---
    const InputField = ({ label, value, onChange, placeholder, type = "text" }: any) => (
        <div className="group">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-sm text-[#1c1917] dark:text-white font-medium placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-[#1c1917] dark:focus:border-white transition-all rounded-none ${isRTL ? 'text-right' : 'text-left'}`}
            />
        </div>
    );

    return (
        <div className={`flex flex-col lg:flex-row h-screen overflow-hidden bg-[#e5e5e5] dark:bg-[#0f0f0f] font-sans text-[#1c1917] dark:text-white transition-colors ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>

            {/* --- LEFT PANEL: The "Forest Edge" Editor --- */}
            <div className={`w-full lg:w-4/12 h-full flex flex-col bg-[#FDFDFB] dark:bg-[#1c1917] border-r border-gray-200 dark:border-gray-800 shadow-2xl z-20 no-print transition-colors`}>

                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 bg-[#FDFDFB] dark:bg-[#1c1917] transition-colors">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/home')} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="font-serif text-lg font-bold text-[#1c1917] dark:text-white">{t('editor.title', 'Editor')}</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('editor.liveSystem', 'Live System')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={saving} className="w-10 h-10 rounded-lg bg-[#1c1917] dark:bg-white text-white dark:text-[#1c1917] flex items-center justify-center hover:bg-black dark:hover:bg-gray-200 transition-all disabled:opacity-50">
                            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                        </button>
                        <button onClick={handlePrint} className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                            <Printer size={18} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Space Monitor */}
                    <div className={`p-4 rounded-xl border ${pageMetrics.canFitImages ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900'} transition-colors`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{t('editor.pageCapacity', 'Page Capacity')}</span>
                            <span className={`text-[10px] font-bold uppercase ${pageMetrics.canFitImages ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {pageMetrics.canFitImages ? t('editor.optimal', 'Optimal') : t('editor.overload', 'Overload')}
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${pageMetrics.canFitImages ? 'bg-[#1c1917] dark:bg-emerald-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(100, (pageMetrics.contentHeight / pageMetrics.availableHeight) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Section 1: Core Data */}
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-3 bg-[#1c1917] dark:bg-white"></div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{t('editor.documentSpecs', 'Document Specs')}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label={t('editor.submittalNo', 'Ref No')}
                                value={data.submittalNo}
                                onChange={(e: any) => setData({ ...data, submittalNo: e.target.value })}
                                placeholder="SUB-001"
                            />
                            <InputField
                                label={t('editor.revision', 'Revision')}
                                value={data.revision}
                                onChange={(e: any) => setData({ ...data, revision: e.target.value })}
                                placeholder="0"
                            />
                        </div>
                        <InputField
                            label={t('editor.projectTitle', 'Project Title')}
                            value={data.projectTitle}
                            onChange={(e: any) => setData({ ...data, projectTitle: e.target.value })}
                            placeholder="Enter project full title"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{t('editor.priority', 'Priority')}</label>
                                <select
                                    value={data.priority}
                                    onChange={(e) => setData({ ...data, priority: e.target.value })}
                                    className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-sm font-medium text-[#1c1917] dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none appearance-none"
                                >
                                    <option className="text-black">{t('common.low', 'Low')}</option>
                                    <option className="text-black">{t('common.medium', 'Medium')}</option>
                                    <option className="text-black">{t('common.high', 'High')}</option>
                                </select>
                            </div>
                            <InputField
                                label={t('editor.dueDate', 'Due Date')}
                                type="date"
                                value={data.dueDate}
                                onChange={(e: any) => setData({ ...data, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Section 2: Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-3 bg-[#1c1917] dark:bg-white"></div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{t('editor.lineItems', 'Line Items')}</h3>
                            </div>
                            <button onClick={addLineItem} className="text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-800 hover:bg-[#1c1917] dark:hover:bg-white hover:text-white dark:hover:text-[#1c1917] px-3 py-1 rounded transition-colors text-[#1c1917] dark:text-white">
                                {t('editor.addItem', '+ Add Item')}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {data.lineItems.map((item, idx) => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-xl shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all group relative">
                                    <button onClick={() => removeLineItem(item.id)} className="absolute top-2 right-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                    <div className="mb-3">
                                        <label className="text-[8px] font-bold uppercase text-gray-400 dark:text-gray-500">{t('editor.productName', 'Product Name / Description')}</label>
                                        <input
                                            value={item.description}
                                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                            className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 text-sm focus:border-black dark:focus:border-white focus:outline-none text-[#1c1917] dark:text-white"
                                            placeholder="Enter product name and description..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        <div>
                                            <label className="text-[8px] font-bold uppercase text-gray-400 dark:text-gray-500">{t('editor.model', 'Model / Code')}</label>
                                            <input
                                                value={item.model || ''}
                                                onChange={(e) => updateLineItem(item.id, 'model', e.target.value)}
                                                className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 text-sm focus:border-black dark:focus:border-white focus:outline-none text-[#1c1917] dark:text-white"
                                                placeholder="e.g., 4410"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-bold uppercase text-gray-400 dark:text-gray-500">{t('editor.color', 'Color')}</label>
                                            <input
                                                value={item.color || ''}
                                                onChange={(e) => updateLineItem(item.id, 'color', e.target.value)}
                                                className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 text-sm focus:border-black dark:focus:border-white focus:outline-none text-[#1c1917] dark:text-white"
                                                placeholder="e.g., Oak, Walnut"
                                            />
                                        </div>
                                        <div className="flex gap-2 items-end">
                                            {(() => {
                                                // Split by 'x' to preserve empty slots. Handle standard format.
                                                const parts = (item.dimensions || '').split('x');
                                                const w = parts[0] || '';
                                                const d = parts[1] || '';
                                                const h = parts[2] || '';

                                                const updateDims = (newW: string, newD: string, newH: string) => {
                                                    // Join with 'x' even if empty to preserve position
                                                    const val = `${newW.trim()}x${newD.trim()}x${newH.trim()}`;
                                                    updateLineItem(item.id, 'dimensions', val);
                                                };

                                                return (
                                                    <>
                                                        <div className="flex-1">
                                                            <label className="text-[8px] font-bold uppercase text-gray-400 dark:text-gray-500">W</label>
                                                            <input
                                                                value={w}
                                                                onChange={(e) => updateDims(e.target.value, d, h)}
                                                                className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 text-sm focus:border-black dark:focus:border-white focus:outline-none text-center text-[#1c1917] dark:text-white"
                                                                placeholder="W"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[8px] font-bold uppercase text-gray-400 dark:text-gray-500">D</label>
                                                            <input
                                                                value={d}
                                                                onChange={(e) => updateDims(w, e.target.value, h)}
                                                                className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 text-sm focus:border-black dark:focus:border-white focus:outline-none text-center text-[#1c1917] dark:text-white"
                                                                placeholder="D"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[8px] font-bold uppercase text-gray-400 dark:text-gray-500">H</label>
                                                            <input
                                                                value={h}
                                                                onChange={(e) => updateDims(w, d, e.target.value)}
                                                                className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 text-sm focus:border-black dark:focus:border-white focus:outline-none text-center text-[#1c1917] dark:text-white"
                                                                placeholder="H"
                                                            />
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="text-[8px] font-bold uppercase text-gray-400 dark:text-gray-500">{t('editor.qty', 'Quantity')}</label>
                                            <input
                                                type="number"
                                                value={item.copies}
                                                onChange={(e) => updateLineItem(item.id, 'copies', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 text-sm focus:border-black dark:focus:border-white focus:outline-none text-[#1c1917] dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-bold uppercase text-gray-400 dark:text-gray-500">{t('editor.notes', 'Notes')}</label>
                                            <input
                                                value={item.comments || ''}
                                                onChange={(e) => updateLineItem(item.id, 'comments', e.target.value)}
                                                className="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 text-sm focus:border-black dark:focus:border-white focus:outline-none text-[#1c1917] dark:text-white"
                                                placeholder="Simple notes..."
                                            />
                                        </div>
                                    </div>

                                    {/* Smart Material Selection */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowVeneerModal(item.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-black dark:hover:border-white transition-colors"
                                        >
                                            <Palette size={14} className="text-gray-500 dark:text-gray-400" />
                                            {item.veneer ? (
                                                <div className="flex items-center gap-2">
                                                    <img src={item.veneer.imageUrl} className="w-5 h-5 rounded-full object-cover" />
                                                    <span className="text-xs font-bold text-[#1c1917] dark:text-white">{item.veneer.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">{t('editor.selectVeneer', 'Select Veneer')}</span>
                                            )}
                                            <ChevronDown size={12} className="text-gray-400" />
                                        </button>

                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase">{t('editor.gloss', 'Gloss %')}</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={item.glossiness || ''}
                                                onChange={(e) => updateLineItem(item.id, 'glossiness', e.target.value)}
                                                className="w-12 bg-transparent text-xs font-bold text-[#1c1917] dark:text-white focus:outline-none border-b border-transparent focus:border-black dark:focus:border-white text-center"
                                                placeholder="0-100"
                                            />
                                        </div>
                                    </div>

                                    {/* Product Images */}
                                    <div className="mt-3">
                                        <label className="text-[8px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-2 block">{t('editor.productImages', 'Product Images')}</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {item.itemImages && item.itemImages.map((img, imgIdx) => (
                                                <div key={imgIdx} className="relative w-16 h-16 rounded border border-gray-200 overflow-hidden group">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => {
                                                            const newImages = [...(item.itemImages || [])];
                                                            newImages.splice(imgIdx, 1);
                                                            updateLineItem(item.id, 'itemImages', newImages);
                                                        }}
                                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                    >
                                                        <Trash2 size={12} className="text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!item.itemImages || item.itemImages.length < 4) && (
                                                <label className="w-16 h-16 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-black dark:hover:border-white transition-colors">
                                                    <Upload size={16} className="text-gray-400" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                const file = e.target.files[0];
                                                                if (file.size > 5 * 1024 * 1024) return; // 5MB limit
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    const base64String = reader.result as string;
                                                                    const img = new Image();
                                                                    img.onload = () => {
                                                                        const canvas = document.createElement('canvas');
                                                                        const ctx = canvas.getContext('2d');
                                                                        const MAX_SIZE = 800;
                                                                        let width = img.width;
                                                                        let height = img.height;
                                                                        if (width > MAX_SIZE || height > MAX_SIZE) {
                                                                            if (width > height) {
                                                                                height = (height / width) * MAX_SIZE;
                                                                                width = MAX_SIZE;
                                                                            } else {
                                                                                width = (width / height) * MAX_SIZE;
                                                                                height = MAX_SIZE;
                                                                            }
                                                                        }
                                                                        canvas.width = width;
                                                                        canvas.height = height;
                                                                        ctx?.drawImage(img, 0, 0, width, height);
                                                                        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                                                                        const currentImages = item.itemImages || [];
                                                                        updateLineItem(item.id, 'itemImages', [...currentImages, compressedBase64]);
                                                                    };
                                                                    img.src = base64String;
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Section 3: Attachments */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-3 bg-[#1c1917] dark:bg-white"></div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{t('editor.visualEvidence', 'Visual Evidence')}</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {data.images.map((img, i) => (
                                <div key={i} className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 relative group overflow-hidden">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => removeImage(i)} className="text-white hover:text-red-400">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {data.images.length < 6 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                >
                                    <Upload size={20} className="mb-1" />
                                    <span className="text-[9px] uppercase font-bold">{t('common.upload', 'Upload')}</span>
                                </button>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>

                    {/* Section 4: Remarks */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('editor.remarks', 'Remarks / Notes')}</label>
                        <textarea
                            value={data.remarks}
                            onChange={(e) => setData({ ...data, remarks: e.target.value })}
                            rows={3}
                            className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:border-black dark:focus:border-white focus:outline-none resize-none text-[#1c1917] dark:text-white"
                            placeholder="Add additional comments here..."
                        />
                    </div>

                </div>
            </div>

            {/* --- RIGHT PANEL: The "Paper" (Split Pages Logic) --- */}
            <div className="flex-1 bg-[#2b2b2b] overflow-y-auto p-8 lg:p-12 flex flex-col items-center gap-8 print-container custom-scrollbar print:p-0 print:bg-white print:block">

                {/* 
                    LOGIC: Split items into pages. 
                    Assumption: A4 ~ 1123px height @ 96DPI, or similar. 
                    We'll treat pages as "Chunks" of items.
                    For simplicity in this iteration:
                    - Page 1: Header + Info + Table Header + ~10 Items + Remarks (if small)
                    - Page 2+: Table Header + Items 
                    - Last Page: Items + Certification
                */}

                {data.lineItems.length > 0 && (
                    /* Simple Logic: Just show one giant connected paper for now in preview, but use print break logic */
                    /* The user asked for "smart splitting". We will simulate "Pages". */
                    [...Array(Math.ceil(data.lineItems.length / 12) || 1)].map((_, pageIdx) => {
                        const itemsPerPage = 12;
                        const pageItems = data.lineItems.slice(pageIdx * itemsPerPage, (pageIdx + 1) * itemsPerPage);
                        const isLastPage = pageIdx === Math.ceil(data.lineItems.length / 12) - 1;

                        return (
                            <div
                                key={pageIdx}
                                className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative print-page break-after-page"
                                style={{
                                    width: '210mm',
                                    minHeight: '297mm',
                                    padding: '10mm 15mm',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {/* HEADER - Professional Purchase Order Style */}
                                <div className="header-section border-b-2 border-black pb-3 mb-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-1/4">
                                            {data.logo && <img src={data.logo} className="h-12 object-contain" />}
                                        </div>
                                        <div className="w-1/2 text-center">
                                            <h1 className="text-2xl font-bold text-black mb-1">PURCHASE ORDER</h1>
                                            <p className="text-lg font-mono font-bold text-black">#{data.submittalNo}</p>
                                        </div>
                                        <div className="w-1/4 flex justify-end">
                                            <QRCodeComponent value={`${id}-P${pageIdx + 1}`} size={56} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-xs">
                                        <div>
                                            <p className="font-bold text-gray-600 uppercase text-[9px] mb-1">Buyer:</p>
                                            <p className="font-bold text-black">{data.contractorName}</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-600 uppercase text-[9px] mb-1">Order Reference:</p>
                                            <p className="font-bold text-black">{data.contractNo}</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-600 uppercase text-[9px] mb-1">Order Date:</p>
                                            <p className="font-bold text-black">{new Date().toLocaleDateString('en-GB')}</p>
                                        </div>
                                    </div>
                                    {pageIdx > 0 && (
                                        <div className="text-center mt-2 text-[10px] text-gray-500">
                                            Page {pageIdx + 1} of {Math.ceil(data.lineItems.length / 12)}
                                        </div>
                                    )}
                                </div>

                                {/* TABLE */}
                                <div className="flex-1">
                                    <table className="w-full border-collapse text-xs">

                                        <tbody>
                                            {pageItems.map(item => (
                                                <tr key={item.id} className="border-b border-gray-200">
                                                    <td className="border-r border-gray-200 p-0 align-top">
                                                        {/* Top Strip: Name */}
                                                        <div className="bg-gray-100 px-4 py-2">
                                                            <div className="font-bold text-sm text-[#1c1917] uppercase tracking-wide">{item.description}</div>
                                                        </div>

                                                        {/* Bottom Area: Specs (Tags) */}
                                                        <div className="p-3 bg-white min-h-[60px] flex flex-wrap items-center gap-3">
                                                            {item.dimensions && (() => {
                                                                const dims = item.dimensions.split('x');
                                                                // We expect exactly 3 slots from our new input, but handle loose strings too
                                                                const w = dims[0];
                                                                const d = dims[1];
                                                                const h = dims[2];

                                                                // If it's the old format (just one number no separators), treat as W or just separate tag? 
                                                                // Actually new input forces x separators.
                                                                // But if legacy data exists without 'x', dims length is 1.

                                                                if (dims.length > 1 || (dims.length === 1 && item.dimensions.includes('x'))) {
                                                                    return (
                                                                        <div className="flex gap-2">
                                                                            {w && <div className="px-3 py-1 bg-gray-100 rounded text-[10px] font-bold text-black border border-gray-200">Width: {w}</div>}
                                                                            {d && <div className="px-3 py-1 bg-gray-100 rounded text-[10px] font-bold text-black border border-gray-200">Depth: {d}</div>}
                                                                            {h && <div className="px-3 py-1 bg-gray-100 rounded text-[10px] font-bold text-black border border-gray-200">Height: {h}</div>}
                                                                        </div>
                                                                    );
                                                                }
                                                                // Fallback for purely text dimensions? 
                                                                // If user typed "100" in W and nothing else, it becomes "100xx".
                                                                // Split gives ["100", "", ""]. w="100".
                                                                // So the above block works fine for "100xx".

                                                                // What if it is just "random string"?
                                                                // It will be w="random string".
                                                                return (
                                                                    <div className="px-3 py-1 bg-gray-100 rounded text-[10px] font-bold text-black border border-gray-200">
                                                                        Size: {item.dimensions}
                                                                    </div>
                                                                );
                                                            })()}
                                                            {item.color && (
                                                                <div className="px-3 py-1 bg-gray-100 rounded text-[10px] font-bold text-black border border-gray-200">
                                                                    Color: {item.color}
                                                                </div>
                                                            )}
                                                            {item.model && (
                                                                <div className="px-3 py-1 bg-gray-100 rounded text-[10px] font-bold text-black border border-gray-200">
                                                                    Model: {item.model}
                                                                </div>
                                                            )}
                                                            {item.veneer && (
                                                                <div className="px-3 py-1 bg-gray-100 rounded text-[10px] font-bold text-black border border-gray-200">
                                                                    Veneer: {item.veneer.name}
                                                                </div>
                                                            )}
                                                            {item.glossiness && (
                                                                <div className="px-3 py-1 bg-gray-100 rounded text-[10px] font-bold text-black border border-gray-200">
                                                                    Glossiness: {item.glossiness}%
                                                                </div>
                                                            )}
                                                            {item.comments && (
                                                                <div className="w-full mt-1 pt-2 border-t border-gray-100 text-[10px] italic text-gray-500">
                                                                    {item.comments}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-0 text-center align-top">
                                                        {/* Top Strip: Qty */}
                                                        <div className="bg-gray-100 py-2 h-[37px] flex items-center justify-center">
                                                            <div className="font-bold text-sm text-[#1c1917]">{item.copies}</div>
                                                        </div>
                                                        {/* Bottom Area: Empty to match height */}
                                                        <div className="bg-white min-h-[60px]"></div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Fill empty rows only on last page to look neat? No, just leave blank space. */}
                                        </tbody>
                                    </table>

                                    {/* Product Images Section */}
                                    {pageItems.some(item => item.itemImages && item.itemImages.length > 0) && isLastPage && (
                                        <div className="mt-6">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700 mb-3 border-b border-gray-300 pb-2">Product Images</h3>
                                            <div className="grid grid-cols-4 gap-3">
                                                {pageItems.map(item => (
                                                    item.itemImages && item.itemImages.length > 0 && (
                                                        <div key={item.id} className="space-y-2">
                                                            <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">Item {item.itemNo}</div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {item.itemImages.map((img, imgIdx) => (
                                                                    <div key={imgIdx} className="aspect-square border border-gray-200 rounded overflow-hidden">
                                                                        <img src={img} className="w-full h-full object-cover" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* FOOTER */}
                                <div className="mt-auto pt-4 border-t border-gray-300">
                                    <div className="flex justify-between text-[8px] text-gray-500 uppercase">
                                        <span>Forest Edge Enterprise System</span>
                                        <span>Page {pageIdx + 1} of {Math.ceil(data.lineItems.length / 12)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* VENEER SELECTOR MODAL */}
            {
                showVeneerModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowVeneerModal(null)}></div>
                        <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in-up">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h2 className="font-serif text-2xl font-bold text-[#1c1917] dark:text-white">{t('editor.selectMaterial', 'Select Material Finish')}</h2>
                                <button onClick={() => setShowVeneerModal(null)}><X size={24} className="text-gray-400 hover:text-black dark:hover:text-white" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-black/50">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {veneers.map(v => (
                                        <div
                                            key={v.id}
                                            onClick={() => {
                                                updateLineItem(showVeneerModal, 'veneer', v);
                                            }}
                                            className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all relative group h-48 ${data.lineItems.find(i => i.id === showVeneerModal)?.veneer?.id === v.id ? 'border-[#1c1917] dark:border-white ring-2 ring-[#1c1917]/20 dark:ring-white/20 scale-[1.02]' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'}`}
                                        >
                                            <img src={v.imageUrl} className="w-full h-32 object-cover" />
                                            <div className="p-3">
                                                <p className="font-bold text-sm text-[#1c1917] dark:text-white">{v.name}</p>
                                            </div>
                                            {data.lineItems.find(i => i.id === showVeneerModal)?.veneer?.id === v.id && (
                                                <div className="absolute top-2 right-2 w-6 h-6 bg-[#1c1917] dark:bg-white text-white dark:text-[#1c1917] rounded-full flex items-center justify-center">
                                                    <Check size={14} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8">
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end">
                                <button
                                    onClick={() => setShowVeneerModal(null)}
                                    className="bg-[#1c1917] dark:bg-white text-white dark:text-[#1c1917] px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-gray-200 transition-all"
                                >
                                    {t('editor.confirmSelection', 'Confirm Selection')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
}
