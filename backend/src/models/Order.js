const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      default: () => nanoid(8).toUpperCase(),
      unique: true, // 🚨 Penting! Hindari duplikat
      index: true, // 🚀 Index untuk performa
    },
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // 🚀 Index untuk query cepat
    },
    stukerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      index: true, // 🚀 Index untuk query cepat
    },
    pickupLoc: { type: String, required: true },
    deliveryLoc: { type: String, required: true },
    description: { type: String, required: true },
    itemPrice: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["searching", "ongoing", "completed", "cancelled"],
      default: "searching",
      index: true, // 🚀 Index untuk filter status
    },
    completedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

// 🚀 Compound index untuk query listAvailable
OrderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Order", OrderSchema);
