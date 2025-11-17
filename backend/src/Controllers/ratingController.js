// controllers/ratingController.js
/**
 * KONSEP RATING TERPISAH:
 * 
 * 1. SETIAP ORDER MEMILIKI 2 RATING TERPISAH:
 *    - customerRating: Rating yang diberikan customer kepada stuker (di OrderHistory)
 *    - stukerRating: Rating yang diberikan stuker kepada customer (di OrderHistory)
 * 
 * 2. USER DAN STUKER BISA MEMBERI RATING SECARA TERPISAH:
 *    - Customer memberi rating → disimpan di OrderHistory.customerRating
 *    - Stuker memberi rating → disimpan di OrderHistory.stukerRating
 * 
 * 3. RATING TER-UPDATE DI PROFIL BERDASARKAN ROLE:
 *    - avgRatingAsStuker: Rata-rata rating ketika user bertindak sebagai stuker
 *    - avgRatingAsUser: Rata-rata rating ketika user bertindak sebagai customer
 *    - Perhitungan menggunakan OrderHistory sebagai source of truth
 * 
 * 4. CONTOH:
 *    - Order A: Customer (User1) → Stuker (User2)
 *      - User1 memberi rating 5 → OrderHistory.customerRating = {stars: 5}
 *      - User2 memberi rating 4 → OrderHistory.stukerRating = {stars: 4}
 *      - User2.avgRatingAsStuker diupdate berdasarkan customerRating dari semua order
 *      - User1.avgRatingAsUser diupdate berdasarkan stukerRating dari semua order
 */
const mongoose = require("mongoose");
const RatingStuker = require("../models/RatingStuker");
const RatingUser = require("../models/RatingUser");
const Order = require("../models/Order");
const OrderHistory = require("../models/OrderHistory");
const User = require("../models/User");

/**
 * Helper function untuk menghitung dan update rating user
 * @param {String} userId - ID user yang ratingnya akan dihitung ulang
 * @param {String} role - 'stuker' atau 'user' - role yang akan dihitung
 */
const recalculateUserRating = async (userId, role) => {
  const user = await User.findById(userId);
  if (!user) {
    console.error(`User dengan ID ${userId} tidak ditemukan untuk recalculate rating`);
    return;
  }

  // Convert userId to ObjectId untuk memastikan query benar
  const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

  let totalStarsForRole = 0;
  let countForRole = 0;

  if (role === "stuker") {
    // Rating untuk stuker: ambil dari OrderHistory dimana stukerId = userId
    // dan customerRating ada (karena customer yang memberi rating kepada stuker)
    const orderHistories = await OrderHistory.find({
      stukerId: userObjectId,
      "customerRating.stars": { $exists: true, $ne: null, $gte: 1, $lte: 5 }
    }).select("orderId customerRating").lean();

    const processedOrderIds = new Set();
    
    orderHistories.forEach((history) => {
      // Gunakan orderId sebagai unique identifier
      const orderIdStr = history.orderId?.toString();
      
      if (!orderIdStr || processedOrderIds.has(orderIdStr)) {
        return;
      }
      
      if (history.customerRating && typeof history.customerRating.stars === 'number' && 
          history.customerRating.stars >= 1 && history.customerRating.stars <= 5) {
        totalStarsForRole += history.customerRating.stars;
        countForRole += 1;
        processedOrderIds.add(orderIdStr);
      }
    });
    
    console.log(`[RATING] Recalculate ${role} for user ${userId}: found ${countForRole} ratings from ${orderHistories.length} order histories`);

    user.totalRatingAsStuker = totalStarsForRole;
    user.countRatingAsStuker = countForRole;
    user.avgRatingAsStuker = countForRole > 0
      ? parseFloat((totalStarsForRole / countForRole).toFixed(1))
      : 0;
  } else {
    // Rating untuk user: ambil dari OrderHistory dimana customerId = userId
    // dan stukerRating ada (karena stuker yang memberi rating kepada customer)
    const orderHistories = await OrderHistory.find({
      customerId: userObjectId,
      "stukerRating.stars": { $exists: true, $ne: null, $gte: 1, $lte: 5 }
    }).select("orderId stukerRating").lean();

    const processedOrderIds = new Set();
    
    orderHistories.forEach((history) => {
      // Gunakan orderId sebagai unique identifier
      const orderIdStr = history.orderId?.toString();
      
      if (!orderIdStr || processedOrderIds.has(orderIdStr)) {
        return;
      }
      
      if (history.stukerRating && typeof history.stukerRating.stars === 'number' && 
          history.stukerRating.stars >= 1 && history.stukerRating.stars <= 5) {
        totalStarsForRole += history.stukerRating.stars;
        countForRole += 1;
        processedOrderIds.add(orderIdStr);
      }
    });
    
    console.log(`[RATING] Recalculate ${role} for user ${userId}: found ${countForRole} ratings from ${orderHistories.length} order histories`);

    user.totalRatingAsUser = totalStarsForRole;
    user.countRatingAsUser = countForRole;
    user.avgRatingAsUser = countForRole > 0
      ? parseFloat((totalStarsForRole / countForRole).toFixed(1))
      : 0;
  }

  // Update legacy fields (untuk backward compatibility)
  const allOrderHistories = await OrderHistory.find({
    $or: [
      { customerId: userObjectId, "customerRating.stars": { $exists: true, $ne: null, $gte: 1, $lte: 5 } },
      { stukerId: userObjectId, "stukerRating.stars": { $exists: true, $ne: null, $gte: 1, $lte: 5 } }
    ]
  }).lean();

  let totalStarsLegacy = 0;
  let countLegacy = 0;
  const processedOrderIds = new Set();

  allOrderHistories.forEach((history) => {
    const orderIdStr = history.orderId?.toString();
    
    if (!orderIdStr || processedOrderIds.has(orderIdStr)) {
      return;
    }
    
    // Jika user adalah customer, ambil customerRating
    if (history.customerId && history.customerId.toString() === userId.toString() && 
        history.customerRating && typeof history.customerRating.stars === 'number' &&
        history.customerRating.stars >= 1 && history.customerRating.stars <= 5) {
      totalStarsLegacy += history.customerRating.stars;
      countLegacy += 1;
      processedOrderIds.add(orderIdStr);
    }
    // Jika user adalah stuker, ambil stukerRating
    else if (history.stukerId && history.stukerId.toString() === userId.toString() && 
             history.stukerRating && typeof history.stukerRating.stars === 'number' &&
             history.stukerRating.stars >= 1 && history.stukerRating.stars <= 5) {
      totalStarsLegacy += history.stukerRating.stars;
      countLegacy += 1;
      processedOrderIds.add(orderIdStr);
    }
  });

  user.totalRating = totalStarsLegacy;
  user.countRating = countLegacy;
  user.avgRating = countLegacy > 0
    ? parseFloat((totalStarsLegacy / countLegacy).toFixed(1))
    : 0;

  await user.save();
};

const createRating = async (req, res) => {
  try {
    const { orderId, stars, comment } = req.body;
    const raterId = req.userId;

    // Validasi input
    if (!orderId || !stars || stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: "Data rating tidak valid",
      });
    }

    // Cari order yang sudah completed
    const order = await Order.findOne({ orderId, status: "completed" });
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order tidak ditemukan atau belum selesai",
      });
    }

    // Cek apakah user berhak memberi rating
    const isCustomer = order.customerId.toString() === raterId;
    const isStuker = order.stukerId?.toString() === raterId;

    if (!isCustomer && !isStuker) {
      return res.status(403).json({
        success: false,
        message: "Tidak berhak memberi rating pada order ini",
      });
    }

    // Tentukan siapa yang di-rating
    const rateeId = isCustomer ? order.stukerId : order.customerId;

    // Gunakan model yang sesuai: RatingStuker jika customer rate stuker, RatingUser jika stuker rate customer
    const RatingModel = isCustomer ? RatingStuker : RatingUser;

    // Use findOneAndUpdate with upsert to handle race conditions
    // This ensures atomic operation and prevents duplicate key errors
    const rating = await RatingModel.findOneAndUpdate(
      {
        orderId: order._id,
        raterId,
      },
      {
        orderId: order._id,
        raterId,
        rateeId,
        stars,
        comment: comment?.trim(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // Update OrderHistory dengan rating
    const ratingField = isCustomer ? "customerRating" : "stukerRating";
    await OrderHistory.findOneAndUpdate(
      { orderId: order.orderId },
      {
        $set: {
          [ratingField]: {
            stars,
            comment: comment?.trim(),
            createdAt: new Date(),
          },
        },
      },
      { upsert: false, new: true }
    );

    // Tentukan role yang di-rating berdasarkan siapa yang memberi rating
    // Jika customer yang memberi rating, berarti stuker yang di-rating (sebagai stuker)
    // Jika stuker yang memberi rating, berarti customer yang di-rating (sebagai user)
    const rateeRatingRole = isCustomer ? "stuker" : "user";
    
    // Tentukan role untuk rater (yang memberi rating) berdasarkan role mereka di order
    // Jika customer yang memberi rating, berarti customer perlu di-recalculate sebagai user
    // Jika stuker yang memberi rating, berarti stuker perlu di-recalculate sebagai stuker
    const raterRatingRole = isCustomer ? "user" : "stuker";

    // Recalculate rating untuk ratee (yang di-rating) - ini penting untuk update rating setelah rating baru
    await recalculateUserRating(rateeId, rateeRatingRole);
    
    // Recalculate rating untuk rater (yang memberi rating) - ini penting untuk update rating
    // jika ada rating baru dari pihak lain yang sudah ada sebelumnya
    // Contoh: Stuker memberi rating duluan → rating user terupdate
    //         User memberi rating setelahnya → rating stuker terupdate, tapi rating user juga perlu di-recalculate
    //         untuk memastikan rating user terupdate dengan rating dari stuker yang sudah ada sebelumnya
    await recalculateUserRating(raterId, raterRatingRole);

    // Ambil ratee dan rater untuk response (keduanya sudah di-recalculate)
    const ratee = await User.findById(rateeId);
    const rater = await User.findById(raterId);
    
    if (!ratee) {
      return res.status(404).json({
        success: false,
        message: "User yang di-rating tidak ditemukan",
      });
    }

    if (!rater) {
      return res.status(404).json({
        success: false,
        message: "User yang memberi rating tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Rating berhasil disimpan",
      data: {
        orderId,
        stars,
        comment,
        // Return rating untuk ratee (yang di-rating)
        rateeRating: rateeRatingRole === "stuker" ? ratee.avgRatingAsStuker : ratee.avgRatingAsUser,
        rateeCountRating: rateeRatingRole === "stuker" ? ratee.countRatingAsStuker : ratee.countRatingAsUser,
        // Return rating untuk rater (yang memberi rating) - untuk memastikan rating terupdate
        raterRating: raterRatingRole === "stuker" ? rater.avgRatingAsStuker : rater.avgRatingAsUser,
        raterCountRating: raterRatingRole === "stuker" ? rater.countRatingAsStuker : rater.countRatingAsUser,
        // Legacy field untuk backward compatibility
        avgRating: rateeRatingRole === "stuker" ? ratee.avgRatingAsStuker : ratee.avgRatingAsUser,
      },
    });
  } catch (error) {
    console.error("Error creating rating:", error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Anda sudah memberi rating untuk order ini. Silakan refresh halaman.",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getOrderRatingData = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    // Cari order
    const order = await Order.findOne({ orderId, status: "completed" });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    // Cek apakah user terlibat dalam order ini
    const isCustomer = order.customerId.toString() === userId;
    const isStuker = order.stukerId?.toString() === userId;

    if (!isCustomer && !isStuker) {
      return res.status(403).json({
        success: false,
        message: "Tidak berhak mengakses data order ini",
      });
    }

    // Ambil data user yang akan di-rating
    const rateeId = isCustomer ? order.stukerId : order.customerId;
    const ratee = await User.findById(rateeId).select("name profilePicture");

    if (!ratee) {
      return res.status(404).json({
        success: false,
        message: "Data user tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        pickupLocation: order.pickupLoc,
        deliveryLocation: order.deliveryLoc,
        rateeName: ratee.name,
        rateeImage: ratee.profilePicture || "/images/profilePhoto.png",
      },
    });
  } catch (error) {
    console.error("Error fetching order rating data:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getUserRating = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select("avgRating countRating avgRatingAsUser countRatingAsUser avgRatingAsStuker countRatingAsStuker role");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Tentukan rating yang akan ditampilkan berdasarkan role
    const hasStukerRole = user.role && user.role.includes("stuker");
    const hasUserRole = user.role && user.role.includes("user");
    
    let displayRating = user.avgRating || 0;
    let displayCountRating = user.countRating || 0;
    
    // Jika user memiliki role stuker, prioritaskan rating sebagai stuker
    if (hasStukerRole) {
      displayRating = user.avgRatingAsStuker || 0;
      displayCountRating = user.countRatingAsStuker || 0;
    } else if (hasUserRole) {
      displayRating = user.avgRatingAsUser || 0;
      displayCountRating = user.countRatingAsUser || 0;
    }

    res.json({
      success: true,
      data: {
        // Rating berdasarkan role
        avgRatingAsUser: user.avgRatingAsUser || 0,
        countRatingAsUser: user.countRatingAsUser || 0,
        avgRatingAsStuker: user.avgRatingAsStuker || 0,
        countRatingAsStuker: user.countRatingAsStuker || 0,
        // Legacy fields (untuk backward compatibility)
        avgRating: displayRating,
        countRating: displayCountRating,
      },
    });
  } catch (error) {
    console.error("Error fetching user rating:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { createRating, getUserRating, getOrderRatingData };
