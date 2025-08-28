export const mockAdminSettings = {
  paymentGateway: { razorpay: true, stripe: false, paypal: false },
  notifications: { email: true, sms: true, push: true },
  features: { chatSupport: true, reviews: true, scheduledOrders: false },
  commission: { vendor: 15, deliveryFee: 5, platformFee: 2 },
  system: { timezone: 'UTC', currency: 'USD ($)', orderTimeout: 30, maxDeliveryKm: 10 },
  secrets: { razorpayKeyId: '', razorpayKeySecret: '' },
};

// Demo analytics used by the Admin Analytics page
export const mockAdminAnalytics = {
  totalRevenue: 125000,
  revenueGrowth: 15.5,
  totalOrders: 1250,
  orderGrowth: 12.3,
  activeVendors: 45,
  activeUsers: 2340,
  averageOrderValue: 32.45,
  avgDeliveryTimeMin: 28,
  customerSatisfaction: 4.6,
  platformHealth: {
    orderSuccessRate: 94,
    appUptime: 99.9,
    customerRetention: 68,
    apiResponseTimeMs: 120,
    paymentSuccessRate: 97,
    errorRate: 0.1,
  },
  dailyRevenue: [
    { date: '2024-01-14', revenue: 8800, orders: 88 },
    { date: '2024-01-15', revenue: 9200, orders: 93 },
    { date: '2024-01-16', revenue: 7800, orders: 76 },
    { date: '2024-01-17', revenue: 10400, orders: 102 },
    { date: '2024-01-18', revenue: 11200, orders: 110 },
    { date: '2024-01-19', revenue: 8600, orders: 92 },
    { date: '2024-01-20', revenue: 12100, orders: 120 },
  ],
  topVendors: [
    { name: 'Sushi Zen', orders: 380, revenue: 89000 },
    { name: 'Burger Barn', orders: 450, revenue: 67000 },
    { name: 'Pizza Palace', orders: 320, revenue: 45000 },
  ],
  ordersByStatus: [
    { name: 'Delivered', value: 68 },
    { name: 'Preparing', value: 14 },
    { name: 'Ready', value: 10 },
    { name: 'Placed', value: 8 },
  ],
  vendorMetrics: {
    active: { current: 45, total: 50 },
    approvalRate: 76,
    avgRating: 4.7,
  },
};