import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import initializeFirebaseAdmin from './config/firebaseAdmin.js';
import { cloudinaryConfig } from './config/cloudinary.js';
import { Server } from 'socket.io';
import http from 'http';
// import rateLimiter from './middleware/rateLimiter.js';
// import errorHandler from './middleware/errorHandler.js';
// Import Routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import preLaunchUserRoutes from './routes/preLaunchUserRoutes.js';
import publicRoutes from './routes/publicRoutes.js'; 
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

dotenv.config();
connectDB();
initializeFirebaseAdmin();
cloudinaryConfig();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // In production, restrict this to your frontend URL
        methods: ["GET", "POST"]
    }
});

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Define allowed origins
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173"
    ];
    
    // Check for localhost variations
    if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      return callback(null, true);
    }
    
    // Check for Vercel domains
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    
    // Check for Netlify domains
    if (/^https:\/\/.*\.netlify\.app$/.test(origin)) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For development, you might want to allow all origins temporarily
    // Uncomment the line below for debugging (remove in production)
    // return callback(null, true);
    
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
    "Origin"
  ],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(rateLimiter);

// Health check or root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Unieats backend API is running.' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/prelaunch', preLaunchUserRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/cart', cartRoutes);

// app.use(errorHandler);

// Make the 'io' instance available to all routes by attaching it to the app
app.set('socketio', io);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // When a user or vendor connects, they should join a room named after their own ID.
    // This allows us to send them targeted, private notifications.
    socket.on('join_room', (id) => {
        socket.join(id);
        console.log(`Socket ${socket.id} joined room ${id}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`));
