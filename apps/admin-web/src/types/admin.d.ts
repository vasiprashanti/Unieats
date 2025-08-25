export interface AdminSettings {
  paymentGateway: { razorpay: boolean; stripe: boolean; paypal: boolean };
  notifications: { email: boolean; sms: boolean; push: boolean };
  features: { chatSupport: boolean; reviews: boolean; scheduledOrders: boolean };
  commission: { vendor: number | string; deliveryFee: number | string; platformFee: number | string };
  system: { timezone: string; currency: string; orderTimeout: number | string; maxDeliveryKm: number | string };
  secrets: { razorpayKeyId: string; razorpayKeySecret: string };
}