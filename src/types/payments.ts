export type PaymentPlanType = "lifetime_premium" | "lesson_unlock";

export type PaymentCurrency = "GHS" | "USD";

export type PaymentStatus = "pending" | "success" | "failed" | "abandoned";

export interface PaymentRecord {
  id: string;
  user_id: string;
  lesson_id: string | null;
  amount: number;
  currency: PaymentCurrency;
  paystack_reference: string;
  status: PaymentStatus;
  created_at: string;
}

export interface PaymentPriceConfig {
  planType: PaymentPlanType;
  amount: number; // In standard units, e.g. 0.50 or 20.00
  amountInSmallestUnit: number; // In pesewas / cents, e.g. 50 or 2000
  currency: PaymentCurrency;
  displayPrice: string;
  title: string;
  description: string;
}

export interface PaymentInitParams {
  userId: string;
  userEmail: string;
  planType: PaymentPlanType;
  lessonId?: string;
  lessonTitle?: string;
  callbackUrl?: string;
}

export interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackWebhookMetadata {
  user_id: string;
  plan_type: PaymentPlanType;
  lesson_id?: string;
  lesson_title?: string;
  custom_fields?: Array<{
    display_name: string;
    variable_name: string;
    value: string;
  }>;
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: PaymentCurrency;
    ip_address: string;
    metadata: PaystackWebhookMetadata;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
  };
}

