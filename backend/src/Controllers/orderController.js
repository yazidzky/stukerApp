// controllers/orderController.js
const mongoose = require("mongoose");
const Order = require("../models/Order");
const OrderHistory = require("../models/OrderHistory");
const User = require("../models/User");
const Chat = require("../models/Chat");

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const createOrder = async (req, res) => {
  try {
    const { pickupLoc, deliveryLoc, description, itemPrice, deliveryFee } =
      req.body;

    // Validasi input
    if (
      !pickupLoc ||
      !deliveryLoc ||
      !description ||
      !itemPrice ||
      !deliveryFee
    ) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    const total = itemPrice + deliveryFee;
    const order = await Order.create({
      customerId: req.userId,
      pickupLoc,
      deliveryLoc,
      description,
      itemPrice,
      deliveryFee,
      totalPrice: total,
    });

    // 📦 Emit socket event untuk memberitahu stuker ada order baru
    const io = req.app.get("io");
    if (io) {
      // Emit ke room stuker-dashboard untuk semua stuker yang sedang online
      io.to("stuker-dashboard").emit("new-order-available", {
        orderId: order.orderId,
        message: "Pesanan baru tersedia",
      });
      console.log(`New order created: ${order.orderId}, notifying stukers in dashboard`);
    }

    res.status(201).json({ message: "Order berhasil dibuat", order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const listAvailable = asyncHandler(async (req, res) => {
  // 🚀 Hanya ambil pesanan yang available & belum punya stuker
  const list = await Order.find({
    status: "searching",
    stukerId: { $exists: false }, // 🚨 Pastikan belum ada stuker
  })
    .select(
      "orderId pickupLoc deliveryLoc description itemPrice deliveryFee totalPrice customerId"
    )
    .populate("customerId", "name profilePicture avgRatingAsUser")
    .sort({ createdAt: -1 }) // 🚀 Urutkan terbaru dulu
    .lean();

  // 🔥 TRANSFORMASI DATA agar sesuai dengan frontend
  const transformedList = list.map((order) => ({
    order_id: order.orderId,
    pickup_location: order.pickupLoc,
    delivery_location: order.deliveryLoc,
    order_description: order.description,
    price_estimation: order.itemPrice,
    delivery_fee: order.deliveryFee,
    total_price_estimation: order.totalPrice,
    customer_name: order.customerId?.name || "Unknown",
    customer_image:
      order.customerId?.profilePicture || "/images/profilePhoto.png",
    customer_rate: Math.round((order.customerId?.avgRatingAsUser || 0) * 10), // Rating dalam format 0-50 (0.0-5.0 * 10)
  }));

  res.json(transformedList);
});

const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID tidak ditemukan",
      });
    }

    // 🛠️ Log untuk debugging
    console.log(`[ACCEPT ORDER] OrderId: ${id}, StukerId: ${req.userId}`);

    // 🚨 1. CARI ORDER DULU (sebelum update)
    const order = await Order.findOne({ orderId: id })
      .populate("customerId", "_id name")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan",
      });
    }

    // 🚨 2. CEK AUTHORIZATION (sebelum update)
    if (order.customerId._id.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Tidak dapat menerima pesanan sendiri",
      });
    }

    // 🚨 3. CEK STATUS (sebelum update)
    if (order.status !== "searching") {
      return res.status(400).json({
        success: false,
        message: `Pesanan tidak tersedia (status: ${order.status})`,
      });
    }

    if (order.stukerId) {
      return res.status(409).json({
        success: false,
        message: "Pesanan sudah diambil stuker lain",
      });
    }

    // 🚨 4. UPDATE ATOMIC (hanya jika semua cek lolos)
    const updatedOrder = await Order.findOneAndUpdate(
      {
        orderId: id,
        status: "searching",
        stukerId: { $exists: false },
      },
      {
        $set: {
          stukerId: req.userId,
          status: "ongoing",
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(400).json({
        success: false,
        message: "Gagal menerima pesanan (race condition)",
      });
    }

    // 💡 Socket emit
    const io = req.app.get("io");
    if (io) {
      io.to(`order:${id}`).emit("order-accepted", {
        orderId: id,
        stukerId: req.userId,
      });
      io.to(`stuker:${req.userId}`).emit("order-accepted-dashboard");
    }

    // 📦 Kirim pesan otomatis ke user
    try {
      const autoMessage = await Chat.create({
        orderId: updatedOrder._id,
        senderId: req.userId, // Stuker yang menerima order
        type: "text",
        text: "📦 Halo! Orderan kamu sedang dalam perjalanan 🚗💨\n\nTunggu sebentar ya, stuker kami akan segera sampai. Terima kasih....",
        time: Date.now(),
      });

      // Kirim pesan melalui socket ke room order
      if (io) {
        io.to(`order:${id}`).emit("chat", {
          _id: String(autoMessage._id),
          senderId: String(req.userId),
          type: "text",
          text: autoMessage.text,
          imageUrl: undefined,
          time: autoMessage.time,
        });
      }

      console.log(`Auto message sent to order ${id} by stuker ${req.userId}`);
    } catch (chatError) {
      console.error("Error sending auto message:", chatError);
      // Jangan gagalkan accept order jika pesan gagal dikirim
    }

    // 🔥 PESAN YANG SESUAI dengan frontend
    res.status(200).json({
      success: true,
      message: "Pesanan diterima", // <-- SAMAKAN dengan ekspektasi frontend
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error accepting order:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const order = await Order.findOne({ orderId: id })
      .populate("customerId", "name profilePicture nim")
      .populate("stukerId", "name profilePicture nim")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    // Check authorization
    const isCustomer = order.customerId?._id?.toString() === req.userId;
    const isStuker = order.stukerId?._id?.toString() === req.userId;

    if (!isCustomer && !isStuker) {
      return res.status(403).json({ message: "Tidak memiliki akses" });
    }

    const transformedOrder = {
      order_id: order.orderId,
      customer_nim: order.customerId?.nim || null,
      customer_name: order.customerId?.name || "Unknown",
      customer_image:
        order.customerId?.profilePicture || "/images/profilePhoto.png",
      stuker_nim: order.stukerId?.nim || null,
      stuker_name: order.stukerId?.name || null,
      stuker_image:
        order.stukerId?.profilePicture || "/images/profilePhoto.png",
      pickup_location: order.pickupLoc,
      delivery_location: order.deliveryLoc,
      order_description: order.description,
      price_estimation: order.itemPrice,
      delivery_fee: order.deliveryFee,
      total_price_estimation: order.totalPrice,
      order_date: order.createdAt.toLocaleDateString("id-ID", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      status: order.status,
      completedAt: order.completedAt,
    };

    res.json(transformedOrder);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Order tidak ditemukan" });
  }
};

const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🚀 Cari order yang ongoing dan user adalah customer atau stuker
    const order = await Order.findOne({
      orderId: id,
      status: "ongoing",
      $or: [
        { customerId: req.userId },
        { stukerId: req.userId }
      ]
    });

    if (!order) {
      return res.status(400).json({
        message:
          "Pesanan tidak ditemukan atau tidak dapat diselesaikan. Pastikan Anda adalah customer atau stuker dari pesanan ini dan status ongoing.",
      });
    }

    // Cek apakah order sudah memiliki stuker (harus sudah di-accept)
    if (!order.stukerId) {
      return res.status(400).json({
        message: "Pesanan belum diambil oleh stuker",
      });
    }

    // Get user details
    const [customer, stuker] = await Promise.all([
      User.findById(order.customerId).select("name profilePicture nim"),
      User.findById(order.stukerId).select("name profilePicture nim"),
    ]);

    if (!customer || !stuker) {
      return res.status(400).json({ message: "Data user tidak ditemukan" });
    }

    // Create single history record
    await OrderHistory.create({
      orderId: order.orderId,
      customerId: order.customerId,
      stukerId: order.stukerId,
      pickupLoc: order.pickupLoc,
      deliveryLoc: order.deliveryLoc,
      description: order.description,
      itemPrice: order.itemPrice,
      deliveryFee: order.deliveryFee,
      totalPrice: order.totalPrice,
      completedAt: new Date(),
      customerName: customer.name,
      customerPicture: customer.profilePicture,
      customerNim: customer.nim, // 🚀 Tambahkan NIM
      stukerName: stuker.name,
      stukerPicture: stuker.profilePicture,
      stukerNim: stuker.nim, // 🚀 Tambahkan NIM
    });

    // Delete chat messages
    await Chat.deleteMany({ orderId: order._id });

    // Update order status
    order.status = "completed";
    order.completedAt = new Date();
    await order.save();

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(`order:${order.orderId}`).emit("order-completed", {
        orderId: order.orderId,
      });
    }

    res.json({ message: "Pesanan berhasil diselesaikan", order });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Cari order dan pastikan user adalah customer yang membuat order
    const order = await Order.findOne({
      orderId: id,
      customerId: req.userId,
      status: { $in: ["searching", "ongoing"] }, // Hanya bisa cancel jika masih searching atau ongoing
    });

    if (!order) {
      return res.status(404).json({
        message: "Pesanan tidak ditemukan atau tidak dapat dibatalkan",
      });
    }

    // Update order status menjadi cancelled
    order.status = "cancelled";
    order.cancelledAt = new Date();
    await order.save();

    // Delete chat messages
    await Chat.deleteMany({ orderId: order._id });

    // Emit socket event untuk memberitahu stuker jika ada
    const io = req.app.get("io");
    if (io) {
      io.to(`order:${order.orderId}`).emit("order-cancelled", {
        orderId: order.orderId,
      });
    }

    res.json({ message: "Pesanan berhasil dibatalkan", order });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const history = async (req, res) => {
  try {
    const { as } = req.query;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate parameter
    if (!as || (as !== "user" && as !== "stuker")) {
      return res.status(200).json({
        success: false,
        error: 'Parameter "as" harus diisi dengan "user" atau "stuker"',
      });
    }

    // Convert req.userId to ObjectId to ensure proper query matching
    let userId;
    try {
      // Try to convert to ObjectId - handle both string and ObjectId formats
      if (mongoose.Types.ObjectId.isValid(req.userId)) {
        userId = new mongoose.Types.ObjectId(req.userId);
      } else {
        console.error("Invalid userId format:", req.userId);
        return res.status(400).json({
          success: false,
          error: "Invalid user ID format",
        });
      }
    } catch (error) {
      console.error("Error converting userId to ObjectId:", error, "userId:", req.userId);
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format",
      });
    }

    // Build query - only fetch completed orders (with completedAt)
    // Use explicit ObjectId comparison
    const match =
      as === "user" 
        ? { 
            customerId: userId, 
            completedAt: { $exists: true, $ne: null } 
          }
        : { 
            stukerId: userId, 
            completedAt: { $exists: true, $ne: null } 
          };

    // Debug logging
    console.log(`[HISTORY] Fetching history for ${as}`);
    console.log(`[HISTORY] req.userId (string): ${req.userId}`);
    console.log(`[HISTORY] userId (ObjectId): ${userId}`);
    console.log(`[HISTORY] match query:`, JSON.stringify(match, null, 2));

    // Fetch data - only completed orders
    const data = await OrderHistory.find(match)
      .select(
        "orderId pickupLoc deliveryLoc totalPrice completedAt customerName stukerName customerPicture stukerPicture customerRating stukerRating"
      )
      .sort({ completedAt: -1 })
      .lean();

    // Debug logging
    console.log(`[HISTORY] Found ${data.length} completed orders`);
    if (data.length > 0) {
      console.log(`[HISTORY] First order sample:`, {
        orderId: data[0].orderId,
        completedAt: data[0].completedAt,
        customerId: data[0].customerId || 'N/A',
        stukerId: data[0].stukerId || 'N/A',
      });
    }

    // Transform data for frontend
    const transformedData = data.map((item) => {
      let rating = null;

      // Extract rating based on user type
      if (as === "user" && item.stukerRating?.stars) {
        rating = {
          stars: item.stukerRating.stars,
          comment: item.stukerRating.comment || "",
          createdAt: item.stukerRating.createdAt || item.completedAt,
        };
      } else if (as === "stuker" && item.customerRating?.stars) {
        rating = {
          stars: item.customerRating.stars,
          comment: item.customerRating.comment || "",
          createdAt: item.customerRating.createdAt || item.completedAt,
        };
      }

      return {
        orderId: item.orderId,
        pickupLoc: item.pickupLoc,
        deliveryLoc: item.deliveryLoc,
        totalPrice: item.totalPrice,
        completedAt: item.completedAt,
        partnerName: as === "user" ? item.stukerName : item.customerName,
        partnerPicture:
          as === "user"
            ? item.stukerPicture || "/images/profilePhoto.png"
            : item.customerPicture || "/images/profilePhoto.png",
        rating: rating,
      };
    });

    res.json({
      success: true,
      history: transformedData,
    });
  } catch (error) {
    console.error("Error in history controller:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: "Internal server error: " + (error.message || "Unknown error"),
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

module.exports = {
  createOrder,
  listAvailable,
  acceptOrder,
  getOrderDetails,
  completeOrder,
  cancelOrder,
  history,
};
