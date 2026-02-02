import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

// --- Types ---
interface Item {
  id: string | number;
  description: string;
  model?: string;
  barcode?: string;
  color?: string;
  comments?: string;
  dimensions?: string;
  veneer?: { name: string; imageUrl?: string };
  glossiness?: number | string; // e.g., 50, 90, 100
  copies: number;
  unitPrice?: number;
  amount?: number;
  itemImages?: string[];
}

interface PrintTemplateProps {
  data: {
    logo?: string;
    submittalNo?: string;
    dueDate?: string;
    clientName?: string;
    clientPhone?: string;
    createdBy?: string;
    projectName?: string;
    contractorName?: string;
    date?: string;
    lineItems: Item[];
  };
  className?: string;
}

export const PrintTemplate: React.FC<PrintTemplateProps> = ({ data, className }) => {
  const items = data.lineItems || [];

  return (
    <div className={`bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white ${className || ''}`} dir="ltr">

      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white mx-auto shadow-2xl print:shadow-none relative page-break-after-always flex flex-col justify-between"
          style={{
            width: '210mm',
            height: '296mm',
            padding: '15mm 18mm',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >

          {/* ================= HEADER ================= */}
          <header className="flex justify-between items-end border-b-4 border-gray-900 pb-6 mb-6">
            <div className="w-1/3 flex flex-col items-start">
              <img
                src="/logo.png"
                onError={(e) => {
                  if (data.logo) (e.target as HTMLImageElement).src = data.logo;
                  else (e.target as HTMLImageElement).style.display = 'none';
                }}
                alt="Logo"
                className="h-16 object-contain mix-blend-multiply mb-2"
              />
            </div>
            <div className="w-1/3 flex flex-col items-center text-center">
              <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-gray-900 mb-1 font-sans">Submittal Document</h1>
              <span className="text-xs font-serif italic text-gray-500">{data.projectName || 'Untitled Project'}</span>
            </div>
            <div className="w-1/3 flex flex-col items-end">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Ref. No</span>
                  <span className="text-lg font-serif font-bold text-gray-900">{data.submittalNo || '---'}</span>
                </div>
                <QRCodeSVG value={JSON.stringify({ id: item.id, ref: item.model })} size={48} level="M" />
              </div>
            </div>
          </header>

          {/* ================= INFO BAR ================= */}
          <div className="bg-gray-50 rounded-sm p-4 mb-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-4 w-[40%]">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Client Information</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-serif font-bold text-gray-900">{data.clientName || data.contractorName || '---'}</span>
                    <span className="text-xs font-sans text-gray-600 mt-1">{data.clientPhone || '---'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-12 w-[40%] justify-start border-l border-gray-300 pl-8">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Date</span>
                  <span className="text-sm font-sans font-medium text-gray-900">{new Date(data.date || new Date()).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Doc Ref.</span>
                  <span className="text-sm font-sans font-medium text-gray-900">{data.submittalNo || '---'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end w-[20%]">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Authorized By</span>
                <span className="text-sm font-serif font-bold text-gray-900 border-b border-gray-300 pb-1 min-w-[100px] text-right">
                  {data.createdBy || '---'}
                </span>
              </div>
            </div>
          </div>


          {/* ================= MAIN GRID ================= */}
          <div className="grid grid-cols-12 gap-8 items-start mb-2">
            {/* --- LEFT: IMAGE --- */}
            <div className="col-span-7">
              <div className="w-full aspect-[4/3] bg-white border-2 border-gray-100 flex items-center justify-center p-6 relative">
                {item.itemImages && item.itemImages[0] ? (
                  <img
                    src={item.itemImages[0]}
                    className="w-full h-full object-contain mix-blend-multiply"
                    alt={item.description}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300 gap-2">
                    <span className="text-[10px] uppercase tracking-widest font-sans">No Preview Available</span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-gray-900 text-white px-3 py-1 text-[10px] font-sans font-bold tracking-widest">
                  {item.copies} UNITS
                </div>
              </div>
            </div>

            {/* --- RIGHT: SPECS & FINISHES --- */}
            <div className="col-span-5 flex flex-col h-full pt-1">
              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6 leading-tight border-b border-gray-200 pb-4">
                {item.description}
              </h2>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Model Ref</span>
                  <span className="font-sans text-sm font-semibold text-gray-900">{item.model || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Item Code</span>
                  <span className="font-sans text-sm font-semibold text-gray-900">{item.barcode || 'N/A'}</span>
                </div>
                <div className="col-span-2 flex flex-col border-t border-gray-100 pt-3">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Specification / Color</span>
                  <span className="font-serif text-sm text-gray-900">{item.color || 'Standard Finish'}</span>
                </div>
                <div className="col-span-2 flex flex-col border-t border-gray-100 pt-3">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Dimensions (mm)</span>
                  <div className="flex items-center gap-4 font-sans text-sm font-bold text-gray-900">
                    {(() => {
                      const parts = item.dimensions?.split(/[xX]/).map(s => s.trim());
                      if (parts && parts.length === 3) {
                        return (
                          <>
                            <span className="bg-gray-100 px-2 py-1 rounded-sm">W: {parts[0]}</span>
                            <span className="bg-gray-100 px-2 py-1 rounded-sm">D: {parts[1]}</span>
                            <span className="bg-gray-100 px-2 py-1 rounded-sm">H: {parts[2]}</span>
                          </>
                        );
                      }
                      return <span>{item.dimensions || '---'}</span>;
                    })()}
                  </div>
                </div>
              </div>

              {/* ================= NEW FINISH & GLOSS SECTION ================= */}
              {/* هذا القسم صممته ليطابق الصورة تماماً: مستطيلين بجانب بعض */}
              <div className="mt-auto pt-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-900 mb-3 block">
                  Finish & Gloss
                </span>

                <div className="grid grid-cols-2 gap-4">

                  {/* 1. VENEER RECTANGLE (Left) */}
                  <div className="flex flex-col gap-2">
                    {/* The Box */}
                    <div className="w-full h-12 rounded border border-gray-400 overflow-hidden relative bg-gray-100 shadow-sm">
                      {item.veneer?.imageUrl ? (
                        <img src={item.veneer.imageUrl} className="w-full h-full object-cover" alt="Veneer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-gray-400 text-[9px] uppercase tracking-wider">
                          No Image
                        </div>
                      )}
                    </div>
                    {/* Label */}
                    <span className="text-[10px] font-bold font-sans text-gray-700 truncate">
                      {item.veneer?.name || 'Standard Veneer'}
                    </span>
                  </div>

                  {/* 2. GLOSS SIMULATION RECTANGLE (Right) */}
                  <div className="flex flex-col gap-2">
                    {/* The Box (Simulation) */}
                    <div className="w-full h-12 rounded border border-gray-400 overflow-hidden relative isolate bg-gray-300 shadow-sm">
                      {/* Base Metallic Layer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400"></div>

                      {/* Reflection Layer (The "Window" Light) */}
                      {/* نقوم بتدوير التدرج وعمل Blur بناء على قيمة اللمعة */}
                      <div
                        className="absolute inset-0 pointer-events-none mix-blend-overlay"
                        style={{
                          // كلما قلت اللمعة، زاد التغبيش (Blur)
                          // 100% Gloss = 0px Blur (مرآة)
                          // 0% Gloss = 5px Blur (مطفي)
                          filter: `blur(${(100 - (parseInt(item.glossiness?.toString() || '0'))) * 0.05}px)`,
                          opacity: 0.9
                        }}
                      >
                        {/* هذا التدرج يصنع شكل انعكاس الضوء المستطيل */}
                        <div className="w-[200%] h-full absolute top-0 -left-[50%] bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 opacity-80"></div>
                      </div>

                      {/* Sharper Highlight for High Gloss only (Add extra pop) */}
                      {parseInt(item.glossiness?.toString() || '0') > 70 && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-50 transform translate-x-4"></div>
                      )}

                    </div>
                    {/* Label */}
                    <span className="text-[10px] font-bold font-mono text-gray-700">
                      {item.glossiness || 0}% Gloss
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </div>


          {/* ================= FULL WIDTH NOTES SECTION ================= */}
          {item.comments && (
            <div className="flex-grow flex flex-col mt-4">
              <div className="border-t-4 border-gray-100 pt-4">
                <span className="text-[9px] font-bold uppercase text-gray-400 tracking-[0.2em] mb-2 block">
                  Technical Description / Notes
                </span>
                <div className="bg-gray-50 p-4 rounded-sm border-l-4 border-gray-900">
                  <p className="text-sm font-serif text-gray-800 leading-relaxed text-justify">
                    {item.comments}
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* ================= FOOTER ================= */}
          <footer className="border-t border-gray-200 pt-4 flex justify-between items-center mt-auto">
            <div className="text-[8px] text-gray-400 font-sans uppercase tracking-wider">
              Forest Edge Factory • Automated System Output
            </div>
            <div className="font-sans text-xs text-gray-300 font-bold">
              Page {index + 1}
            </div>
          </footer>

        </div>
      ))}

      {/* --- Styles --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,400&family=Open+Sans:wght@400;500;600;700&family=Roboto+Mono:wght@500&display=swap');
        .font-serif { font-family: 'Merriweather', serif; }
        .font-sans { font-family: 'Open Sans', sans-serif; }
        .font-mono { font-family: 'Roboto Mono', monospace; }

        @media print {
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page-break-after-always { break-after: page; page-break-after: always; height: 100vh; width: 100vw; }
        }
      `}</style>
    </div>
  );
};