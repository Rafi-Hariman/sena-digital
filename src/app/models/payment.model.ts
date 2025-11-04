export interface CustomerDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface ItemDetail {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CreateSnapTokenRequest {
  invitation_id: number;
  amount: number;
  customer_details?: CustomerDetails;
  item_details?: ItemDetail[];
}

export interface SnapTokenResponse {
  success: boolean;
  data: {
    snap_token: string;
    order_id: string;
    gross_amount: number;
    invitation_id: number;
    expires_at: string;
  };
  message: string;
}

export interface SnapPaymentResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
}

export interface ValidationError {
  message: string;
  errors: {
    [key: string]: string[];
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: {
    [key: string]: string[];
  };
}
