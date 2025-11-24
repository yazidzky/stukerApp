require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");

const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PREVIEW,
  "http://localhost:3000",
].filter(Boolean);
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});
app.set("io", io);

(async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
})();

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      let host = "";
      try {
        host = new URL(origin).hostname;
      } catch {}
      const allowed =
        allowedOrigins.includes(origin) || /\.vercel\.app$/.test(host);
      callback(allowed ? null : new Error("CORS"), allowed);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/orders", require("./routes/order"));
app.use("/api/ratings", require("./routes/rating"));

require("./socket/chat")(io);

// Socket.io error handling
io.on("connection_error", (error) => {
  console.error("Socket.io connection error:", error);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Socket.io server ready`);
});
app.get("/", (_req, res) => {
  res.send("OK");
});
