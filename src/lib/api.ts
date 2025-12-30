import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/get-started', '/forgot-password', '/reset-password', '/'];

const isPublicRoute = (): boolean => {
  const currentPath = window.location.pathname;
  return PUBLIC_ROUTES.some(route => currentPath === route || currentPath.startsWith(route + '/'));
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Token management
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token - just clear tokens and reject
        // Don't redirect here - let the component/AuthContext handle it
        clearTokens();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem(TOKEN_KEY, accessToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearTokens();
        // Don't redirect here - let the component/AuthContext handle it
        // Only redirect if NOT on a public route to prevent loops
        if (!isPublicRoute()) {
          // Use setTimeout to prevent blocking and give React time to handle state
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth API
export const authApi = {
  signup: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    pinCode?: string;
    userType?: 'user' | 'owner';
    businessName?: string;
    businessAddress?: string;
    gstNumber?: string;
  }) => api.post<ApiResponse>('/auth/signup', data),

  login: (email: string, password: string) =>
    api.post<ApiResponse>('/auth/login', { email, password }),

  logout: (refreshToken?: string) =>
    api.post<ApiResponse>('/auth/logout', { refreshToken }),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse>('/auth/refresh', { refreshToken }),

  getMe: () => api.get<ApiResponse>('/auth/me'),

  upgradeToOwner: (data: {
    businessName: string;
    businessAddress?: string;
    gstNumber?: string;
  }) => api.post<ApiResponse>('/auth/upgrade-to-owner', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse>('/auth/change-password', { currentPassword, newPassword }),
};

// Users API
export const usersApi = {
  getProfile: (id: string) => api.get<ApiResponse>(`/users/${id}`),

  updateProfile: (data: {
    name?: string;
    phone?: string;
    pinCode?: string;
    avatarUrl?: string;
    bio?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  }) => api.put<ApiResponse>('/users/me', data),

  getAllProfiles: (params?: {
    page?: number;
    limit?: number;
    userType?: string;
    search?: string;
  }) => api.get<ApiResponse>('/users', { params }),

  getOnlineStatus: (userIds: string[]) =>
    api.get<ApiResponse>('/users/online-status', { params: { userIds: userIds.join(',') } }),

  getLeaderboard: () => api.get<ApiResponse>('/users/leaderboard'),

  getTopProfiles: () => api.get<ApiResponse>('/users/top-profiles'),

  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get<ApiResponse>('/users/me/notifications', { params }),

  markNotificationRead: (id: string) =>
    api.put<ApiResponse>(`/users/me/notifications/${id}/read`),

  markAllNotificationsRead: () =>
    api.put<ApiResponse>('/users/me/notifications/read-all'),
};

// Listings API
export const listingsApi = {
  getListings: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    productType?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    pinCode?: string;
    search?: string;
    ownerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => api.get<ApiResponse>('/listings', { params }),

  getListing: (id: string) => api.get<ApiResponse>(`/listings/${id}`),

  createListing: (data: {
    productName: string;
    description: string;
    category: string;
    productType?: string;
    pricePerDay: number;
    pricePerWeek?: number;
    pricePerMonth?: number;
    securityDeposit?: number;
    images?: string[];
    pinCode?: string;
    address?: string;
    city?: string;
    state?: string;
    availability?: boolean;
    availableFrom?: string;
    availableTo?: string;
    condition?: string;
    brand?: string;
    model?: string;
    features?: string[];
    rules?: string[];
  }) => api.post<ApiResponse>('/listings', data),

  updateListing: (id: string, data: Partial<Parameters<typeof listingsApi.createListing>[0]>) =>
    api.put<ApiResponse>(`/listings/${id}`, data),

  deleteListing: (id: string) => api.delete<ApiResponse>(`/listings/${id}`),

  incrementViews: (id: string) => api.post<ApiResponse>(`/listings/${id}/views`),

  getCategories: () => api.get<ApiResponse>('/listings/categories'),

  getListingRatings: (id: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse>(`/listings/${id}/ratings`, { params }),

  addListingRating: (id: string, rating: number, review?: string) =>
    api.post<ApiResponse>(`/listings/${id}/ratings`, { rating, review }),
};

// Owner API
export const ownerApi = {
  getStats: () => api.get<ApiResponse>('/owner/stats'),

  getListings: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse>('/owner/listings', { params }),

  getRentalRequests: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse>('/owner/rental-requests', { params }),

  getRentalRequest: (id: string) =>
    api.get<ApiResponse>(`/owner/rental-requests/${id}`),

  updateRentalRequest: (id: string, status: string, rejectionReason?: string) =>
    api.put<ApiResponse>(`/owner/rental-requests/${id}`, { status, rejectionReason }),

  verifyIdentity: (id: string, status: string, rejectionReason?: string) =>
    api.put<ApiResponse>(`/owner/identity-verification/${id}`, { status, rejectionReason }),

  getRatings: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse>('/owner/ratings', { params }),

  getEarnings: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) =>
    api.get<ApiResponse>('/owner/earnings', { params }),

  getActivityLogs: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse>('/owner/activity-logs', { params }),
};

// Admin API
export const adminApi = {
  getStats: () => api.get<ApiResponse>('/admin/stats'),

  // Listings
  getAllListings: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get<ApiResponse>('/admin/listings', { params }),

  updateListingStatus: (id: string, status: string, rejectionReason?: string) =>
    api.put<ApiResponse>(`/admin/listings/${id}/status`, { status, rejectionReason }),

  // Blogs
  getBlogs: (params?: { page?: number; limit?: number; published?: boolean }) =>
    api.get<ApiResponse>('/admin/blogs', { params }),

  createBlog: (data: {
    title: string;
    slug?: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    tags?: string[];
    category?: string;
    isPublished?: boolean;
  }) => api.post<ApiResponse>('/admin/blogs', data),

  updateBlog: (id: string, data: Partial<Parameters<typeof adminApi.createBlog>[0]>) =>
    api.put<ApiResponse>(`/admin/blogs/${id}`, data),

  deleteBlog: (id: string) => api.delete<ApiResponse>(`/admin/blogs/${id}`),

  // Ads
  getAds: (params?: { page?: number; limit?: number; isActive?: boolean }) =>
    api.get<ApiResponse>('/admin/ads', { params }),

  createAd: (data: {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    placement?: string;
    displayOrder?: number;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
  }) => api.post<ApiResponse>('/admin/ads', data),

  updateAd: (id: string, data: Partial<Parameters<typeof adminApi.createAd>[0]>) =>
    api.put<ApiResponse>(`/admin/ads/${id}`, data),

  deleteAd: (id: string) => api.delete<ApiResponse>(`/admin/ads/${id}`),

  // Banners
  getBanners: () => api.get<ApiResponse>('/admin/banners'),

  createBanner: (data: {
    title?: string;
    imageUrl: string;
    linkUrl?: string;
    displayOrder?: number;
    isActive?: boolean;
  }) => api.post<ApiResponse>('/admin/banners', data),

  updateBanner: (id: string, data: Partial<Parameters<typeof adminApi.createBanner>[0]>) =>
    api.put<ApiResponse>(`/admin/banners/${id}`, data),

  deleteBanner: (id: string) => api.delete<ApiResponse>(`/admin/banners/${id}`),

  // Packages
  getPackages: () => api.get<ApiResponse>('/admin/packages'),

  createPackage: (data: {
    name: string;
    description?: string;
    price: number;
    duration?: number;
    features?: string[];
    listingsLimit?: number;
    boostDays?: number;
    displayOrder?: number;
    isActive?: boolean;
  }) => api.post<ApiResponse>('/admin/packages', data),

  updatePackage: (id: string, data: Partial<Parameters<typeof adminApi.createPackage>[0]>) =>
    api.put<ApiResponse>(`/admin/packages/${id}`, data),

  deletePackage: (id: string) => api.delete<ApiResponse>(`/admin/packages/${id}`),

  // Coupons
  getCoupons: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse>('/admin/coupons', { params }),

  createCoupon: (data: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minPurchase?: number;
    maxDiscount?: number;
    usageLimit?: number;
    validFrom?: string;
    validUntil?: string;
    isActive?: boolean;
  }) => api.post<ApiResponse>('/admin/coupons', data),

  updateCoupon: (id: string, data: Partial<Parameters<typeof adminApi.createCoupon>[0]>) =>
    api.put<ApiResponse>(`/admin/coupons/${id}`, data),

  deleteCoupon: (id: string) => api.delete<ApiResponse>(`/admin/coupons/${id}`),

  // User management
  updateUserRole: (id: string, role: string, action: 'add' | 'remove') =>
    api.put<ApiResponse>(`/admin/users/${id}/role`, { role, action }),

  // Activity logs
  getActivityLogs: (params?: { page?: number; limit?: number; action?: string; targetType?: string }) =>
    api.get<ApiResponse>('/admin/activity-logs', { params }),

  // Section visibility
  getSectionVisibility: () => api.get<ApiResponse>('/admin/section-visibility'),

  updateSectionVisibility: (id: string, isVisible: boolean) =>
    api.put<ApiResponse>(`/admin/section-visibility/${id}`, { isVisible }),

  // Top profiles
  addTopProfile: (profileId: string, displayOrder?: number, isActive?: boolean) =>
    api.post<ApiResponse>('/admin/top-profiles', { profileId, displayOrder, isActive }),

  removeTopProfile: (id: string) => api.delete<ApiResponse>(`/admin/top-profiles/${id}`),

  // Leaderboard
  updateLeaderboard: (entries: Array<{ profileId: string; rank: number; score?: number; category?: string }>) =>
    api.put<ApiResponse>('/admin/leaderboard', { entries }),
};

// Upload API
export const uploadApi = {
  uploadImage: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return api.post<ApiResponse>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadImages: (files: File[], folder?: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (folder) formData.append('folder', folder);
    return api.post<ApiResponse>('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse>('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadListingImages: (listingId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post<ApiResponse>(`/upload/listing/${listingId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadIdentityDocument: (rentalRequestId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse>(`/upload/identity/${rentalRequestId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadChatMedia: (conversationId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse>(`/upload/chat/${conversationId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadBlogImage: (blogId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse>(`/upload/blog/${blogId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadAdImage: (file: File, type?: 'ad' | 'banner', id?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (type) formData.append('type', type);
    if (id) formData.append('id', id);
    return api.post<ApiResponse>('/upload/ad', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteFile: (publicId: string, resourceType?: string) =>
    api.delete<ApiResponse>(`/upload/${encodeURIComponent(publicId)}`, {
      params: { resourceType },
    }),

  deleteByUrl: (url: string, resourceType?: string) =>
    api.delete<ApiResponse>('/upload', { data: { url, resourceType } }),
};

export default api;
