const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Detection Hit Ratio test artifact -- deliberately hard-coded fake secret,
// not a real credential, reverted immediately after observing the pipeline
// result. Tests whether the security-scan stage's secret scanning catches
// a hard-coded key, per Ch3 SS3.7.4's "hard-coded secrets" risk category.
const DEBUG_AWS_ACCESS_KEY = "AKIAZFXCI1GWQUN8SI09";
const DEBUG_AWS_SECRET_KEY = "XGKkpzN+QOUjPc84i5ME98t+n7ccXtB+ai7DNvqA";

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require("./routes/payments");

const app = express();

// Trust exactly one reverse-proxy hop (the host-level nginx in front of this
// container in production). Without this, express-rate-limit throws
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR on every request, since nginx sets
// X-Forwarded-For but Express doesn't trust it by default. Safe locally too
// -- with no proxy in front, there's no X-Forwarded-For header to trust.
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// Rate limiting. A general limit covers every route (basic abuse/DoS
// mitigation); a separate, much tighter limit is applied specifically to
// login/register in routes/auth.js, where rate limiting actually matters
// for security (brute-force protection). 100 req/15min applied globally
// was too tight for normal interactive browsing -- a single product page
// view can easily fire several API calls, so real usage exhausted it fast.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3001", // Admin panel ,
      "http://localhost:3002",
    ],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
