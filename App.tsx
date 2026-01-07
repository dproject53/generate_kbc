
import React, { useState, useRef } from 'react';
import { ModuleInputs, AppStatus } from './types';
import { generateModule } from './geminiService';
import ReactMarkdown from 'react-markdown';

const PANCA_CINTA_OPTIONS = [
  "Cinta kepada Allah & Rasul-Nya",
  "Cinta kepada Diri Sendiri",
  "Cinta kepada Sesama Manusia",
  "Cinta kepada Alam Sekitar",
  "Cinta kepada Bangsa & Negara"
];

const DIMENSI_LULUSAN_OPTIONS = [
  "Keimanan & Ketakwaan",
  "Kewargaan",
  "Penalaran Kritis",
  "Kreativitas",
  "Kolaborasi",
  "Kemandirian",
  "Kesehatan",
  "Komunikasi"
];

const MODEL_PEMBELAJARAN_OPTIONS = [
  "Problem Based Learning (PBL)",
  "Project Based Learning (PjBL)",
  "Discovery Learning",
  "Inquiry Learning",
  "TPACK (Technological Pedagogical and Content Knowledge)",
  "DBL (Differentiation Based Learning)",
  "Contextual Teaching and Learning (CTL)",
  "Cooperative Learning",
  "Flipped Classroom",
  "Ceramah Plus (Diskusi & Tanya Jawab)"
];

const App: React.FC = () => {
  const moduleRef = useRef<HTMLDivElement>(null);
  const [inputs, setInputs] = useState<ModuleInputs>({
    mataPelajaran: '',
    jenjang: 'Fase C / Kelas 5',
    materiPokok: '',
    alokasiWaktu: '2 x 35 Menit',
    topikPancaCinta: [],
    modelPembelajaran: 'Problem Based Learning (PBL)',
    namaGuru: '',
    namaMadrasah: '',
    tahun: '2024/2025',
    kota: '',
    namaKepala: '',
    capaianPembelajaran: '',
    tujuanPembelajaran: '',
    dimensiLulusan: []
  });

  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copying, setCopying] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: 'topikPancaCinta' | 'dimensiLulusan', value: string) => {
    setInputs(prev => {
      const currentValues = prev[name] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [name]: newValues };
    });
  };

  const handleGenerate = async () => {
    const requiredFields: (keyof ModuleInputs)[] = ['namaGuru', 'mataPelajaran', 'namaMadrasah', 'materiPokok', 'namaKepala', 'kota', 'alokasiWaktu', 'capaianPembelajaran', 'tujuanPembelajaran'];
    const missingFields = requiredFields.filter(f => !inputs[f]);
    
    if (missingFields.length > 0) {
      alert("Mohon lengkapi semua field teks yang wajib diisi (bertanda *).");
      return;
    }

    if (inputs.topikPancaCinta.length === 0) {
      alert("Mohon pilih minimal satu Topik Panca Cinta.");
      return;
    }

    if (inputs.dimensiLulusan.length === 0) {
      alert("Mohon pilih minimal satu Dimensi Lulusan.");
      return;
    }

    setStatus(AppStatus.GENERATING);
    setErrorMessage('');
    
    try {
      const result = await generateModule(inputs);
      setGeneratedContent(result);
      setStatus(AppStatus.FINISHED);
    } catch (err) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorMessage('Terjadi kesalahan saat menghubungi server AI. Pastikan koneksi internet stabil.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    if (moduleRef.current) {
      const contentHtml = moduleRef.current.innerHTML;
      const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Modul Ajar KBC</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 1in; }
          h1 { text-align: center; font-size: 16pt; margin-bottom: 20pt; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 10pt; }
          h2 { font-size: 14pt; margin-top: 20pt; border-left: 5px solid #059669; padding-left: 10pt; background: #f0fdf4; }
          h3 { font-size: 12pt; margin-top: 15pt; border-bottom: 1px solid #e2e8f0; }
          table { border-collapse: collapse; width: 100%; margin: 15pt 0; }
          th, td { border: 1px solid #cbd5e1; padding: 8pt; vertical-align: top; }
          th { background-color: #f1f5f9; font-weight: bold; }
          p { margin-bottom: 10pt; line-height: 1.5; text-align: justify; }
        </style>
        </head><body>
      `;
      const footer = "</body></html>";
      const sourceHTML = header + contentHtml + footer;
      const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Modul_KBC_${inputs.materiPokok.replace(/\s+/g, '_')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadPDF = () => {
    // @ts-ignore
    if (moduleRef.current && window.html2pdf) {
      const element = moduleRef.current;
      const opt = {
        margin:       10, // mm
        filename:     `Modul_KBC_${inputs.materiPokok.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save();
    } else {
      alert("Fitur PDF belum siap atau terjadi kesalahan. Silakan refresh halaman.");
    }
  };

  const handleCopyAndOpen = async () => {
    if (moduleRef.current) {
      setCopying(true);
      try {
        const contentHtml = moduleRef.current.innerHTML;
        const styledHtml = `<div style="font-family: 'Times New Roman', serif; line-height: 1.5;">${contentHtml}</div>`;
        const type = "text/html";
        const blob = new Blob([styledHtml], { type });
        const data = [new ClipboardItem({ [type]: blob })];
        await navigator.clipboard.write(data);
        alert("Modul telah disalin! Membuka Google Dokumen...");
        window.open('https://docs.new', '_blank');
      } catch (err) {
        await navigator.clipboard.writeText(generatedContent);
        alert("Modul disalin sebagai teks biasa. Membuka Google Dokumen...");
        window.open('https://docs.new', '_blank');
      } finally {
        setCopying(false);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <aside className="w-full lg:w-96 bg-white border-r border-slate-200 p-6 no-print overflow-y-auto max-h-screen">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-emerald-100">
            <i className="fas fa-heart text-xl"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">KBC Generator</h1>
        </div>

        <div className="space-y-8 pb-10">
          <section>
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fas fa-id-card"></i> Identitas Dasar
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Nama Guru <span className="text-red-500">*</span></label>
                <input name="namaGuru" value={inputs.namaGuru} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm shadow-sm" placeholder="Ahmad Fauzi, S.Pd.I" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Mata Pelajaran <span className="text-red-500">*</span></label>
                <input name="mataPelajaran" value={inputs.mataPelajaran} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm shadow-sm" placeholder="Akidah Akhlak" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Madrasah <span className="text-red-500">*</span></label>
                <input name="namaMadrasah" value={inputs.namaMadrasah} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm shadow-sm" placeholder="MI Al-Ikhlas" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fas fa-book"></i> Kurikulum & Capaian
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Capaian Pembelajaran (CP) <span className="text-red-500">*</span></label>
                <textarea name="capaianPembelajaran" value={inputs.capaianPembelajaran} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-emerald-500 outline-none text-sm shadow-sm" placeholder="Paste Capaian Pembelajaran di sini..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Tujuan Pembelajaran (TP) <span className="text-red-500">*</span></label>
                <textarea name="tujuanPembelajaran" value={inputs.tujuanPembelajaran} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-emerald-500 outline-none text-sm shadow-sm" placeholder="Paste Tujuan Pembelajaran di sini..." />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fas fa-layer-group"></i> Materi & Model
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Jenjang/Fase</label>
                <select name="jenjang" value={inputs.jenjang} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm">
                  <option>Fase A / Kelas 1</option><option>Fase A / Kelas 2</option>
                  <option>Fase B / Kelas 3</option><option>Fase B / Kelas 4</option>
                  <option>Fase C / Kelas 5</option><option>Fase C / Kelas 6</option>
                  <option>Fase D / Kelas 7</option><option>Fase D / Kelas 8</option><option>Fase D / Kelas 9</option>
                  <option>Fase E / Kelas 10</option><option>Fase F / Kelas 11</option><option>Fase F / Kelas 12</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Materi Pokok <span className="text-red-500">*</span></label>
                <input name="materiPokok" value={inputs.materiPokok} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm shadow-sm" placeholder="Adab Bertamu" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Model Pembelajaran <span className="text-red-500">*</span></label>
                <select name="modelPembelajaran" value={inputs.modelPembelajaran} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm">
                  {MODEL_PEMBELAJARAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Alokasi Waktu <span className="text-red-500">*</span></label>
                <input name="alokasiWaktu" value={inputs.alokasiWaktu} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm shadow-sm" placeholder="2 x 35 Menit" />
              </div>
            </div>
          </section>

          {/* Bagian Panca Cinta - Memperbaiki Visibilitas */}
          <section className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 shadow-inner">
            <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fas fa-heart"></i> Panca Cinta <span className="text-red-500">*</span>
            </h2>
            <div className="space-y-2">
              {PANCA_CINTA_OPTIONS.map(opt => (
                <label key={opt} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-emerald-200">
                  <input 
                    type="checkbox" 
                    checked={inputs.topikPancaCinta.includes(opt)} 
                    onChange={() => handleCheckboxChange('topikPancaCinta', opt)} 
                    className="w-4 h-4 rounded border-slate-400 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer" 
                  />
                  <span className={`text-sm font-medium transition-colors ${inputs.topikPancaCinta.includes(opt) ? 'text-emerald-900' : 'text-slate-600'}`}>{opt}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Bagian Dimensi Lulusan - Memperbaiki Visibilitas */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fas fa-users"></i> Dimensi Lulusan <span className="text-red-500">*</span>
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {DIMENSI_LULUSAN_OPTIONS.map(opt => (
                <label key={opt} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-300">
                  <input 
                    type="checkbox" 
                    checked={inputs.dimensiLulusan.includes(opt)} 
                    onChange={() => handleCheckboxChange('dimensiLulusan', opt)} 
                    className="w-4 h-4 rounded border-slate-400 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer" 
                  />
                  <span className={`text-xs font-medium transition-colors ${inputs.dimensiLulusan.includes(opt) ? 'text-slate-900' : 'text-slate-600'}`}>{opt}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fas fa-signature"></i> Administrasi
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Kepala Madrasah <span className="text-red-500">*</span></label>
                <input name="namaKepala" value={inputs.namaKepala} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm shadow-sm" placeholder="Drs. H. Mulyadi" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Kota <span className="text-red-500">*</span></label>
                  <input name="kota" value={inputs.kota} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm shadow-sm" placeholder="Bandung" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Tahun</label>
                  <input name="tahun" value={inputs.tahun} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm shadow-sm" />
                </div>
              </div>
            </div>
          </section>

          <button 
            onClick={handleGenerate}
            disabled={status === AppStatus.GENERATING}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${status === AppStatus.GENERATING ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
          >
            {status === AppStatus.GENERATING ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner animate-spin"></i> Menyusun Modul...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 uppercase text-sm tracking-widest">
                <i className="fas fa-magic"></i> Generate Modul KBC
              </span>
            )}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-10 overflow-y-auto bg-slate-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {status === AppStatus.IDLE && (
            <div className="bg-white rounded-3xl shadow-xl p-16 text-center border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-emerald-100 pointer-events-none">
                <i className="fas fa-leaf text-9xl"></i>
              </div>
              <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 border-2 border-emerald-100 shadow-inner">
                <i className="fas fa-file-signature text-4xl"></i>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Modul Ajar Digital KBC</h2>
              <p className="text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">
                Solusi cerdas penyusun modul ajar Madrasah berbasis Kurikulum Berbasis Cinta (KBC). 
                Integrasi mendalam antara TPACK, Pembelajaran Berdiferensiasi (DBL), 
                dan Nilai-Nilai Cinta untuk menciptakan ekosistem belajar yang Mindful, Meaningful, dan Joyful.
              </p>
            </div>
          )}

          {status === AppStatus.FINISHED && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-lg sticky top-4 z-20 border border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Pratinjau Modul</h2>
                  <p className="text-xs text-slate-500 font-medium">Modul siap dicetak atau dipindahkan ke GDocs/Word.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleCopyAndOpen} disabled={copying} className="px-4 py-2.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 flex items-center gap-2 transition-all font-bold text-xs shadow-sm">
                    <i className={copying ? "fas fa-spinner animate-spin" : "fas fa-copy"}></i> Salin ke GDocs
                  </button>
                  <button onClick={handleDownloadWord} className="px-4 py-2.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 flex items-center gap-2 transition-all font-bold text-xs shadow-sm">
                    <i className="fas fa-file-word"></i> Unduh Word
                  </button>
                  <button onClick={handleDownloadPDF} className="px-4 py-2.5 text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 flex items-center gap-2 transition-all font-bold text-xs shadow-sm">
                    <i className="fas fa-file-pdf"></i> Unduh PDF
                  </button>
                  <button onClick={handlePrint} className="px-4 py-2.5 text-white bg-slate-800 rounded-xl hover:bg-slate-900 flex items-center gap-2 transition-all font-bold text-xs shadow-sm">
                    <i className="fas fa-print"></i> Cetak
                  </button>
                  <button onClick={() => setStatus(AppStatus.IDLE)} className="px-4 py-2.5 text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs">
                    <i className="fas fa-arrow-left mr-1"></i> Kembali
                  </button>
                </div>
              </div>

              <div ref={moduleRef} className="module-paper bg-white shadow-2xl p-10 md:p-20 border border-slate-200 prose prose-emerald max-w-none rounded-xl">
                <ReactMarkdown components={{
                  h1: ({node, ...props}) => <h1 className="text-center text-3xl font-black border-b-4 border-double border-emerald-900 pb-8 mb-16 uppercase tracking-tight text-emerald-950" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold border-l-8 border-emerald-600 pl-5 mt-16 mb-8 text-emerald-900 bg-emerald-50/70 py-3 rounded-r-lg" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-10 mb-5 text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wide" {...props} />,
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-10 shadow-sm rounded-lg">
                      <table className="min-w-full border-collapse border-2 border-slate-300 text-sm" {...props} />
                    </div>
                  ),
                  th: ({node, ...props}) => <th className="border-2 border-slate-300 bg-emerald-100 p-4 text-left font-black text-emerald-900" {...props} />,
                  td: ({node, ...props}) => <td className="border-2 border-slate-300 p-4 text-slate-800 align-top leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc ml-10 space-y-3 my-8 text-slate-700" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal ml-10 space-y-3 my-8 text-slate-700" {...props} />,
                  p: ({node, ...props}) => <p className="leading-loose text-slate-800 mb-6 text-justify" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-emerald-300 bg-emerald-50/30 p-5 rounded-r-lg italic my-8 text-emerald-800 font-medium" {...props} />
                }}>
                  {generatedContent}
                </ReactMarkdown>

                <div className="mt-32 pt-12 border-t-2 border-slate-100 flex flex-col md:flex-row justify-between gap-16 text-slate-900">
                  <div className="text-center md:text-left min-w-[280px]">
                    <p className="mb-28 font-medium">Mengetahui,<br/><span className="text-sm text-slate-500 uppercase font-bold tracking-tighter">Kepala Madrasah</span></p>
                    <p className="font-bold underline uppercase decoration-2 underline-offset-4">{inputs.namaKepala || '................................'}</p>
                    <p className="text-xs text-slate-400 mt-1 italic">NIP/NIDN. ................................</p>
                  </div>
                  <div className="text-center md:text-left min-w-[280px]">
                    <p className="mb-28 font-medium">{inputs.kota || '................'}, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}<br/><span className="text-sm text-slate-500 uppercase font-bold tracking-tighter">Pendidik Mata Pelajaran</span></p>
                    <p className="font-bold underline uppercase decoration-2 underline-offset-4">{inputs.namaGuru || '................................'}</p>
                    <p className="text-xs text-slate-400 mt-1 italic">NIP. ................................</p>
                  </div>
                </div>
              </div>
              <p className="text-center text-slate-400 text-xs py-10 tracking-widest uppercase font-bold no-print">Kurikulum Berbasis Cinta &copy; 2024</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
