const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    nim: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      minlength: 10,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    profilePicture: { type: String, default: "" },
    role: { type: [String], enum: ["user", "stuker"], default: ["user"] },
    // Rating sebagai user (customer)
    avgRatingAsUser: { type: Number, default: 0.0 }, // rata-rata rating sebagai user
    totalRatingAsUser: { type: Number, default: 0 }, // total rating sebagai user
    countRatingAsUser: { type: Number, default: 0 }, // berapa kali dirating sebagai user
    // Rating sebagai stuker
    avgRatingAsStuker: { type: Number, default: 0.0 }, // rata-rata rating sebagai stuker
    totalRatingAsStuker: { type: Number, default: 0 }, // total rating sebagai stuker
    countRatingAsStuker: { type: Number, default: 0 }, // berapa kali dirating sebagai stuker
    // Legacy fields (untuk backward compatibility)
    avgRating: { type: Number, default: 0.0 }, // rata-rata rating 0.0-5.0
    totalRating: { type: Number, default: 0 }, // jumlah rating
    countRating: { type: Number, default: 0 }, // berapa kali dirating
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", UserSchema);
