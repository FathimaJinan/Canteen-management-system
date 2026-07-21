const API_BASE_URL = "http://localhost:5000/api";

const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem("zappadu_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to login");
    }
    return res.json();
  },

  async register(name: string, email: string, password: string, sinNumber: string) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password, sinNumber }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to register");
    }
    return res.json();
  },

  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
  },

  async topUpWallet(amount: number) {
    const res = await fetch(`${API_BASE_URL}/auth/wallet/topup`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error("Failed to top up wallet");
    return res.json();
  },

  // Shops
  async getShops() {
    const res = await fetch(`${API_BASE_URL}/menu/shops`);
    if (!res.ok) throw new Error("Failed to fetch shops");
    return res.json();
  },

  // Menu Items
  async getMenuItems(shopId?: string) {
    const url = shopId ? `${API_BASE_URL}/menu/items?shopId=${shopId}` : `${API_BASE_URL}/menu/items`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch menu items");
    return res.json();
  },

  async addMenuItem(data: any) {
    const res = await fetch(`${API_BASE_URL}/menu/items`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to add menu item");
    }
    return res.json();
  },

  async updateMenuItem(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/menu/items/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update menu item");
    }
    return res.json();
  },

  async deleteMenuItem(id: string) {
    const res = await fetch(`${API_BASE_URL}/menu/items/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to delete menu item");
    }
    return res.json();
  },

  // Orders
  async placeOrder(data: { items: any[]; paymentMethod: string; shopId: string; pickupTimeSlot?: string }) {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to place order");
    }
    return res.json();
  },

  async getOrders() {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },

  async updateOrderStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update order status");
    }
    return res.json();
  },

  // Admin
  async onboardShopkeeper(data: any) {
    const res = await fetch(`${API_BASE_URL}/admin/onboard-shopkeeper`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to onboard shopkeeper");
    }
    return res.json();
  },

  async getSalesAnalytics() {
    const res = await fetch(`${API_BASE_URL}/admin/sales-analytics`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch sales analytics");
    return res.json();
  },
};
