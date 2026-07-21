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
  _id?: string; // MongoDB ObjectId
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  preparationTime: number;
  shopId: string;
  stockQuantity?: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  _id?: string; // MongoDB ObjectId
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'pay_now' | 'pay_later' | 'wallet' | 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'razorpay_googlepay';
  paymentStatus: 'pending' | 'paid';
  createdAt: Date;
  updatedAt: Date;
  estimatedReadyTime: Date;
  studentId: string;
  studentName: string;
  shopId: string;
  shopName: string;
  paymentFee?: number;
  paymentGst?: number;
  pickupTimeSlot?: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'collected' | 'cancelled';

export interface User {
  id: string;
  _id?: string; // MongoDB ObjectId
  name: string;
  email: string;
  role: 'student' | 'shop_owner' | 'admin';
  sinNumber?: string;
  shopId?: string;
  walletBalance?: number;
}

export interface DailySales {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  itemsSold: { name: string; quantity: number }[];
}
