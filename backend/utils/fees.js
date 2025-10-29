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
