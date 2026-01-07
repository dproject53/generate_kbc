
import { GoogleGenAI } from "@google/genai";
import { ModuleInputs } from "./types";

export const generateModule = async (inputs: ModuleInputs): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
Anda adalah Guru Madrasah Senior dan Pengembang Modul Ajar Kemenag yang ahli dalam Kurikulum Berbasis Cinta (KBC).
Tugas Anda: Buat MODUL AJAR LENGKAP dengan format naratif dan sistematika KBC resmi yang siap cetak.

Gunakan data berikut:
- Mata Pelajaran: ${inputs.mataPelajaran}
- Jenjang/Fase & Kelas: ${inputs.jenjang}
- Materi Pokok: ${inputs.materiPokok}
- Alokasi Waktu: ${inputs.alokasiWaktu}
- Capaian Pembelajaran (CP): ${inputs.capaianPembelajaran}
- Tujuan Pembelajaran (TP): ${inputs.tujuanPembelajaran}
- Topik Panca Cinta (Multi): ${inputs.topikPancaCinta.join(", ")}
- Dimensi Lulusan (Multi): ${inputs.dimensiLulusan.join(", ")}
- Model Pembelajaran: ${inputs.modelPembelajaran}
- Nama Guru: ${inputs.namaGuru}
- Madrasah: ${inputs.namaMadrasah}
- Tahun: ${inputs.tahun}
- Kota/Kab: ${inputs.kota}
- Kepala Madrasah: ${inputs.namaKepala}

FORMAT WAJIB & SISTEMATIKA:
1. MODUL AJAR [NAMA MAPEL] - INTEGRASI KURIKULUM BERBASIS CINTA
2. INFORMASI UMUM (Identitas, Kompetensi Awal, Tema KBC, Topik Panca Cinta, Profil Pelajar Pancasila [naratif per dimensi lulusan], Profil Pelajar Rahmatan lil Alamin, Sarana & Media, Target Peserta Didik).
3. KOMPETENSI INTI (Capaian Pembelajaran, Tujuan Pembelajaran, KKTP, Pemahaman Bermakna & Berdampak, Pertanyaan Pemantik).
4. KEGIATAN PEMBELAJARAN (WAJIB DIBUAT SANGAT SISTEMATIS DAN RAPI):
   - **A. Kegiatan Pendahuluan (±10 menit):**
     Sajikan dalam poin-poin terurut (1, 2, 3...) yang mencakup Salam, Doa, Motivasi Cinta, Nasionalisme, Apersepsi kontekstual, dan Penyampaian tujuan.
   
   - **B. Kegiatan Inti (±60 menit): WAJIB DALAM BENTUK TABEL.**
     Buatlah tabel dengan 3 kolom yang JELAS dan TERPISAH:
     | Sintaks Model | Kegiatan Guru | Kegiatan Siswa |
     | :--- | :--- | :--- |
     | (Tahap 1 Model ${inputs.modelPembelajaran}) | (Deskripsi aktivitas guru) | (Deskripsi aktivitas siswa) |
     
     **Aturan Tabel:**
     1. **Sintaks Model**: Harus mencantumkan fase-fase spesifik dari model **${inputs.modelPembelajaran}** (misal: Orientasi, Organisasi, Penyelidikan, dll).
     2. **Kegiatan Guru**: Jelaskan apa yang dilakukan guru untuk memfasilitasi setiap fase.
     3. **Kegiatan Siswa**: Jelaskan respons dan aktivitas aktif siswa.
     4. Integrasikan penanda **Deep Learning** secara halus (contoh: [Mindful Learning], [Meaningful Learning], [Joyful Learning]) di kolom kegiatan.
     5. Sertakan elemen **4C** (Critical Thinking, Collaboration, Communication, Creativity).
   
   - **C. Kegiatan Penutup (±10 menit):**
     Sajikan dalam poin-poin terurut yang mencakup Refleksi bersama, Apresiasi terhadap proses, Penguatan nilai-nilai cinta sesuai materi, dan Doa penutup.

5. ASESMEN (Diagnostik, Formatif [dengan indikator sikap & cinta], Sumatif).
6. PENGAYAAN & REMEDIAL (Sajikan secara naratif yang suportif dan penuh kasih).
7. GLOSARIUM (Min 3-5 istilah penting dari materi).
8. DAFTAR PUSTAKA (Format Kemenag resmi: Al-Qur'an, Buku Guru/Siswa, Website).
9. TANDA TANGAN (Lengkap dengan tempat, tanggal, dan nama terang penyusun serta kepala madrasah).

Gunakan bahasa yang santun, religius, penuh rasa cinta (KBC), dan profesional. Pastikan tabel Kegiatan Inti benar-benar terpisah kolomnya (Sintaks, Guru, Siswa).
Tampilkan dalam format Markdown yang elegan.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    },
  });

  return response.text || "Gagal menghasilkan modul. Silakan coba lagi.";
};
