export const MOCK_STATS = {
  totalOrders: 1248, totalOrdersChange: 18.7,
  totalSales: 2485230, totalSalesChange: 22.5,
  totalProducts: 862, totalProductsChange: 8.7,
  totalCustomers: 3652, totalCustomersChange: 16.7,
  totalStores: 4
}

export const MOCK_SALES_CHART = [
  { date: '17 May', sales: 85000 },
  { date: '18 May', sales: 92000 },
  { date: '19 May', sales: 110000 },
  { date: '20 May', sales: 98000 },
  { date: '21 May', sales: 145000 },
  { date: '22 May', sales: 132000 },
  { date: '23 May', sales: 178000 },
  { date: '24 May', sales: 195000 },
]

export const MOCK_ORDER_OVERVIEW = [
  { name: 'Completed', value: 860, color: '#22C55E' },
  { name: 'Processing', value: 210, color: '#06B6D4' },
  { name: 'Shipped', value: 120, color: '#F97316' },
  { name: 'Cancelled', value: 58, color: '#EF4444' },
]

export const MOCK_SALES_BY_STORE = [
  { store: 'Ameerpet', sales: 925650 },
  { store: 'KPHB', sales: 715230 },
  { store: 'Dilsukhnagar', sales: 545120 },
  { store: 'Guntur', sales: 399230 },
]

export const MOCK_ORDERS = [
  { id: '#ORD1254', customer: 'Rahul Kumar', store: 'Ameerpet', amount: 32999, status: 'DELIVERED', date: '2025-05-24', items: 2, type: 'Delivery' },
  { id: '#ORD1253', customer: 'Anil Reddy', store: 'KPHB', amount: 28999, status: 'PROCESSING', date: '2025-05-24', items: 1, type: 'Pickup' },
  { id: '#ORD1252', customer: 'Sneha Reddy', store: 'Dilsukhnagar', amount: 30999, status: 'SHIPPED', date: '2025-05-23', items: 1, type: 'Delivery' },
  { id: '#ORD1251', customer: 'Karthik Kumar', store: 'Guntur', amount: 26999, status: 'DELIVERED', date: '2025-05-23', items: 1, type: 'Delivery' },
  { id: '#ORD1250', customer: 'Pooja Sharma', store: 'Ameerpet', amount: 49999, status: 'PROCESSING', date: '2025-05-22', items: 3, type: 'Pickup' },
  { id: '#ORD1249', customer: 'Vikram Singh', store: 'KPHB', amount: 35999, status: 'SHIPPED', date: '2025-05-22', items: 1, type: 'Delivery' },
  { id: '#ORD1248', customer: 'Priya Menon', store: 'Dilsukhnagar', amount: 22999, status: 'CANCELLED', date: '2025-05-21', items: 1, type: 'Delivery' },
]

export const MOCK_LOW_STOCK = [
  { product: 'Lenovo ThinkPad T480', store: 'Ameerpet', stock: 3, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=60' },
  { product: 'HP EliteBook 840 G5', store: 'KPHB', stock: 5, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=60' },
  { product: 'Dell Latitude 5490', store: 'Dilsukhnagar', stock: 2, image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=60' },
  { product: 'HP ProBook 450 G6', store: 'Guntur', stock: 4, image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=60' },
]

export const MOCK_STORE_SUMMARY = [
  { store: 'Ameerpet', orders: 456, sales: 925650, status: 'Active' },
  { store: 'KPHB', orders: 342, sales: 715230, status: 'Active' },
  { store: 'Dilsukhnagar', orders: 268, sales: 545120, status: 'Active' },
  { store: 'Guntur', orders: 182, sales: 399230, status: 'Active' },
]

export const MOCK_PRODUCTS = [
  { id: 1, name: 'Lenovo ThinkPad T480', brand: 'Lenovo', category: 'Laptops', sku: 'LEN-T480-001', price: 32999, mrp: 52999, stock: 14, status: 'Active', featured: true, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100' },
  { id: 2, name: 'HP EliteBook 840 G5', brand: 'HP', category: 'Laptops', sku: 'HP-840G5-002', price: 28999, mrp: 42999, stock: 11, status: 'Active', featured: false, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100' },
  { id: 3, name: 'Dell Latitude 5490', brand: 'Dell', category: 'Laptops', sku: 'DEL-L5490-003', price: 39999, mrp: 55999, stock: 10, status: 'Active', featured: true, image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=100' },
  { id: 4, name: 'HP ProBook 450 G6', brand: 'HP', category: 'Laptops', sku: 'HP-PB450-004', price: 26999, mrp: 39999, stock: 14, status: 'Active', featured: false, image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=100' },
  { id: 5, name: 'Lenovo ThinkPad X1 Carbon', brand: 'Lenovo', category: 'Laptops', sku: 'LEN-X1C-005', price: 49999, mrp: 71999, stock: 8, status: 'Active', featured: true, image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100' },
  { id: 6, name: 'Dell OptiPlex 7060', brand: 'Dell', category: 'Desktops', sku: 'DEL-O7060-006', price: 22999, mrp: 35999, stock: 7, status: 'Active', featured: false, image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=100' },
  { id: 7, name: 'HP EliteDesk 800 G4', brand: 'HP', category: 'Desktops', sku: 'HP-ED800-007', price: 19999, mrp: 29999, stock: 5, status: 'Active', featured: false, image: 'https://images.unsplash.com/photo-1593640408182-31c228b4edeb?w=100' },
]

export const MOCK_CUSTOMERS = [
  { id: 1, name: 'Rahul Kumar', email: 'rahul@example.com', phone: '9876543210', orders: 3, spent: 98997, joined: '2024-01-15', status: 'Active' },
  { id: 2, name: 'Anil Reddy', email: 'anil@example.com', phone: '9876543211', orders: 1, spent: 28999, joined: '2024-02-20', status: 'Active' },
  { id: 3, name: 'Sneha Reddy', email: 'sneha@example.com', phone: '9876543212', orders: 2, spent: 59998, joined: '2024-03-10', status: 'Active' },
  { id: 4, name: 'Karthik Kumar', email: 'karthik@example.com', phone: '9876543213', orders: 1, spent: 26999, joined: '2024-04-05', status: 'Active' },
  { id: 5, name: 'Pooja Sharma', email: 'pooja@example.com', phone: '9876543214', orders: 4, spent: 152000, joined: '2024-01-20', status: 'Active' },
  { id: 6, name: 'Vikram Singh', email: 'vikram@example.com', phone: '9876543215', orders: 2, spent: 71998, joined: '2024-05-12', status: 'Inactive' },
]

export const MOCK_ACTIVITIES = [
  { icon: 'order', text: 'New order #ORD1254 received', time: '2 mins ago' },
  { icon: 'stock', text: 'Stock updated for Lenovo ThinkPad T480', time: '15 mins ago' },
  { icon: 'customer', text: 'New customer Rahul Kumar registered', time: '1 hour ago' },
  { icon: 'order', text: 'Order #ORD1253 shipped', time: '2 hours ago' },
  { icon: 'stock', text: 'Low stock alert: Dell Latitude 5490', time: '3 hours ago' },
]

export const MOCK_STORES = [
  { id: 1, name: 'Ameerpet Store', city: 'Ameerpet, Hyderabad', status: 'Active', orders: 456, sales: 925650, rating: 4.8, image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400', manager: 'Suresh Kumar', phone: '040-23456789' },
  { id: 2, name: 'KPHB Store', city: 'KPHB, Hyderabad', status: 'Active', orders: 342, sales: 715230, rating: 4.6, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', manager: 'Ravi Reddy', phone: '040-34567890' },
  { id: 3, name: 'Dilsukhnagar Store', city: 'Dilsukhnagar, Hyderabad', status: 'Active', orders: 268, sales: 545120, rating: 4.5, image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', manager: 'Priya Sharma', phone: '040-45678901' },
  { id: 4, name: 'Guntur Store', city: 'Guntur, Andhra Pradesh', status: 'Active', orders: 182, sales: 399230, rating: 4.7, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', manager: 'Anil Varma', phone: '0863-123456' },
]

export const MOCK_CATEGORIES = [
  { id: 1, name: 'Laptops', slug: 'laptops', products: 45, status: 'Active' },
  { id: 2, name: 'Desktops', slug: 'desktops', products: 23, status: 'Active' },
  { id: 3, name: 'Workstations', slug: 'workstations', products: 12, status: 'Active' },
  { id: 4, name: 'Accessories', slug: 'accessories', products: 38, status: 'Active' },
  { id: 5, name: 'Monitors', slug: 'monitors', products: 15, status: 'Inactive' },
]

export const MOCK_BRANDS = [
  { id: 1, name: 'Lenovo', logo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=60', products: 28, status: 'Active' },
  { id: 2, name: 'HP', logo: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=60', products: 35, status: 'Active' },
  { id: 3, name: 'Dell', logo: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=60', products: 22, status: 'Active' },
  { id: 4, name: 'Apple', logo: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=60', products: 10, status: 'Active' },
  { id: 5, name: 'Asus', logo: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=60', products: 8, status: 'Active' },
]

export const MOCK_BANNERS = [
  { id: 1, title: 'Summer Sale - Up to 40% Off', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400', position: 'Hero', status: 'Active', startDate: '2025-05-01', endDate: '2025-05-31' },
  { id: 2, title: 'New Arrivals - ThinkPad Series', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', position: 'Featured', status: 'Active', startDate: '2025-05-10', endDate: '2025-05-25' },
  { id: 3, title: 'Guntur Store Grand Opening', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', position: 'Sidebar', status: 'Inactive', startDate: '2025-04-01', endDate: '2025-04-30' },
]

export const MOCK_COUPONS = [
  { id: 1, code: 'SUMMER20', type: 'Percentage', discount: 20, minOrder: 15000, used: 45, limit: 100, status: 'Active', expiry: '2025-05-31' },
  { id: 2, code: 'FLAT2000', type: 'Fixed', discount: 2000, minOrder: 20000, used: 23, limit: 50, status: 'Active', expiry: '2025-06-15' },
  { id: 3, code: 'NEWUSER10', type: 'Percentage', discount: 10, minOrder: 10000, used: 12, limit: 200, status: 'Active', expiry: '2025-12-31' },
  { id: 4, code: 'GUNTUR15', type: 'Percentage', discount: 15, minOrder: 12000, used: 50, limit: 50, status: 'Expired', expiry: '2025-04-30' },
]

export const MOCK_REVIEWS = [
  { id: 1, product: 'Lenovo ThinkPad T480', customer: 'Rahul Kumar', rating: 5, review: 'Excellent condition! Works perfectly. Very happy with the purchase.', date: '2025-05-20', status: 'Approved' },
  { id: 2, product: 'HP EliteBook 840 G5', customer: 'Anil Reddy', rating: 4, review: 'Good laptop but battery could be better. Overall satisfied.', date: '2025-05-19', status: 'Approved' },
  { id: 3, product: 'Dell Latitude 5490', customer: 'Sneha Reddy', rating: 3, review: 'Average condition. Some minor scratches but works fine.', date: '2025-05-18', status: 'Pending' },
  { id: 4, product: 'HP ProBook 450 G6', customer: 'Karthik Kumar', rating: 5, review: 'Amazing deal! Best refurbished laptop I have bought.', date: '2025-05-17', status: 'Pending' },
]

export const MOCK_ADMIN_USERS = [
  { id: 1, name: 'Super Admin', email: 'admin@vr.com', role: 'SUPER_ADMIN', store: 'All Stores', status: 'Active', lastLogin: '2025-05-24 09:15' },
  { id: 2, name: 'Suresh Kumar', email: 'suresh@vr.com', role: 'STORE_MANAGER', store: 'Ameerpet', status: 'Active', lastLogin: '2025-05-24 08:30' },
  { id: 3, name: 'Ravi Reddy', email: 'ravi@vr.com', role: 'STORE_MANAGER', store: 'KPHB', status: 'Active', lastLogin: '2025-05-23 18:45' },
  { id: 4, name: 'Priya Sharma', email: 'priya@vr.com', role: 'SALES_STAFF', store: 'Dilsukhnagar', status: 'Active', lastLogin: '2025-05-23 17:20' },
  { id: 5, name: 'Anil Varma', email: 'anil.v@vr.com', role: 'STORE_MANAGER', store: 'Guntur', status: 'Inactive', lastLogin: '2025-05-20 14:00' },
]

export const MOCK_INVENTORY = [
  { id: 1, product: 'Lenovo ThinkPad T480', sku: 'LEN-T480-001', ameerpet: 5, kphb: 3, dilsukhnagar: 4, guntur: 2 },
  { id: 2, product: 'HP EliteBook 840 G5', sku: 'HP-840G5-002', ameerpet: 4, kphb: 3, dilsukhnagar: 2, guntur: 2 },
  { id: 3, product: 'Dell Latitude 5490', sku: 'DEL-L5490-003', ameerpet: 3, kphb: 2, dilsukhnagar: 1, guntur: 4 },
  { id: 4, product: 'HP ProBook 450 G6', sku: 'HP-PB450-004', ameerpet: 6, kphb: 4, dilsukhnagar: 2, guntur: 2 },
  { id: 5, product: 'Lenovo ThinkPad X1 Carbon', sku: 'LEN-X1C-005', ameerpet: 2, kphb: 3, dilsukhnagar: 2, guntur: 1 },
  { id: 6, product: 'Dell OptiPlex 7060', sku: 'DEL-O7060-006', ameerpet: 3, kphb: 2, dilsukhnagar: 1, guntur: 1 },
]

export const MOCK_REVENUE_TREND = [
  { month: 'Dec', revenue: 1850000 },
  { month: 'Jan', revenue: 2100000 },
  { month: 'Feb', revenue: 1950000 },
  { month: 'Mar', revenue: 2350000 },
  { month: 'Apr', revenue: 2200000 },
  { month: 'May', revenue: 2485230 },
]

export const MOCK_TOP_PRODUCTS = [
  { rank: 1, product: 'Lenovo ThinkPad T480', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=60', sold: 89, revenue: 2936911, store: 'Ameerpet' },
  { rank: 2, product: 'HP EliteBook 840 G5', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=60', sold: 76, revenue: 2203924, store: 'KPHB' },
  { rank: 3, product: 'Dell Latitude 5490', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=60', sold: 64, revenue: 2559936, store: 'Dilsukhnagar' },
  { rank: 4, product: 'Lenovo X1 Carbon', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=60', sold: 52, revenue: 2599948, store: 'Ameerpet' },
  { rank: 5, product: 'HP ProBook 450 G6', image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=60', sold: 48, revenue: 1295952, store: 'Guntur' },
]
