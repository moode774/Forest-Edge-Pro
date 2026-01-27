import React, { useState, useRef, useEffect } from 'react';
import { SubmittalData, INITIAL_DATA, LineItem } from '../../types';
import { Printer, Plus, Trash2, X, Save, ArrowLeft, AlertCircle, Check, FileText, Upload } from 'lucide-react'; // Updated icons import
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { QRCodeComponent } from '../components/QRCode';

export default function Editor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();
    const [data, setData] = useState<SubmittalData>({ ...INITIAL_DATA, priority: 'Medium', revision: '0', dueDate: '' });
    const [saving, setSaving] = useState(false);
    
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
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-black transition-colors">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-transparent border-b border-gray-200 py-2 text-sm text-[#1c1917] font-medium placeholder-gray-300 focus:outline-none focus:border-[#1c1917] transition-all rounded-none ${isRTL ? 'text-right' : 'text-left'}`}
            />
        </div>
    );

    return (
        <div className={`flex flex-col lg:flex-row h-screen overflow-hidden bg-[#e5e5e5] font-sans text-[#1c1917] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>

            {/* --- LEFT PANEL: The "Forest Edge" Editor --- */}
            <div className={`w-full lg:w-4/12 h-full flex flex-col bg-[#FDFDFB] border-r border-gray-200 shadow-2xl z-20 no-print`}>
                
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 bg-[#FDFDFB]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/home')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="font-serif text-lg font-bold text-[#1c1917]">Editor</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Live System</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={saving} className="w-10 h-10 rounded-lg bg-[#1c1917] text-white flex items-center justify-center hover:bg-black transition-all disabled:opacity-50">
                            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={18} />}
                        </button>
                        <button onClick={handlePrint} className="w-10 h-10 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-all">
                            <Printer size={18} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Space Monitor */}
                    <div className={`p-4 rounded-xl border ${pageMetrics.canFitImages ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Page Capacity</span>
                            <span className={`text-[10px] font-bold uppercase ${pageMetrics.canFitImages ? 'text-emerald-600' : 'text-red-600'}`}>
                                {pageMetrics.canFitImages ? 'Optimal' : 'Overload'}
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 ${pageMetrics.canFitImages ? 'bg-[#1c1917]' : 'bg-red-500'}`} 
                                style={{ width: `${Math.min(100, (pageMetrics.contentHeight / pageMetrics.availableHeight) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Section 1: Core Data */}
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-3 bg-[#1c1917]"></div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Document Specs</h3>
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
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Priority</label>
                                <select 
                                    value={data.priority}
                                    onChange={(e) => setData({ ...data, priority: e.target.value })}
                                    className="w-full bg-transparent border-b border-gray-200 py-2 text-sm font-medium focus:outline-none focus:border-black rounded-none appearance-none"
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
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
                                <div className="w-1 h-3 bg-[#1c1917]"></div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Line Items</h3>
                            </div>
                            <button onClick={addLineItem} className="text-[10px] font-bold uppercase bg-gray-100 hover:bg-[#1c1917] hover:text-white px-3 py-1 rounded transition-colors">
                                + Add Item
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {data.lineItems.map((item, idx) => (
                                <div key={item.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:border-gray-300 transition-all group relative">
                                    <button onClick={() => removeLineItem(item.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-2">
                                            <label className="text-[8px] font-bold uppercase text-gray-400">No.</label>
                                            <input 
                                                value={item.itemNo} 
                                                onChange={(e) => updateLineItem(item.id, 'itemNo', e.target.value)}
                                                className="w-full border-b border-gray-100 text-sm font-mono focus:border-black focus:outline-none"
                                            />
                                        </div>
                                        <div className="col-span-10">
                                            <label className="text-[8px] font-bold uppercase text-gray-400">Description</label>
                                            <input 
                                                value={item.description} 
                                                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                                className="w-full border-b border-gray-100 text-sm focus:border-black focus:outline-none"
                                                placeholder="Item description..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Attachments */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-3 bg-[#1c1917]"></div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Visual Evidence</h3>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                            {data.images.map((img, i) => (
                                <div key={i} className="aspect-square bg-gray-50 rounded-lg border border-gray-200 relative group overflow-hidden">
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
                                    className="aspect-square bg-white border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black hover:bg-gray-50 transition-all"
                                >
                                    <Upload size={20} className="mb-1" />
                                    <span className="text-[9px] uppercase font-bold">Upload</span>
                                </button>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>

                    {/* Section 4: Remarks */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Remarks / Notes</label>
                        <textarea 
                            value={data.remarks}
                            onChange={(e) => setData({...data, remarks: e.target.value})}
                            rows={3}
                            className="w-full bg-transparent border border-gray-200 rounded-lg p-3 text-sm focus:border-black focus:outline-none resize-none"
                            placeholder="Add additional comments here..."
                        />
                    </div>

                </div>
            </div>

            {/* --- RIGHT PANEL: The "Paper" (Untouched Design, Professional Presentation) --- */}
            <div className="flex-1 bg-[#2b2b2b] overflow-y-auto p-8 lg:p-12 flex justify-center items-start print-container custom-scrollbar">
                
                {/* NOTE: This section preserves the EXACT internal structure of the user's paper.
                    We only ensure the container is centered.
                */}
                <div 
                    ref={contentRef}
                    className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] mx-auto flex flex-col relative print-only"
                    style={{
                        width: '210mm',
                        minHeight: '297mm', // A4 Height
                        padding: '10mm 15mm',
                        boxSizing: 'border-box'
                    }}
                >
                    {/* --- PAPER HEADER (Standard Form Style) --- */}
                    <div className="header-section border-b-2 border-black pb-2 mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="w-1/3 flex justify-start pt-2 pl-2">
                                {/* Using ID for QR Code to make it look legit */}
                                <QRCodeComponent value={id || "NEW-SUBMITTAL"} size={64} />
                            </div>
                            <div className="w-1/3 flex flex-col items-center">
                                <p className="text-sm font-bold text-gray-600 uppercase mb-1">Submittal No.</p>
                                <div className="flex items-center gap-1">
                                    <div className="border border-black px-4 py-2 min-w-[140px] text-center bg-white shadow-sm">
                                        <p className="text-xl font-bold font-mono text-black leading-none">
                                            {data.submittalNo || '---'}
                                        </p>
                                    </div>
                                    <div className="border border-black px-2 py-2 bg-black text-white">
                                        <p className="text-xl font-bold font-mono leading-none">
                                            R{data.revision || '0'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-1/3 flex justify-end">
                                {data.logo ? (
                                    <img src={data.logo} alt="Logo" className="h-24 w-auto object-contain" />
                                ) : (
                                    <div className="h-24 w-40 border border-black flex items-center justify-center text-xs uppercase font-bold text-gray-400">
                                        [ COMPANY LOGO ]
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <p className="text-xs font-bold text-gray-600 uppercase mb-1">Description</p>
                    <div className="border border-black px-2 py-1 min-h-[2.5rem] flex items-center mb-4">
                        <p className="text-base font-bold text-black leading-tight line-clamp-2">
                            {data.submittalDescription || ''}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-4">
                        <div>
                             <p className="text-xs font-bold text-gray-600 uppercase mb-1">Project Title</p>
                             <div className="border-b border-black pb-1">
                                <p className="font-bold text-black">{data.projectTitle || ''}</p>
                             </div>
                        </div>
                        <div>
                             <p className="text-xs font-bold text-gray-600 uppercase mb-1">Contractor</p>
                             <div className="border-b border-black pb-1">
                                <p className="font-bold text-black">{data.contractorName || ''}</p>
                             </div>
                        </div>
                    </div>

                    {/* Checkboxes (Standard Grid) */}
                    <div className="checkboxes-section border border-black p-2 mb-4">
                         <div className="grid grid-cols-4 gap-2">
                            {[
                                { key: 'attached', label: 'Attached' },
                                { key: 'forInfo', label: 'For Info' },
                                { key: 'separateCover', label: 'Sep. Cover' },
                                { key: 'forReview', label: 'For Review' }
                            ].map((cb) => (
                                <div key={cb.key} className="flex items-center gap-2">
                                    <div className={`w-4 h-4 border border-black flex items-center justify-center ${data[cb.key] ? 'bg-black text-white' : 'bg-white'}`}>
                                        {data[cb.key] && <Check size={12} />}
                                    </div>
                                    <span className="text-xs font-bold text-black uppercase">{cb.label}</span>
                                </div>
                            ))}
                         </div>
                    </div>

                    {/* The Table */}
                    <div className="table-section mb-4">
                        <table className="w-full border-collapse border border-black text-xs">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black px-2 py-2 font-black text-black w-10">Item</th>
                                    <th className="border border-black px-2 py-2 font-black text-black w-12">Qty</th>
                                    <th className="border border-black px-2 py-2 font-black text-black w-24">Date</th>
                                    <th className="border border-black px-2 py-2 font-black text-black text-left">Description</th>
                                    <th className="border border-black px-2 py-2 font-black text-black w-20">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.lineItems.map(item => (
                                    <tr key={item.id} className="border-b border-black">
                                        <td className="border-r border-black px-2 py-2 text-center font-bold">{item.itemNo}</td>
                                        <td className="border-r border-black px-2 py-2 text-center">{item.copies}</td>
                                        <td className="border-r border-black px-2 py-2 text-center text-[10px]">{item.date}</td>
                                        <td className="border-r border-black px-2 py-2 text-left font-bold">{item.description}</td>
                                        <td className="px-2 py-1.5"></td>
                                    </tr>
                                ))}
                                {Array.from({ length: getEmptyRowsCount() }).map((_, i) => (
                                    <tr key={`empty-${i}`}>
                                        <td className="border-r border-black px-2 py-3"></td>
                                        <td className="border-r border-black px-2 py-3"></td>
                                        <td className="border-r border-black px-2 py-3"></td>
                                        <td className="border-r border-black px-2 py-3"></td>
                                        <td className="px-2 py-3"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Remarks Area */}
                    <div className="remarks-section mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-1 border-b border-black pb-1 inline-block">Remarks</h3>
                        <div className="w-full text-sm text-black p-2 border border-black mt-1 min-h-[60px] whitespace-pre-wrap">
                            {data.remarks || ''}
                        </div>
                    </div>

                    {/* Images Grid (Printed) */}
                    {data.images.length > 0 && pageMetrics.canFitImages && (
                        <div className="images-section mb-6 break-inside-avoid">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-2 border-b border-black pb-1 inline-block">Attachments</h3>
                            <div className={`grid gap-2 ${data.images.length <= 2 ? 'grid-cols-2' : data.images.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                {data.images.map((img, i) => (
                                    <div key={i} className="border border-black overflow-hidden flex items-center justify-center bg-white p-1" 
                                         style={{ height: data.images.length > 2 ? '120px' : '200px' }}>
                                        <img src={img} className="max-w-full max-h-full object-contain" alt="attachment" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer / Certification */}
                    <div className="mt-auto">
                        <div className="border border-black p-3 mb-2 flex items-center gap-4">
                             <div className="w-1/4 shrink-0">
                                <p className="text-[9px] font-bold text-black uppercase underline mb-1">Contractor Certification</p>
                                <p className="text-[8px] text-gray-500 leading-tight">I hereby certify that the items submitted herein have been reviewed in detail and are correct.</p>
                             </div>
                             <div className="flex-1 flex gap-4 border-l border-black pl-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 border border-black flex items-center justify-center ${data.certificationType === 'A' ? 'bg-black text-white' : ''}`}>
                                        {data.certificationType === 'A' && <Check size={10} />}
                                    </div>
                                    <span className="text-[9px] font-bold">Approved as Submitted</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 border border-black flex items-center justify-center ${data.certificationType === 'B' ? 'bg-black text-white' : ''}`}>
                                        {data.certificationType === 'B' && <Check size={10} />}
                                    </div>
                                    <span className="text-[9px] font-bold">Approved with Corrections</span>
                                </div>
                             </div>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest">Generated by Forest Edge Enterprise System</p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}