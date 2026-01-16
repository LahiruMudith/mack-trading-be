import type { Response, Request, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose"; // Changed * as mongoose to default import for cleaner type usage
import userRouter from "./routes/userRouter";
import galleryRouter from "./routes/galleryRouter";
import bodyParser from 'body-parser';
import addressRouter from "./routes/addressRouter";
import itemRouter from "./routes/itemRouter";
import orderRouter from "./routes/orderRouter";
import cartRouter from "./routes/cartRouter";
import chatRouter from "./routes/chatRouter";
import connectDB from "./util/db";
// import paymentRouter from "./routes/paymentRouter"; // Uncomment if needed

dotenv.config();

const MONGO_URI = process.env.MONGO_URL as string;
const SERVER_PORT = process.env.SERVER_PORT || 5000;

const express = require('express');
const app = express();

// --- FIX 1: CORS (Added Localhost back so you can test on your laptop) ---
app.use(cors({
    origin: ["http://localhost:5173", "https://mack-trading-fn-4td6.vercel.app"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// removed duplicate bodyParser (express.json does the same thing), but keeping if you prefer:
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- FIX 2: Database Connection Middleware ---
// This ensures the DB is connected BEFORE any route is hit
let isConnected = false;

// Apply DB Middleware to all API routes
app.use("/mack-trading/api/v1", connectDB);

// --- Routes ---
app.use("/mack-trading/api/v1/user", userRouter);
app.use("/mack-trading/api/v1/gallery", galleryRouter);
app.use("/mack-trading/api/v1/address", addressRouter);
app.use("/mack-trading/api/v1/item", itemRouter);
app.use("/mack-trading/api/v1/order", orderRouter);
// app.use("/mack-trading/api/v1/payment", paymentRouter);
app.use("/mack-trading/api/v1/cart", cartRouter);
app.use("/mack-trading/api/v1/chat", chatRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('BackEnd Running...');
});

// --- FIX 3: Conditional Listen & Export ---
// Only run app.listen if we are NOT in production (Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(SERVER_PORT, () => {
        console.log(`Mack Trading Backend Start with port ${SERVER_PORT}`);
    });
}

// REQUIRED for Vercel
export default app;