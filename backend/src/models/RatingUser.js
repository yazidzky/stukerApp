const mongoose = require("mongoose");

const RatingUserSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    raterId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    rateeId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    stars: { type: Number, min: 1, max: 5, required: true },
    comment: String,
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate ratings per order per rater
RatingUserSchema.index({ orderId: 1, raterId: 1 }, { unique: true });

module.exports = mongoose.model("RatingUser", RatingUserSchema);
