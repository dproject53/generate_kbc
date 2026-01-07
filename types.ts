
export interface ModuleInputs {
  mataPelajaran: string;
  jenjang: string;
  materiPokok: string;
  alokasiWaktu: string;
  topikPancaCinta: string[]; // Changed to array for multi-select
  modelPembelajaran: string;
  namaGuru: string;
  namaMadrasah: string;
  tahun: string;
  kota: string;
  namaKepala: string;
  capaianPembelajaran: string; // New
  tujuanPembelajaran: string; // New
  dimensiLulusan: string[]; // New
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}
