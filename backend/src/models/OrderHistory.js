// models/OrderHistory.js
const mongoose = require("mongoose");

const OrderHistorySchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    stukerId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    pickupLoc: { type: String, required: true },
    deliveryLoc: { type: String, required: true },
    description: { type: String, required: true },
    itemPrice: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    completedAt: { type: Date, required: true },
    customerName: { type: String, required: true },
    customerPicture: String,
    customerNim: String, // 🚀 Tambahkan NIM
    stukerName: { type: String, required: true },
    stukerPicture: String,
    stukerNim: String, // 🚀 Tambahkan NIM
    customerRating: {
      stars: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: Date,
    },
    stukerRating: {
      stars: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: Date,
    },
  },
  { timestamps: true }
);

// Index untuk performance
OrderHistorySchema.index({ customerId: 1, completedAt: -1 });
OrderHistorySchema.index({ stukerId: 1, completedAt: -1 });

module.exports = mongoose.model("OrderHistory", OrderHistorySchema);
