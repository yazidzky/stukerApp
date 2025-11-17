import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Socket } from "socket.io-client";

interface ChatMessage {
  _id?: string;
  senderId: string;
  type: "text" | "image" | "text-image";
  text?: string;
  imageUrl?: string;
  time: number;
}

interface ChatState {
  messages: ChatMessage[];
  connected: boolean;
  loading: boolean;
  error: string | null;
  previewImage: string | null;
  currentOrderId: string | null;
}

// Module-level socket variable
let chatSocket: Socket | null = null;

const initialState: ChatState = {
  messages: [],
  connected: false,
  loading: false,
  error: null,
  previewImage: null,
  currentOrderId: null,
};

export const initializeChat = createAsyncThunk<string, string>(
  "chat/initialize",
  async (orderId: string, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No token found");
      }

      const { default: io } = await import("socket.io-client");
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

      const socket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      return new Promise<string>((resolve, reject) => {
        socket.on("connect", () => {
          console.log("✅ Connected to socket for chat");
          socket.emit("join-order", orderId);
          chatSocket = socket;
          resolve(orderId);
        });

        socket.on("connect_error", (error) => {
          console.error("❌ Socket connection error:", error);
          reject(error);
        });

        socket.on("disconnect", (reason) => {
          console.log("⚠️ Socket disconnected:", reason);
        });

        socket.on("reconnect", (attemptNumber) => {
          console.log("🔄 Reconnected to socket, attempt:", attemptNumber);
          socket.emit("join-order", orderId);
        });

        socket.on("reconnect_error", (error) => {
          console.error("❌ Reconnection error:", error);
        });

        socket.on("reconnect_failed", () => {
          console.error("❌ Reconnection failed after all attempts");
          reject(new Error("Reconnection failed"));
        });

        socket.on("error", (error: { message: string }) => {
          console.error("❌ Socket error:", error.message);
        });

        // Set up message listeners
        socket.on("chat-history", (history: ChatMessage[]) => {
          console.log("Received chat history:", history);
          const formattedHistory = history.map((msg) => ({
            ...msg,
            _id: msg._id ? String(msg._id) : undefined,
            senderId: String(msg.senderId),
          }));
          dispatch(setMessages(formattedHistory));
        });

        socket.on("chat", (message: ChatMessage) => {
          console.log("Received new message:", message);
          const formattedMessage = {
            ...message,
            _id: message._id ? String(message._id) : undefined,
            senderId: String(message.senderId),
          };
          dispatch(addMessage(formattedMessage));
        });
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to initialize chat";
      return rejectWithValue(message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { text, imageUrl }: { text?: string; imageUrl?: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { chat: ChatState };
    const { currentOrderId } = state.chat;

    if (!chatSocket || !currentOrderId) {
      return rejectWithValue("Chat not initialized");
    }

    try {
      chatSocket.emit("chat", {
        orderId: currentOrderId,
        text: text || undefined,
        imageUrl: imageUrl || undefined,
      });
      return { text, imageUrl };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to send message";
      return rejectWithValue(message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const newMessage = action.payload;
      // Check if message already exists to avoid duplicates
      if (
        newMessage._id &&
        state.messages.some((msg) => msg._id === newMessage._id)
      ) {
        return;
      }
      state.messages.push(newMessage);
    },
    setPreviewImage: (state, action: PayloadAction<string | null>) => {
      state.previewImage = action.payload;
    },
    setCurrentOrderId: (state, action: PayloadAction<string | null>) => {
      state.currentOrderId = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.previewImage = null;
      state.currentOrderId = null;
      if (chatSocket) {
        chatSocket.disconnect();
        chatSocket = null;
      }
      state.connected = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Chat
      .addCase(initializeChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeChat.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentOrderId = action.payload;
        }
        state.connected = true;
        state.loading = false;
      })
      .addCase(initializeChat.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to initialize chat";
        state.connected = false;
      })

      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.loading = false;
        // Clear preview after sending
        state.previewImage = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to send message";
      });
  },
});

export const {
  setConnected,
  setMessages,
  addMessage,
  setPreviewImage,
  setCurrentOrderId,
  clearChat,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
