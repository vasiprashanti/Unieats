import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import initializeFirebaseAdmin from "./config/firebaseAdmin.js";
import { cloudinaryConfig } from "./config/cloudinary.js";
import rateLimiter from "./middleware/rateLimiter.js";
// import errorHandler from './middleware/errorHandler.js';
// Import Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import preLaunchUserRoutes from "./routes/preLaunchUserRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import devAuth from "./middleware/devAuth.js";

dotenv.config();
connectDB();
initializeFirebaseAdmin();
cloudinaryConfig();

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // ✅ Allowed origins (local + prod)
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "https://admin.unieats.co",
      "https://vendor.unieats.co",
      "https://user.unieats.co",
    ];

    // Allow localhost with any port
    if (
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
    ) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow Netlify preview deployments
    if (/^https:\/\/.*\.netlify\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow listed domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ❌ Otherwise block
    console.log(`CORS blocked origin: ${origin}`);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(rateLimiter);

// Skip authentication in development - Only for local testing
// if (process.env.SKIP_AUTH === "true") {
//   app.use(devAuth);
// }

// Health check or root endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Unieats backend API is running." });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/vendors", vendorRoutes);
app.use("/api/v1/vendors/menu", menuRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/prelaunch", preLaunchUserRoutes);
app.use("/api/v1/users", userRoutes);

// Error handling for CORS
app.use((err, req, res, next) => {
  if (err.message.includes("Not allowed by CORS")) {
    res.status(403).json({
      error: "CORS Error",
      message: "Origin not allowed",
      origin: req.headers.origin,
    });
  } else {
    next(err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
