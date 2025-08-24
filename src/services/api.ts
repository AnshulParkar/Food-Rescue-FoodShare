import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'donor' | 'recipient' | 'volunteer';
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationItem {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  donorName: string;
  donorId: string;
  location: string;
  expiry: string;
  quantity: string;
  status: 'available' | 'reserved' | 'completed';
  imageUrl: string;
  foodType: string;
  createdAt: string;
  updatedAt?: string;
  recipientId?: string | null;
  pickupTime?: string | null;
}

export interface CreateDonationData {
  title: string;
  description: string;
  donorName: string;
  donorId: string;
  location: string;
  expiry: Date | string;
  quantity: string;
  imageUrl: string;
  foodType: string;
  status?: 'available' | 'reserved' | 'completed';
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  name: string;
  role: 'donor' | 'recipient' | 'volunteer';
}

export interface AnalyticsData {
  overview: {
    totalDonations: number;
    availableDonations: number;
    reservedDonations: number;
    completedDonations: number;
    uniqueDonors: number;
    uniqueLocations: number;
    estimatedMealsProvided: number;
    estimatedFoodWasteSaved: number;
    estimatedCO2Saved: number;
    expiringToday: number;
    expiringThisWeek: number;
  };
  charts: {
    monthlyDonations: { month: string; donations: number }[];
    foodTypeData: { name: string; value: number }[];
    statusData: { name: string; value: number }[];
  };
  topDonors: {
    name: string;
    donations: number;
    percent: number;
  }[];
}

// Create an Axios instance with default configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with an error status
      if (error.response.status === 401) {
        // Unauthorized - clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// API methods for common operations
export const apiMethods = {
  // Auth endpoints
  async login(data: LoginData): Promise<{ message: string; user: User }> {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  async signup(data: SignupData): Promise<{ message: string; user: User }> {
    const response = await api.post('/api/auth/signup', data);
    return response.data;
  },

  // User endpoints
  async getUsers(): Promise<User[]> {
    const response = await api.get('/api/users');
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  async createUser(userData: CreateUserData): Promise<{ message: string; user: User }> {
    const response = await api.post('/api/users', userData);
    return response.data;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<{ message: string; user: User }> {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  // Donation endpoints
  async getDonations(filters?: { status?: string; donorId?: string }): Promise<DonationItem[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.donorId) params.append('donorId', filters.donorId);
    
    const response = await api.get(`/api/donations?${params.toString()}`);
    return response.data;
  },

  async getDonationById(id: string): Promise<DonationItem> {
    const response = await api.get(`/api/donations/${id}`);
    return response.data;
  },

  async createDonation(donationData: CreateDonationData): Promise<{ message: string; donation: DonationItem }> {
    const response = await api.post('/api/donations', donationData);
    return response.data;
  },

  async updateDonation(id: string, donationData: Partial<DonationItem>): Promise<{ message: string; donation: DonationItem }> {
    const response = await api.put(`/api/donations/${id}`, donationData);
    return response.data;
  },

  updateDonationStatus: async (
    id: string, 
    status: DonationItem['status'],
    recipientId?: string,
    pickupTime?: Date
  ): Promise<{ message: string; donation: DonationItem }> => {
    const response = await fetch(`${API_BASE_URL}/donations/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, recipientId, pickupTime }),
    });

    if (!response.ok) {
      throw new Error('Failed to update donation status');
    }

    return response.json();
  },

  async deleteDonation(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/donations/${id}`);
    return response.data;
  },

  async getData() {
    const response = await api.get('/');
    return response.data;
  },

  // Analytics endpoint
  async getAnalytics(): Promise<AnalyticsData> {
    const response = await api.get('/api/donations/analytics');
    return response.data;
  },
};