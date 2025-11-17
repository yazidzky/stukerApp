// controllers/profileController.js
const User = require("../models/User");
const RatingStuker = require("../models/RatingStuker");
const RatingUser = require("../models/RatingUser");
const cloudinary = require("../config/cloudinary");

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const editProfile = async (req, res) => {
  try {
    const { name, phone, profilePicture } = req.body;

    // Validasi input
    if (!name && !phone && !profilePicture) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada data yang diperbarui",
      });
    }

    let picUrl = profilePicture;

    // Upload gambar ke Cloudinary jika ada
    if (profilePicture && profilePicture.startsWith("data:image")) {
      try {
        // Extract base64 and MIME type with better error handling
        const base64Match = profilePicture.split(",");
        if (!base64Match || base64Match.length < 2) {
          return res.status(400).json({
            success: false,
            message: "Format gambar tidak valid",
            error: "Base64 data tidak ditemukan",
          });
        }

        const base64 = base64Match[1];
        if (!base64 || base64.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: "Format gambar tidak valid",
            error: "Data base64 kosong",
          });
        }

        // Extract MIME type with better regex
        const mimeMatch = profilePicture.match(/data:(image\/[^;]+);base64/);
        if (!mimeMatch || !mimeMatch[1]) {
          return res.status(400).json({
            success: false,
            message: "Format gambar tidak valid",
            error: "MIME type tidak ditemukan",
          });
        }

        const mime = mimeMatch[1];
        
        // Validate MIME type
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimes.includes(mime.toLowerCase())) {
          return res.status(400).json({
            success: false,
            message: "Format gambar tidak didukung",
            error: `Format ${mime} tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP`,
          });
        }

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(
          `data:${mime};base64,${base64}`,
          {
            folder: "profiles",
            width: 100,
            height: 100,
            crop: "fill",
            quality: "auto",
            fetch_format: "auto",
          }
        );

        if (!uploadResult || !uploadResult.secure_url) {
          throw new Error("Upload berhasil tetapi URL tidak diterima dari Cloudinary");
        }

        picUrl = uploadResult.secure_url;
        console.log("Gambar berhasil diupload ke Cloudinary:", picUrl);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", {
          message: uploadError.message,
          code: uploadError.code,
          errno: uploadError.errno,
          syscall: uploadError.syscall,
          hostname: uploadError.hostname,
          error: uploadError,
          stack: uploadError.stack,
        });
        
        // Provide more specific error messages based on error type
        let errorMessage = "Gagal upload gambar";
        let statusCode = 500;
        
        // Check for network/DNS errors
        if (uploadError.code === 'ENOTFOUND' || uploadError.code === 'ECONNREFUSED' || uploadError.code === 'ETIMEDOUT') {
          errorMessage = "Tidak dapat terhubung ke server Cloudinary. Periksa koneksi internet Anda atau hubungi administrator";
          statusCode = 503; // Service Unavailable
        } else if (uploadError.code === 'EAI_AGAIN') {
          errorMessage = "Gagal menyelesaikan alamat server. Periksa koneksi internet Anda";
          statusCode = 503;
        } else if (uploadError.message) {
          if (uploadError.message.includes("Invalid image file") || uploadError.message.includes("Invalid")) {
            errorMessage = "File gambar tidak valid";
            statusCode = 400;
          } else if (uploadError.message.includes("File size too large") || uploadError.message.includes("too large")) {
            errorMessage = "Ukuran file terlalu besar";
            statusCode = 400;
          } else if (uploadError.message.includes("Invalid API key") || 
                     uploadError.message.includes("Unauthorized") ||
                     uploadError.message.includes("401")) {
            errorMessage = "Konfigurasi Cloudinary tidak valid. Silakan hubungi administrator";
            statusCode = 500;
          } else if (uploadError.message.includes("ENOTFOUND") || uploadError.message.includes("getaddrinfo")) {
            errorMessage = "Tidak dapat terhubung ke server Cloudinary. Periksa koneksi internet Anda";
            statusCode = 503;
          }
        }

        return res.status(statusCode).json({
          success: false,
          message: errorMessage,
          error: uploadError.message || "Unknown error",
          code: uploadError.code || undefined,
        });
      }
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (picUrl !== undefined) updateData.profilePicture = picUrl;

    // Update user
    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Profil berhasil diperbarui",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        role: user.role,
        // Rating berdasarkan role
        avgRatingAsUser: user.avgRatingAsUser || 0,
        countRatingAsUser: user.countRatingAsUser || 0,
        avgRatingAsStuker: user.avgRatingAsStuker || 0,
        countRatingAsStuker: user.countRatingAsStuker || 0,
        // Legacy fields (untuk backward compatibility)
        avgRating: user.avgRating || 0,
        countRating: user.countRating || 0,
      },
    });
  } catch (error) {
    console.error("Error saat edit profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Ambil ratings dengan pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter: ambil rating untuk user ini (sebagai ratee)
    // Ambil dari kedua koleksi: RatingStuker (ketika user di-rate sebagai stuker) 
    // dan RatingUser (ketika user di-rate sebagai customer)
    const filter = { rateeId: req.userId };

    // Ambil ratings dari kedua koleksi
    const [ratingsStuker, ratingsUser] = await Promise.all([
      RatingStuker.find(filter)
        .populate("raterId", "name profilePicture role")
        .populate("orderId", "orderId")
        .sort({ createdAt: -1 })
        .lean(),
      RatingUser.find(filter)
        .populate("raterId", "name profilePicture role")
        .populate("orderId", "orderId")
        .sort({ createdAt: -1 })
        .lean()
    ]);

    // Gabungkan dan urutkan berdasarkan createdAt
    const allRatings = [...ratingsStuker, ...ratingsUser]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Hitung total untuk pagination
    const totalRatings = allRatings.length;

    // Ambil data dengan pagination
    const ratings = allRatings.slice(skip, skip + limit);

    // Transform data rating
    const transformedRatings = ratings.map((rating) => ({
      _id: rating._id,
      orderId: rating.orderId?.orderId || "N/A", // Ambil string orderId
      rater: {
        _id: rating.raterId._id,
        name: rating.raterId.name,
        profilePicture:
          rating.raterId.profilePicture || "/images/profilePhoto.png",
        role: rating.raterId.role,
      },
      stars: rating.stars,
      comment: rating.comment,
      createdAt: rating.createdAt,
    }));

    // Tentukan rating yang akan ditampilkan berdasarkan role
    // Jika user memiliki role "stuker", tampilkan rating sebagai stuker
    // Jika user hanya memiliki role "user", tampilkan rating sebagai user
    const hasStukerRole = user.role && user.role.includes("stuker");
    const hasUserRole = user.role && user.role.includes("user");
    
    // Default rating berdasarkan role yang dimiliki
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
      user: {
        _id: user._id,
        nim: user.nim,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        role: user.role,
        // Rating berdasarkan role
        avgRatingAsUser: user.avgRatingAsUser || 0,
        countRatingAsUser: user.countRatingAsUser || 0,
        avgRatingAsStuker: user.avgRatingAsStuker || 0,
        countRatingAsStuker: user.countRatingAsStuker || 0,
        // Legacy fields (untuk backward compatibility)
        avgRating: displayRating,
        countRating: displayCountRating,
      },
      ratings: {
        data: transformedRatings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalRatings / limit),
          totalItems: totalRatings,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error saat get profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { editProfile, getProfile };
