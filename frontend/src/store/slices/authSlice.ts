import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authAPI } from "@/utils/function";

interface User {
  id: string;
  name: string;
  nim: string;
  phone: string;
  profilePicture?: string;
  role: string[];
  avgRatingAsUser?: number;
  countRatingAsUser?: number;
  avgRatingAsStuker?: number;
  countRatingAsStuker?: number;
  avgRating?: number;
  countRating?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Helper to decode JWT and get user ID
const getUserIdFromToken = (token: string): string | null => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.id ? String(decoded.id) : null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (
    { nim, password }: { nim: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.login({ nim, password });

      const userData: User = {
        id: response.users.id || response.users._id || "",
        name: response.users.name,
        nim: nim,
        phone: response.users.phone,
        profilePicture: response.users.profile_picture,
        role: response.role || ["user"],
        avgRatingAsUser: response.users.avgRatingAsUser,
        countRatingAsUser: response.users.countRatingAsUser,
        avgRatingAsStuker: response.users.avgRatingAsStuker,
        countRatingAsStuker: response.users.countRatingAsStuker,
        avgRating: response.users.avgRating,
        countRating: response.users.countRating,
      };

      if (!userData.id) {
        console.error("⚠️ Warning: User ID is missing from login response");
      }

      return { user: userData, token: response.token };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as any).response?.data?.message || "Login failed"
          : "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    data: {
      nim: string;
      name: string;
      phone: string;
      password: string;
      confirmPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await authAPI.register(data);
      return data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as any).response?.data?.message || "Registration failed"
          : "Registration failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const switchRole = createAsyncThunk(
  "auth/switchRole",
  async ({ targetRole }: { targetRole: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.switchRole({ targetRole });
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as any).response?.data?.message || "Role switch failed"
          : "Role switch failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const refreshUser = createAsyncThunk(
  "auth/refreshUser",
  async (_, { rejectWithValue }) => {
    try {
      const { profileAPI } = await import("@/utils/function");
      const profileResponse = await profileAPI.getProfile(true);

      if (profileResponse.success) {
        return profileResponse.user;
      } else {
        return rejectWithValue("Failed to refresh user data");
      }
    } catch (error) {
      return rejectWithValue("Error refreshing user");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userPassword");
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);

          // If user doesn't have ID, try to get it from token
          if (!parsedUser.id && token) {
            const userIdFromToken = getUserIdFromToken(token);
            if (userIdFromToken) {
              parsedUser.id = userIdFromToken;
              localStorage.setItem("user", JSON.stringify(parsedUser));
              console.log("✅ Updated user ID from token:", userIdFromToken);
            }
          }

          state.user = parsedUser;
          state.isAuthenticated = true;
        } catch (error) {
          console.error("Error parsing saved user:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }

      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("userPassword", action.meta.arg.password);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        localStorage.setItem("userPassword", action.meta.arg.password);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Switch Role
      .addCase(switchRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(switchRole.fulfilled, (state, action) => {
        if (state.user) {
          state.user.role = action.payload.role;
          localStorage.setItem("user", JSON.stringify(state.user));
          if (action.payload.token) {
            localStorage.setItem("token", action.payload.token);
          }
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(switchRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Refresh User
      .addCase(refreshUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        if (state.user) {
          const currentUser = state.user;
          const updatedUser = {
            ...currentUser,
            name: action.payload.name,
            phone: action.payload.phone,
            profilePicture: action.payload.profilePicture,
            avgRatingAsUser: action.payload.avgRatingAsUser,
            countRatingAsUser: action.payload.countRatingAsUser,
            avgRatingAsStuker: action.payload.avgRatingAsStuker,
            countRatingAsStuker: action.payload.countRatingAsStuker,
            avgRating: action.payload.avgRating,
            countRating: action.payload.countRating,
          };
          state.user = updatedUser;
          localStorage.setItem("user", JSON.stringify(updatedUser));
          console.log("[AUTH] User refreshed with latest rating data:", {
            avgRatingAsUser: updatedUser.avgRatingAsUser,
            countRatingAsUser: updatedUser.countRatingAsUser,
            avgRatingAsStuker: updatedUser.avgRatingAsStuker,
            countRatingAsStuker: updatedUser.countRatingAsStuker,
          });
        } else {
          // If no user in state, set it
          state.user = action.payload;
          state.isAuthenticated = true;
          localStorage.setItem("user", JSON.stringify(action.payload));
        }
        state.loading = false;
      })
      .addCase(refreshUser.rejected, (state, action) => {
        state.loading = false;
        console.error("Error refreshing user:", action.payload);
      });
  },
});

export const { logout, clearError, setLoading, initializeAuth } =
  authSlice.actions;
export default authSlice.reducer;
