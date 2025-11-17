const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Types.ObjectId, ref: "Order", required: true },
    senderId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["text", "image", "text-image"],
      default: "text",
    },
    text: { type: String },
    imageUrl: { type: String },
    time: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
