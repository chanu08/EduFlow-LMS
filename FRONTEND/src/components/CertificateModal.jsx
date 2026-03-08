import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/* ─── Certificate Design ─────────────────────────────── */
const CertificateContent = React.forwardRef(({ studentName, courseTitle, completedAt }, ref) => (
    <div
        ref={ref}
        id="certificate-content"
        className="relative bg-white"
        style={{ width: '794px', minHeight: '562px', fontFamily: 'Georgia, serif', padding: '0' }}
    >
        {/* Outer decorative border */}
        <div
            style={{
                position: 'absolute', inset: '16px',
                border: '3px solid #1e3a5f',
                boxShadow: 'inset 0 0 0 6px #f0c040',
                pointerEvents: 'none',
                zIndex: 10,
            }}
        />
        {/* Inner content */}
        <div style={{ padding: '56px 72px', textAlign: 'center', position: 'relative', zIndex: 20 }}>
            {/* Header strip */}
            <div style={{
                background: 'linear-gradient(90deg, #1e3a5f, #2563eb, #1e3a5f)',
                color: '#f0c040', fontFamily: 'Georgia, serif',
                letterSpacing: '0.25em', fontSize: '11px', fontWeight: 'bold',
                padding: '10px 0', marginBottom: '28px',
            }}>
                CERTIFICATE OF COMPLETION
            </div>

            {/* EduFlow logo text */}
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f', letterSpacing: '0.15em', marginBottom: '4px' }}>
                EduFlow
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.2em', marginBottom: '32px' }}>
                ONLINE LEARNING PLATFORM
            </div>

            {/* Certifies that */}
            <div style={{ fontSize: '15px', color: '#4b5563', marginBottom: '10px', fontStyle: 'italic' }}>
                This is to certify that
            </div>

            {/* Student name with decorative underline */}
            <div style={{
                fontSize: '40px', color: '#1e3a5f', fontWeight: 'bold',
                borderBottom: '2px solid #f0c040', paddingBottom: '8px',
                display: 'inline-block', marginBottom: '16px',
                minWidth: '340px',
            }}>
                {studentName}
            </div>

            <div style={{ fontSize: '15px', color: '#4b5563', marginBottom: '10px', fontStyle: 'italic' }}>
                has successfully completed the course
            </div>

            {/* Course title */}
            <div style={{
                fontSize: '24px', fontWeight: 'bold', color: '#2563eb',
                marginBottom: '8px', padding: '0 40px',
            }}>
                "{courseTitle}"
            </div>

            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '40px' }}>
                Completed on: <span style={{ color: '#374151', fontWeight: 'bold' }}>{completedAt}</span>
            </div>

            {/* Divider with stars */}
            <div style={{ color: '#f0c040', fontSize: '18px', marginBottom: '32px', letterSpacing: '1em' }}>
                ★ ★ ★
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
                {[
                    { label: 'Course Instructor', name: 'Dr. E. Flow' },
                    { label: 'Platform Director', name: 'EduFlow Academy' },
                ].map(({ label, name }) => (
                    <div key={label} style={{ textAlign: 'center', minWidth: '160px' }}>
                        <div style={{
                            fontSize: '22px', fontFamily: "'Segoe Script', cursive, serif",
                            color: '#1e3a5f', borderBottom: '1px solid #d1d5db',
                            paddingBottom: '4px', marginBottom: '6px',
                        }}>
                            {name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.1em' }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Seal */}
            <div style={{
                position: 'absolute', bottom: '60px', right: '80px',
                width: '80px', height: '80px', borderRadius: '50%',
                border: '4px solid #1e3a5f',
                background: 'radial-gradient(circle, #dbeafe, #bfdbfe)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
                <div style={{ fontSize: '18px' }}>🎓</div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#1e3a5f', letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.2 }}>
                    CERTIFIED
                </div>
            </div>
        </div>
    </div>
));

CertificateContent.displayName = 'CertificateContent';

/* ─── Main Modal ─────────────────────────────────────── */
const CertificateModal = ({ certData, onClose }) => {
    const certRef = useRef(null);

    const handleDownload = async () => {
        const element = certRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [794, 562] });
        pdf.addImage(imgData, 'PNG', 0, 0, 794, 562);
        pdf.save(`EduFlow_Certificate_${certData.courseTitle.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn" onClick={onClose}>
            {/* Floating ✕ on overlay */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-xl font-bold transition"
                aria-label="Close"
            >
                ✕
            </button>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col"
                style={{ maxHeight: '95vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">🎓 Your Certificate</h2>
                        <p className="text-xs text-gray-400">Preview below — click Download to save as PDF</p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition">
                        ✕
                    </button>
                </div>

                {/* Certificate preview — scrollable, header+footer stay fixed */}
                <div className="overflow-auto p-6 flex justify-center bg-gray-50 flex-1">
                    <div className="shadow-lg" style={{ width: '794px', flexShrink: 0 }}>
                        <CertificateContent
                            ref={certRef}
                            studentName={certData.studentName}
                            courseTitle={certData.courseTitle}
                            completedAt={certData.completedAt}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                        Close
                    </button>
                    <button onClick={handleDownload}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold shadow transition flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CertificateModal;
