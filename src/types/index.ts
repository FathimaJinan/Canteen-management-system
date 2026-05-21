export interface Shop {
  id: string;
  name: string;
  description: string;
  image: string;
  ownerEmail: string;
  isOpen: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  preparationTime: number;
  shopId: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'pay_now' | 'pay_later';
  paymentStatus: 'pending' | 'paid';
  createdAt: Date;
  updatedAt: Date;
  estimatedReadyTime: Date;
  studentId: string;
  studentName: string;
  shopId: string;
  shopName: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'collected' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'shop_owner';
  sinNumber?: string;
  shopId?: string;
}

export interface DailySales {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  itemsSold: { name: string; quantity: number }[];
}
