const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Order = require("../models/Order");

const register = async (req, res) => {
  try {
    const { nim, name, phone, password, confirmPassword } = req.body;
    if (!nim || !name || !phone || !password)
      return res.status(400).json({ message: "Register Gagal" });
    if (password !== confirmPassword)
      return res
        .status(400)
        .json({ message: "Konfirmasi kata sandi tidak cocok" });
    if (nim.length < 10)
      return res.status(400).json({ message: "Nim tidak valid" });
    if (password.length < 8)
      return res
        .status(400)
        .json({ message: "Password kurang dari 8 karakter" });
    const exists = await User.findOne({ nim });
    if (exists) return res.status(400).json({ message: "Nim tidak valid" });
    const user = new User({ nim, name, phone, password });
    await user.save();
    res.json({ message: "Registrasi Berhasil" });
  } catch {
    res.status(500).json({ message: "Server dalam Gangguan" });
  }
};

const login = async (req, res) => {
  try {
    const { nim, password } = req.body;
    if (!nim || !password)
      return res.status(400).json({ message: "NIM dan Password wajib diisi" });
    const user = await User.findOne({ nim });
    if (!user)
      return res.status(400).json({
        message: "Akun tidak ditemukan, silakan registrasi terlebih dahulu",
      });
    const match = await user.comparePassword(password);
    if (!match)
      return res
        .status(400)
        .json({ message: "Password yang Anda masukkan salah" });
    const orders = await Order.find({
      $or: [{ stukerId: user._id }, { customerId: user._id }],
    }).lean();
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      message: "login berhasil",
      users: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        profile_picture: user.profilePicture,
        order_history: orders,
        // Rating berdasarkan role
        avgRatingAsUser: user.avgRatingAsUser || 0,
        countRatingAsUser: user.countRatingAsUser || 0,
        avgRatingAsStuker: user.avgRatingAsStuker || 0,
        countRatingAsStuker: user.countRatingAsStuker || 0,
        // Legacy fields (untuk backward compatibility)
        avgRating: user.avgRating || 0,
        countRating: user.countRating || 0,
      },
      token,
      role: user.role,
    });
  } catch {
    res.status(500).json({
      message: "Server sedang dalam gangguan, silakan coba lagi nanti",
    });
  }
};

const switchRole = async (req, res) => {
  try {
    const { targetRole } = req.body;
    if (!["user", "stuker"].includes(targetRole))
      return res.status(400).json({ message: "Role tidak valid" });
    const user = await User.findById(req.userId);
    if (!user.role.includes(targetRole)) {
      user.role.push(targetRole);
      await user.save();
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ message: "Beralih berhasil", token, role: user.role });
  } catch {
    res.status(500).json({ message: "Server sedang dalam gangguan" });
  }
};

const logout = (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout berhasil" });
};

module.exports = { register, login, switchRole, logout };
