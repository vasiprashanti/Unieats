export function calculatePlatformFee(orderValue) {
  const slabs = [
    { min: 0, max: 100, cap: 5 },
    { min: 100, max: 300, cap: 10 },
    { min: 300, max: 600, cap: 20 },
    { min: 600, max: 1000, cap: 30 },
    { min: 1000, max: 1500, cap: 45 },
    { min: 1500, max: 2500, cap: 60 },
    { min: 2500, max: 4000, cap: 100 },
    { min: 4000, max: Infinity, cap: 150 },
  ];

  const currentSlab = slabs.find(
    (s) => orderValue > s.min && orderValue <= s.max
  );

  if (!currentSlab) {
    return 0;
  }

  const platformFee = Math.min(orderValue * 0.05, currentSlab.cap);

  return Math.round(platformFee * 100) / 100;
}

export function calculateOrderFees(
  orderValue,
  paymentMethod,
  isCommissionActive = false
) {
  const platformFee = calculatePlatformFee(orderValue);
  const vendorCommission = isCommissionActive
    ? Math.round(orderValue * 0.05 * 100) / 100
    : 0;
  const totalUserPays = Math.round((orderValue + platformFee) * 100) / 100;
  const isOnlinePayment = paymentMethod === "RAZORPAY";

  if (!isOnlinePayment) {
    const vendorReceives = totalUserPays;
    const vendorOwes = platformFee + vendorCommission;
    const netRevenue = vendorReceives - vendorOwes;

    return {
      orderValue: Math.round(orderValue * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      vendorCommission: Math.round(vendorCommission * 100) / 100,
      totalUserPays: Math.round(totalUserPays * 100) / 100,
      vendorReceives: Math.round(vendorReceives * 100) / 100,
      vendorOwes: Math.round(vendorOwes * 100) / 100,
      netRevenue: Math.round(netRevenue * 100) / 100,
    };
  }

  const unieatsReceives = totalUserPays;
  const unieatsGross = platformFee + vendorCommission;
  const vendorPayout = unieatsReceives - unieatsGross;

  return {
    orderValue: Math.round(orderValue * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    vendorCommission: Math.round(vendorCommission * 100) / 100,
    totalUserPays: Math.round(totalUserPays * 100) / 100,
    unieatsReceives: Math.round(unieatsReceives * 100) / 100,
    unieatsGross: Math.round(unieatsGross * 100) / 100,
    vendorPayout: Math.round(vendorPayout * 100) / 100,
  };
}
