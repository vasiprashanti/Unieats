import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import initializeFirebaseAdmin from './config/firebaseAdmin.js';
import { cloudinaryConfig } from './config/cloudinary.js';
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

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/prelaunch', preLaunchUserRoutes); 

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`));
