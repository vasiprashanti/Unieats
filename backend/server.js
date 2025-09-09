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
import prelaunchRoutes from './routes/preLaunchUserRoutes.js';

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

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(rateLimiter);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/prelaunch', prelaunchRoutes); 

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
