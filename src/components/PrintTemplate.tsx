import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// --- Types ---
interface Item {
  id: string | number;
  description: string;
  model?: string;
  comments?: string;
  dimensions?: string;
  veneer?: { name: string };
  glossiness?: number;
  copies: number;
  unitPrice?: number; // Added for generic invoice feel
  amount?: number;    // Added for generic invoice feel
  itemImages?: string[];
}

interface PrintTemplateProps {
  data: {
    logo?: string;
    submittalNo?: string;
    dueDate?: string;
    clientName?: string;
    projectName?: string;
    lineItems: Item[];
    // Totals fields (can be calculated or passed)
    subTotal?: number;
    tax?: number;
    total?: number;
  };
  className?: string;
}

// --- Helper: Chunk Data Logic ---
// هذا هو "العقل" الذي يقسم المنتجات إلى صفحات (4 منتجات لكل صفحة)
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

export const PrintTemplate: React.FC<PrintTemplateProps> = ({ data, className }) => {
  // نقوم بتقسيم البيانات إلى مجموعات، كل مجموعة تحتوي على 4 عناصر كحد أقصى
  const pages = useMemo(() => chunkArray(data.lineItems || [], 4), [data.lineItems]);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={`bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white ${className || ''}`}>
      
      {/* --- Loop Through Pages --- */}
      {pages.map((pageItems, pageIndex) => (
        <div
          key={pageIndex}
          className="bg-white mx-auto shadow-2xl print:shadow-none print:w-full print:h-screen flex flex-col relative page-break-after-always mb-8 print:mb-0"
          style={{ width: '210mm', minHeight: '297mm', padding: '40px' }} // A4 Fixed Logic
        >
          
          {/* ================= HEADER ================= */}
          <header className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-4">
            {/* Left: Logo Area */}
            <div className="w-1/3">
              {data.logo ? (
                <img src={data.logo} alt="Logo" className="h-20 object-contain" />
              ) : (
                <div className="flex flex-col">
                  <span className="text-3xl font-serif font-bold text-gray-900 tracking-tight">FOREST EDGE</span>
                  <span className="text-xs uppercase tracking-[0.4em] text-gray-500 mt-1">Factory & Interior</span>
                </div>
              )}
            </div>

            {/* Center: Document Title */}
            <div className="w-1/3 text-center pt-2">
              <h1 className="text-4xl font-serif font-medium text-gray-900 tracking-widest uppercase">Invoice</h1>
            </div>

            {/* Right: Meta Data */}
            <div className="w-1/3 text-right">
              <div className="inline-block text-left">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">No.</span>
                  <span className="font-mono text-lg font-bold text-gray-900">{data.submittalNo || '0000'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Date</span>
                  <span className="font-mono text-sm text-gray-600">{data.dueDate || currentDate}</span>
                </div>
              </div>
            </div>
          </header>

          {/* ================= CLIENT INFO (Compact) ================= */}
          <section className="flex justify-between items-end mb-8 text-sm">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">Bill To</p>
              <h2 className="text-xl font-serif font-bold text-gray-800">{data.clientName || 'Client Name'}</h2>
              <p className="text-gray-500 font-light">{data.projectName || 'Project Reference'}</p>
            </div>
            <div className="opacity-80">
               {/* QR Code for quick tracking */}
               <QRCodeSVG value={data.submittalNo || 'ID'} size={50} fgColor="#333" />
            </div>
          </section>

          {/* ================= TABLE HEADERS ================= */}
          <div className="grid grid-cols-12 gap-4 border-b border-gray-900 pb-2 mb-4">
            <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-gray-400">#</div>
            <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Preview</div>
            <div className="col-span-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Description</div>
            <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Specs</div>
            <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Qty</div>
            <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Total</div>
          </div>

          {/* ================= ITEMS BODY (Flex Grow to fill space) ================= */}
          <div className="flex-grow flex flex-col justify-start gap-6">
            {pageItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 items-start border-b border-gray-100 pb-6 last:border-0">
                
                {/* 1. Index (calculated based on page) */}
                <div className="col-span-1 pt-2 font-mono text-gray-300 font-bold text-xl">
                  {(pageIndex * 4 + idx + 1).toString().padStart(2, '0')}
                </div>

                {/* 2. Image */}
                <div className="col-span-2">
                  <div className="aspect-square bg-gray-50 rounded-sm border border-gray-200 overflow-hidden relative">
                    {item.itemImages && item.itemImages[0] ? (
                        <img src={item.itemImages[0]} className="w-full h-full object-cover mix-blend-multiply" alt="item" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 text-xs">No Img</div>
                    )}
                  </div>
                </div>

                {/* 3. Description */}
                <div className="col-span-4 pt-1">
                  <h3 className="font-serif text-lg font-bold text-gray-900 leading-tight mb-1">
                    {item.description}
                  </h3>
                  {item.model && <p className="text-xs font-mono text-gray-500 mb-2">REF: {item.model}</p>}
                  {item.comments && (
                    <p className="text-xs text-gray-600 italic leading-relaxed border-l-2 border-gray-300 pl-2 mt-2">
                      {item.comments}
                    </p>
                  )}
                </div>

                {/* 4. Specs */}
                <div className="col-span-3 pt-2 space-y-1">
                  {item.dimensions && (
                    <div className="flex justify-between text-xs border-b border-dashed border-gray-200 pb-1">
                      <span className="text-gray-400 font-medium">Dim</span>
                      <span className="font-mono text-gray-700">{item.dimensions}</span>
                    </div>
                  )}
                  {item.veneer && (
                    <div className="flex justify-between text-xs border-b border-dashed border-gray-200 pb-1">
                      <span className="text-gray-400 font-medium">Fin</span>
                      <span className="text-gray-700">{item.veneer.name}</span>
                    </div>
                  )}
                </div>

                {/* 5. Qty */}
                <div className="col-span-1 pt-2 text-center">
                  <span className="block font-mono font-bold text-lg bg-gray-100 rounded py-1">
                    {item.copies}
                  </span>
                </div>

                {/* 6. Amount (Optional Placeholder) */}
                <div className="col-span-1 pt-2 text-right">
                   <span className="font-mono font-medium text-gray-600 text-sm">
                     {item.amount ? `$${item.amount}` : '-'}
                   </span>
                </div>

              </div>
            ))}
          </div>

          {/* ================= FOOTER (Only shown on the LAST page generally, or per page totals) ================= */}
          <div className="mt-auto pt-4 border-t-2 border-gray-900">
             
             {/* Show Totals ONLY on the last page */}
             {pageIndex === pages.length - 1 && (
                <div className="flex justify-end mb-6">
                    <div className="w-1/2 md:w-1/3 space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal</span>
                            <span className="font-mono">{data.subTotal || '0.00'} SAR</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>VAT (15%)</span>
                            <span className="font-mono">{data.tax || '0.00'} SAR</span>
                        </div>
                        <div className="flex justify-between text-xl font-serif font-bold text-gray-900 border-t border-gray-300 pt-2 mt-2">
                            <span>Total</span>
                            <span>{data.total || '0.00'} SAR</span>
                        </div>
                    </div>
                </div>
             )}

            <div className="flex justify-between items-end text-[10px] text-gray-400 uppercase tracking-widest font-medium">
              <div>
                <p>Forest Edge Factory</p>
                <p>Riyadh, Saudi Arabia</p>
              </div>
              <div className="text-center">
                 <span className="block mb-1">Page</span>
                 <span className="font-mono text-sm text-gray-900 border border-gray-300 px-2 py-1 rounded">
                    {pageIndex + 1} / {pages.length}
                 </span>
              </div>
              <div className="text-right">
                <p>Generated by System</p>
                <p>Confidential Document</p>
              </div>
            </div>
          </div>

        </div>
      ))}
      
      {/* Styles for Printing */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break-after-always { break-after: page; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};