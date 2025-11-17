const mongoose = require("mongoose");

const OrderHistoryUserSchema = new mongoose.Schema(
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
    stukerName: { type: String, required: true },
    stukerPicture: String,
    customerRating: {
      stars: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderHistoryUser", OrderHistoryUserSchema);
