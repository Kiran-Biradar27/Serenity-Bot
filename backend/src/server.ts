import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import communityRoutes from './routes/community.routes';

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();
const PORT = process.env.PORT || 5000; // Changed to port 5000

// Middleware
app.use(cors());
// Increase JSON payload size limit to 50MB for handling base64 encoded images and audio
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://xenox9709:password123456789@cluster0.aycmkdr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to SerenityBot API' });
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/community', communityRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 