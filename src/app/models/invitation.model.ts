import { PaketUndangan } from './package.model';

export interface Invitation {
  id: number;
  user_id: number;
  paket_undangan_id: number;
  status: string;
  order_id: string | null;
  midtrans_transaction_id: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  domain_expires_at: string | null;
  payment_confirmed_at: string | null;
  package_price_snapshot: string;
  package_duration_snapshot: number;
  package_features_snapshot?: any;
  created_at: string;
  updated_at: string;
  paket_undangan?: PaketUndangan;
}
