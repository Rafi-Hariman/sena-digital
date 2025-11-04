import { Invitation } from './invitation.model';

export interface User {
  id: number;
  name?: string;
  email: string;
  phone?: string;
  kode_pemesanan?: string;
  created_at: string;
  updated_at?: string;
  invitation?: Invitation;
}

export interface UserProfileResponse {
  data: User;
}
