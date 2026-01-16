// db.js
import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config()

const connectDB = async () => {
    // If we are already connected, don't connect again
    if (mongoose.connections[0].readyState) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw new Error('Database connection failed');
    }
};

export default connectDB;