export interface ExtractedField {
  label: string;
  value: string;
}

export interface SavedDocument {
  id: string;
  timestamp: string;
  type: string;
  fields: ExtractedField[];
}

export interface WargaAnggota {
  nama: string;
  nik: string;
  tempat_lahir: string;
  tgl: string;
  jk: string;
  hubungan: string;
  agama: string;
  pendidikan: string;
  pekerjaan: string;
  bansos: string;
}

export interface KartuKeluarga {
  no_kk: string;
  alamat: string;
  rt_rw: string;
  Desa: string;
  Kecamatan: string;
  Kabupaten: string;
  Provinsi: string;
  anggota: WargaAnggota[];
}

