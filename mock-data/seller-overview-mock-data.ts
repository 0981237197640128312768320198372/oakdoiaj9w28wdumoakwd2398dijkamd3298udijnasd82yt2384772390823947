// Mock data for seller overview components - optimized for screenshots

// 1. Sales Chart Data (SalesChart.tsx)
export const mockSalesTrend = {
  salesData: [
    { day: 'Mon', sales: 45 },
    { day: 'Tue', sales: 52 },
    { day: 'Wed', sales: 38 },
    { day: 'Thu', sales: 67 },
    { day: 'Fri', sales: 89 },
    { day: 'Sat', sales: 124 },
    { day: 'Sun', sales: 156 },
  ],
  totalSales: 571,
  trend: 23.5,
};

// 5. Metric Card Data (MetricCard.tsx)
export const mockMetrics = {
  totalRevenue: 45890,
  totalOrders: 127,
  averageRating: 4.8,
  totalProducts: 34,
  conversionRate: 12.5,
  repeatCustomers: 68,
};

// 6. Reviews Summary Data (ReviewsSummary.tsx)
export const mockRatingStats = {
  averageRating: 4.8,
  totalReviews: 89,
};

export const mockReviews = [
  {
    _id: '674a1b2c3d4e5f6789012355',
    rating: 5,
    comment:
      'สินค้าดีมากครับ คุณภาพเยี่ยม ส่งเร็วมาก แพ็คเกจสวยงาม จะกลับมาซื้ออีกแน่นอน ขอบคุณร้านค้าครับ',
    createdAt: '2024-12-18T01:00:00.000Z',
    buyerName: 'สมชาย ใจดี',
    buyerEmail: 'somchai@email.com',
  },
  {
    _id: '674a1b2c3d4e5f6789012356',
    rating: 5,
    comment: 'ประทับใจมากค่ะ สินค้าตรงตามที่โฆษณา บริการดีเยี่ยม ตอบข้อความเร็ว แนะนำเลยค่ะ',
    createdAt: '2024-12-17T22:30:00.000Z',
    buyerName: 'วิภา สุขใส',
    buyerEmail: 'wipa@email.com',
  },
  {
    _id: '674a1b2c3d4e5f6789012357',
    rating: 4,
    comment:
      'สินค้าดีครับ คุ้มค่าเงิน ส่งไวกว่าที่คิด แต่อยากให้มีตัวเลือกสีเพิ่มนะครับ โดยรวมพอใจมาก',
    createdAt: '2024-12-17T20:15:00.000Z',
    buyerName: 'ประยุทธ์ มั่นคง',
    buyerEmail: 'prayuth@email.com',
  },
  {
    _id: '674a1b2c3d4e5f6789012358',
    rating: 5,
    comment:
      'ร้านนี้เจ๋งมาก สินค้าคุณภาพดี ราคาสมเหตุสมผล บริการหลังการขายดีเยี่ยม จะแนะนำเพื่อนๆ ให้มาซื้อ',
    createdAt: '2024-12-17T19:45:00.000Z',
    buyerName: 'อนุชา รุ่งเรือง',
    buyerEmail: 'anucha@email.com',
  },
  {
    _id: '674a1b2c3d4e5f6789012359',
    rating: 5,
    comment: 'ชอบมากค่ะ สินค้าสวยงาม คุณภาพดีกว่าที่คาด แพ็คเกจน่ารัก ส่งเร็วมาก ขอบคุณร้านค้าค่ะ',
    createdAt: '2024-12-17T18:20:00.000Z',
    buyerName: 'สุภาพร ใสใจ',
    buyerEmail: 'supaporn@email.com',
  },
  {
    _id: '674a1b2c3d4e5f6789012360',
    rating: 4,
    comment:
      'สินค้าดีครับ ตรงตามคำอธิบาย ส่งไว บริการดี แต่อยากให้มีคู่มือการใช้งานภาษาไทยด้วยนะครับ',
    createdAt: '2024-12-17T17:10:00.000Z',
    buyerName: 'ธนาคาร เจริญสุข',
    buyerEmail: 'thanakarn@email.com',
  },
];

// Usage Examples:
/*
// For SalesChart component:
const salesTrend = mockSalesTrend;

// For InventoryAlerts component:
const alerts = mockInventoryAlerts;


// For MetricCard components:
const totalRevenue = mockMetrics.totalRevenue;
const totalOrders = mockMetrics.totalOrders;
const averageRating = mockMetrics.averageRating;

// For ReviewsSummary component:
const ratingStats = mockRatingStats;
const reviews = mockReviews;
const isLoading = false;
*/
