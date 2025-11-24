"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/utils/function';

interface User {
  id: string;
  name: string;
  nim: string;
  phone: string;
  profilePicture?: string;
  role: string[];
  // Rating berdasarkan role
  avgRatingAsUser?: number;
  countRatingAsUser?: number;
  avgRatingAsStuker?: number;
  countRatingAsStuker?: number;
  // Legacy fields (untuk backward compatibility)
  avgRating?: number;
  countRating?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (nim: string, password: string) => Promise<void>;
  register: (data: { nim: string; name: string; phone: string; password: string; confirmPassword: string }) => Promise<void>;
  logout: () => void;
  switchRole: (targetRole: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to decode JWT and get user ID
  const getUserIdFromToken = (token: string): string | null => {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded.id ? String(decoded.id) : null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // If user doesn't have ID, try to get it from token
        if (!parsedUser.id && token) {
          const userIdFromToken = getUserIdFromToken(token);
          if (userIdFromToken) {
            parsedUser.id = userIdFromToken;
            // Update localStorage with ID
            localStorage.setItem('user', JSON.stringify(parsedUser));
            console.log('✅ Updated user ID from token:', userIdFromToken);
          }
        }
        
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (nim: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ nim, password });

      const userData: User = {
        id: response.users.id || response.users._id || '',
        name: response.users.name,
        nim: nim,
        phone: response.users.phone,
        profilePicture: response.users.profile_picture,
        role: response.role || ['user'], // Get role from response
        avgRatingAsUser: response.users.avgRatingAsUser,
        countRatingAsUser: response.users.countRatingAsUser,
        avgRatingAsStuker: response.users.avgRatingAsStuker,
        countRatingAsStuker: response.users.countRatingAsStuker,
        avgRating: response.users.avgRating,
        countRating: response.users.countRating,
      };
      
      // Ensure id is always a string
      if (!userData.id) {
        console.error('⚠️ Warning: User ID is missing from login response');
      }

      setUser(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      // Simpan password asli untuk ditampilkan di profil (untuk keperluan development/testing)
      localStorage.setItem('userPassword', password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { nim: string; name: string; phone: string; password: string; confirmPassword: string }) => {
    try {
      setLoading(true);
      await authAPI.register(data);
      // Simpan password asli untuk ditampilkan di profil setelah login (untuk keperluan development/testing)
      localStorage.setItem('userPassword', data.password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userPassword');
  };

  const switchRole = async (targetRole: string) => {
    try {
      setLoading(true);
      const response = await authAPI.switchRole({ targetRole });

      if (user) {
        const updatedUser = { ...user, role: response.role };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Update token if provided in response
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Role switch failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const { profileAPI } = await import('@/utils/function');
      // Gunakan noCache untuk memastikan data terbaru diambil
      const profileResponse = await profileAPI.getProfile(true);

      if (profileResponse.success) {
        // Ambil user dari state atau localStorage untuk mendapatkan ID
        const currentUser = user || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
        
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            nim: currentUser.nim,
            name: profileResponse.user.name,
            phone: profileResponse.user.phone,
            profilePicture: profileResponse.user.profilePicture,
            avgRatingAsUser: profileResponse.user.avgRatingAsUser,
            countRatingAsUser: profileResponse.user.countRatingAsUser,
            avgRatingAsStuker: profileResponse.user.avgRatingAsStuker,
            countRatingAsStuker: profileResponse.user.countRatingAsStuker,
            avgRating: profileResponse.user.avgRating,
            countRating: profileResponse.user.countRating,
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('[AUTH] User refreshed with latest rating data:', {
            avgRatingAsUser: updatedUser.avgRatingAsUser,
            countRatingAsUser: updatedUser.countRatingAsUser,
            avgRatingAsStuker: updatedUser.avgRatingAsStuker,
            countRatingAsStuker: updatedUser.countRatingAsStuker,
          });
        } else {
          // Jika tidak ada user di state atau localStorage, tetap update jika ada data
          const updatedUser = {
            id: profileResponse.user._id || profileResponse.user.id,
            nim: profileResponse.user.nim || '',
            name: profileResponse.user.name,
            phone: profileResponse.user.phone,
            profilePicture: profileResponse.user.profilePicture,
            role: profileResponse.user.role || ['user'],
            avgRatingAsUser: profileResponse.user.avgRatingAsUser,
            countRatingAsUser: profileResponse.user.countRatingAsUser,
            avgRatingAsStuker: profileResponse.user.avgRatingAsStuker,
            countRatingAsStuker: profileResponse.user.countRatingAsStuker,
            avgRating: profileResponse.user.avgRating,
            countRating: profileResponse.user.countRating,
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    switchRole,
    refreshUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
