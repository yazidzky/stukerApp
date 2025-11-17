import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { orderAPI } from "@/utils/function";

export interface Order {
  order_id: string;
  customer_id?: string;
  stuker_id?: string;
  pickup_location: string;
  delivery_location: string;
  order_description: string;
  price_estimation: number;
  delivery_fee: number;
  total_price_estimation?: number;
  order_date?: string;
  status?: string;
  customer_name?: string;
  customer_image?: string;
  customer_rate?: number;
  stuker_name?: string;
  stuker_image?: string;
  completedAt?: string;
  cancelledAt?: string;
}

interface OrderState {
  availableOrders: Order[];
  currentOrder: Order | null;
  orderHistory: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  availableOrders: [],
  currentOrder: null,
  orderHistory: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAvailableOrders = createAsyncThunk(
  "order/fetchAvailable",
  async (_, { rejectWithValue }) => {
    try {
      const data = await orderAPI.getAvailableOrders();
      return data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch available orders";
      return rejectWithValue(errorMessage);
    }
  }
);

export const createOrder = createAsyncThunk(
  "order/create",
  async (
    orderData: {
      pickupLoc: string;
      deliveryLoc: string;
      description: string;
      itemPrice: number;
      deliveryFee: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderAPI.createOrder(orderData);
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create order";
      return rejectWithValue(errorMessage);
    }
  }
);

export const acceptOrder = createAsyncThunk(
  "order/accept",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderAPI.acceptOrder(orderId);
      return { orderId, response };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to accept order";
      return rejectWithValue(errorMessage);
    }
  }
);

export const completeOrder = createAsyncThunk(
  "order/complete",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderAPI.completeOrder(orderId);
      return { orderId, response };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to complete order";
      return rejectWithValue(errorMessage);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "order/cancel",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderAPI.cancelOrder(orderId);
      return { orderId, response };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel order";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  "order/fetchDetails",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const data = await orderAPI.getOrder(orderId);
      return data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch order details";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchOrderHistory = createAsyncThunk(
  "order/fetchHistory",
  async (as: "user" | "stuker", { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrderHistory(as);
      return { as, history: response.history || [] };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch order history";
      return rejectWithValue(errorMessage);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: string; status: string }>
    ) => {
      const { orderId, status } = action.payload;

      // Update in available orders
      const availableIndex = state.availableOrders.findIndex(
        (order) => order.order_id === orderId
      );
      if (availableIndex !== -1) {
        state.availableOrders[availableIndex].status = status;
      }

      // Update current order if it matches
      if (state.currentOrder?.order_id === orderId) {
        state.currentOrder.status = status;
      }

      // Update in history
      const historyIndex = state.orderHistory.findIndex(
        (order) => order.order_id === orderId
      );
      if (historyIndex !== -1) {
        state.orderHistory[historyIndex].status = status;
      }
    },
    removeOrderFromAvailable: (state, action: PayloadAction<string>) => {
      state.availableOrders = state.availableOrders.filter(
        (order) => order.order_id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Available Orders
      .addCase(fetchAvailableOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableOrders.fulfilled, (state, action) => {
        state.availableOrders = action.payload;
        state.loading = false;
      })
      .addCase(fetchAvailableOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Order will be stored in localStorage by the component
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Accept Order
      .addCase(acceptOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        const { orderId } = action.payload;
        // Remove from available orders
        state.availableOrders = state.availableOrders.filter(
          (order) => order.order_id !== orderId
        );
        state.loading = false;
      })
      .addCase(acceptOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Complete Order
      .addCase(completeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeOrder.fulfilled, (state, action) => {
        const { orderId } = action.payload;
        // Update order status
        state.orderHistory = state.orderHistory.map((order) =>
          order.order_id === orderId
            ? {
                ...order,
                status: "completed",
                completedAt: new Date().toISOString(),
              }
            : order
        );
        if (state.currentOrder?.order_id === orderId) {
          state.currentOrder.status = "completed";
          state.currentOrder.completedAt = new Date().toISOString();
        }
        state.loading = false;
      })
      .addCase(completeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const { orderId } = action.payload;
        // Update order status
        state.availableOrders = state.availableOrders.filter(
          (order) => order.order_id !== orderId
        );
        state.orderHistory = state.orderHistory.map((order) =>
          order.order_id === orderId
            ? {
                ...order,
                status: "cancelled",
                cancelledAt: new Date().toISOString(),
              }
            : order
        );
        if (state.currentOrder?.order_id === orderId) {
          state.currentOrder.status = "cancelled";
          state.currentOrder.cancelledAt = new Date().toISOString();
        }
        state.loading = false;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Order Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Order History
      .addCase(fetchOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.orderHistory = action.payload.history;
        state.loading = false;
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentOrder,
  clearCurrentOrder,
  updateOrderStatus,
  removeOrderFromAvailable,
} = orderSlice.actions;

export default orderSlice.reducer;
