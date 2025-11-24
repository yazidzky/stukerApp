// src/utils/function.ts

export function limitText(text: string, maxLength: number = 50): string {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + ".." : text;
}

// API Base URL: use relative '/api' (Next.js rewrites map to backend)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper function for API calls
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    // Log API request for debugging
    console.log(`[API Request] ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        try {
          const text = await response.text();
          if (text) {
            errorMessage = text;
          }
        } catch {
          // Keep the default error message
        }
      }
      
      // If unauthorized, clear token and redirect to login
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
      }
      
      // For 404 on history endpoints, don't log as error (no orders found is expected)
      const isHistoryEndpoint = endpoint.includes('/orders/history');
      if (response.status === 404 && isHistoryEndpoint) {
        // Return null instead of throwing for history endpoints with 404
        // This allows the caller to handle it gracefully
        return null;
      }
      
      // For 404 on rating endpoints (order not found), handle gracefully
      const isRatingEndpoint = endpoint.includes('/ratings');
      const isRatingOrderEndpoint = endpoint.includes('/ratings/order/');
      if (response.status === 404 && isRatingOrderEndpoint) {
        // Return null for rating order endpoints with 404 (order not found)
        // This allows the caller to handle it gracefully with fallback data
        return null;
      }
      
      // For 400 errors on ratings endpoint with duplicate message, don't log as error
      const isDuplicateRating = errorMessage.includes('sudah memberi rating') || 
                                errorMessage.includes('duplicate') ||
                                errorMessage.includes('E11000');
      if (response.status === 400 && isRatingEndpoint && isDuplicateRating) {
        // Don't log as error, just throw the error message for the caller to handle
        throw new Error(errorMessage);
      }
      
      // Log error for debugging (skip for expected 404s and duplicate ratings)
      const shouldSkipLogging = (response.status === 400 && isRatingEndpoint && isDuplicateRating) ||
                                (response.status === 404 && isHistoryEndpoint) ||
                                (response.status === 404 && isRatingOrderEndpoint);
      
      if (!shouldSkipLogging) {
        console.error(`API Error [${response.status}]: ${endpoint}`, errorMessage);
      }
      
      throw new Error(errorMessage);
    }

    // Handle empty response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    return response.json();
  } catch (error) {
    const err = error as { name?: string; message?: string; toString?: () => string };
    const isNetworkError = err?.name === 'TypeError' && 
                          (err?.message?.includes('fetch') || err?.message?.includes('Failed to fetch'));
    const isCorsError = !!err?.message && (err.message.includes('CORS') || err.message.includes('cors'));

    if (isNetworkError || isCorsError) {
      console.error('[API Error]', {
        endpoint: `${API_BASE_URL}${endpoint}`,
        method: options.method || 'GET',
        error: err?.message || 'Unknown error',
        name: err?.name || 'Unknown',
        errorObject: err,
      });
    }

    if (isNetworkError) {
      const errorMessage = `Tidak dapat terhubung ke server di ${API_BASE_URL}. Pastikan:
1. Backend server berjalan
2. URL server benar
3. Tidak ada masalah firewall atau network`;
      throw new Error(errorMessage);
    }

    if (isCorsError) {
      throw new Error('Error CORS: Pastikan backend server mengizinkan request dari frontend');
    }

    if (err?.message) {
      throw new Error(err.message);
    }
    throw new Error(`Error tidak diketahui: ${String(err)}`);
  }
};

// Auth API
export const authAPI = {
  login: async (data: { nim: string; password: string }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  register: async (data: { nim: string; name: string; phone: string; password: string; confirmPassword: string }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  switchRole: async (data: { targetRole: string }) => {
    return apiRequest('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Profile API
export const profileAPI = {
  getProfile: async (noCache = false) => {
    // Selalu gunakan cache-busting untuk memastikan data terbaru
    const endpoint = noCache ? `/profile?t=${Date.now()}` : '/profile';
    return apiRequest(endpoint, {
      cache: 'no-store', // Prevent caching
    });
  },
  editProfile: async (data: { name?: string; phone?: string; profilePicture?: string }) => {
    return apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Rating API
export const ratingAPI = {
  createRating: async (data: { orderId: string; stars: number; comment?: string }) => {
    return apiRequest('/ratings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getUserRating: async (userId: string) => {
    return apiRequest(`/ratings/user/${userId}`);
  },
  getOrderRatingData: async (orderId: string) => {
    return apiRequest(`/ratings/order/${orderId}`);
  },
};

// Order API
export const orderAPI = {
  createOrder: async (data: { pickupLoc: string; deliveryLoc: string; description: string; itemPrice: number; deliveryFee: number }) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getOrder: async (orderId: string) => {
    return apiRequest(`/orders/${orderId}`);
  },
  getAvailableOrders: async () => {
    return apiRequest('/orders/available');
  },
  acceptOrder: async (orderId: string) => {
    return apiRequest(`/orders/${orderId}/accept`, {
      method: 'PATCH',
    });
  },
  completeOrder: async (orderId: string) => {
    return apiRequest(`/orders/${orderId}/done`, {
      method: 'PATCH',
    });
  },
  cancelOrder: async (orderId: string) => {
    return apiRequest(`/orders/${orderId}/cancel`, {
      method: 'PATCH',
    });
  },
  getOrderHistory: async (as: 'user' | 'stuker') => {
    try {
      const response = await apiRequest(`/orders/history?as=${as}`);
      // If response is null (404 handled gracefully), return empty history
      if (response === null) {
        return {
          success: true,
          history: []
        };
      }
      return response;
    } catch (error) {
      console.error('Error fetching order history:', error);
      return {
        success: true,
        history: []
      };
    }
  },
};
