// socket/chat.js
const jwt = require("jsonwebtoken");
const Chat = require("../models/Chat");
const Order = require("../models/Order");

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      socket.userId = jwt.verify(token, process.env.JWT_SECRET).id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-order", async (orderId) => {
      try {
        // Find the order
        const order = await Order.findOne({ orderId });
        
        if (!order) {
          console.error(`Order not found: ${orderId}`);
          socket.emit("error", { message: "Order not found" });
          return;
        }

        // Verify that the user is either the customer or stuker of this order
        const userId = socket.userId.toString();
        const customerId = order.customerId.toString();
        const stukerId = order.stukerId ? order.stukerId.toString() : null;

        // Customer can always join, stuker can only join if they are assigned to this order
        const isAuthorized = userId === customerId || (stukerId && userId === stukerId);

        if (!isAuthorized) {
          console.error(`Unauthorized access attempt: User ${userId} trying to access order ${orderId}`);
          socket.emit("error", { message: "Unauthorized: You are not part of this order" });
          return;
        }

        // Join the room
        socket.join(`order:${orderId}`);
        console.log(`User ${userId} joined order room: ${orderId}`);

        // Send existing chat messages when joining
        const messages = await Chat.find({ orderId: order._id }).sort({
          time: 1,
        });
        
        // Convert senderId to string for consistency
        const formattedMessages = messages.map((msg) => ({
          _id: String(msg._id),
          senderId: String(msg.senderId),
          type: msg.type,
          text: msg.text,
          imageUrl: msg.imageUrl,
          time: msg.time,
        }));
        
        socket.emit("chat-history", formattedMessages);
      } catch (error) {
        console.error("Error in join-order:", error);
        socket.emit("error", { message: "Error joining order chat" });
      }
    });

    socket.on("chat", async ({ orderId, text, imageUrl }) => {
      try {
        const order = await Order.findOne({ orderId });
        
        if (!order) {
          console.error(`Order not found for chat: ${orderId}`);
          socket.emit("error", { message: "Order not found" });
          return;
        }

        // Verify that the user is either the customer or stuker of this order
        const userId = socket.userId.toString();
        const customerId = order.customerId.toString();
        const stukerId = order.stukerId ? order.stukerId.toString() : null;

        // Customer can always send messages, stuker can only send if they are assigned to this order
        const isAuthorized = userId === customerId || (stukerId && userId === stukerId);

        if (!isAuthorized) {
          console.error(`Unauthorized chat attempt: User ${userId} trying to send message to order ${orderId}`);
          socket.emit("error", { message: "Unauthorized: You are not part of this order" });
          return;
        }

        // Validate that at least text or imageUrl is provided
        if (!text && !imageUrl) {
          socket.emit("error", { message: "Message must contain text or image" });
          return;
        }

        const message = await Chat.create({
          orderId: order._id,
          senderId: socket.userId,
          type: text && imageUrl ? "text-image" : text ? "text" : "image",
          text: text || undefined,
          imageUrl: imageUrl || undefined,
          time: Date.now(),
        });

        console.log(`Message sent by ${userId} to order ${orderId}`);

        // Convert senderId to string for consistency
        io.to(`order:${orderId}`).emit("chat", {
          _id: String(message._id),
          senderId: String(socket.userId),
          type: text && imageUrl ? "text-image" : text ? "text" : "image",
          text: text || undefined,
          imageUrl: imageUrl || undefined,
          time: message.time,
        });
      } catch (error) {
        console.error("Error saving chat message:", error);
        socket.emit("error", { message: "Error sending message" });
      }
    });

    // Listen for order acceptance
    socket.on("order-accepted", (orderId) => {
      // Notify the customer that their order has been accepted
      io.to(`order:${orderId}`).emit("order-accepted", { orderId });
    });

    // Join stuker dashboard room untuk menerima notifikasi order baru
    socket.on("join-stuker-dashboard", () => {
      socket.join("stuker-dashboard");
      console.log(`Stuker ${socket.userId} joined dashboard room`);
    });

    // Leave stuker dashboard room
    socket.on("leave-stuker-dashboard", () => {
      socket.leave("stuker-dashboard");
      console.log(`Stuker ${socket.userId} left dashboard room`);
    });
  });
};
