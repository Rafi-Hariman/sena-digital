export interface PaketUndangan {
  id: number;
  name_paket: string;
  jenis_paket: 'basic' | 'standard' | 'premium';
  price: number;
  masa_aktif: number;
  halaman_buku: string | number;
  kirim_wa: boolean;
  bebas_pilih_tema: boolean;
  kirim_hadiah: boolean;
  import_data: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaketListResponse {
  data: PaketUndangan[];
}
