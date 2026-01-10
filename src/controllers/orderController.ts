import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { Order, OrderStatus, PaymentStatus } from '../models/Order';
import { Cart } from '../models/cart';
import { sendOrderConfirmationEmail } from '../util/emailService';
import {authRequest} from "../middelware/auth";

// --- Helper: Generate MD5 Hash for PayHere ---
const md5 = (text: string) => {
    return crypto.createHash('md5').update(text).digest('hex').toUpperCase();
};

// --- Helper: Generate Random Tracking Number ---
const generateTrackingNumber = () => {
    return 'TRK-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};

// --- Controller: Create Order & Init Payment ---
export const createOrder = async (req: authRequest, res: Response) => {
    // Start a MongoDB session for transaction safety
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = req.user; // Assumes auth middleware attaches user
        const { address_id } = req.body;

        // 1. Validate Address
        if (!address_id) {
            return res.status(400).json({ message: "Address is required" });
        }

        // 2. Fetch User's Cart (Populate product details)
        const cart = await Cart.findOne({ user: user._id }).populate('items.product');

        if (!cart) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // 3. Calculate Total & Prepare Order Items (Securely)
        let totalAmount = 0;
        const orderItems = [];

        for (const cartItem of cart.items) {
            const product: any = cartItem.product;

            if (!product) {
                throw new Error(`Product not found for item in cart`);
            }

            const itemTotal = product.price * cartItem.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                item: product._id,
                qty: cartItem.quantity,
                // Optional: Save snapshot of price/name here if your schema allows
            });
        }

        // 4. Create the Order Object
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // Est. 5 days

        const newOrder = new Order({
            user_id: user._id,
            address_id: address_id,
            items: orderItems,
            totalAmount: totalAmount,
            status: OrderStatus.PLACED,
            payment_status: PaymentStatus.PAID,
            tracking_number: generateTrackingNumber(),
            est_delivery: estimatedDelivery
        });

        // 5. Save Order to Database
        await newOrder.save();

        // 6. Send Confirmation Email (Non-blocking)
        try {
            // Populate the order items again just for the email (to get names)
            const populatedOrder = await newOrder.populate('items.item');
            await sendOrderConfirmationEmail(user.email, populatedOrder, user);
        } catch (emailErr) {
            console.error("Email sending failed (non-critical):", emailErr);
        }

        // 7. Generate PayHere Payment Data
        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

        if (!merchantId || !merchantSecret) {
            throw new Error("PayHere credentials missing in .env");
        }

        const orderId = newOrder._id.toString(); // Use the MongoDB Order ID
        const amountFormatted = totalAmount.toFixed(2);
        const currency = 'LKR';

        // Hashing Logic
        const hashedSecret = md5(merchantSecret).toUpperCase();
        const hash = md5(merchantId + orderId + amountFormatted + currency + hashedSecret).toUpperCase();

        // 8. Commit Transaction
        await session.commitTransaction();
        session.endSession();

        // 9. Return Response to Frontend
        res.status(201).json({
            message: "Order created successfully",
            order_id: newOrder._id,

            // This object goes directly to window.payhere.startPayment()
            payhere_data: {
                merchant_id: merchantId,
                order_id: orderId,
                amount: amountFormatted,
                currency: currency,
                hash: hash,
                items: `Order ${newOrder.tracking_number}`,
                first_name: user.firstName || "Customer",
                last_name: user.lastName || "",
                email: user.email,
                phone: user.phone || "",
                address: "Fetch from DB if needed",
                city: "Colombo",
                country: "Sri Lanka",

                // URLs
                return_url: "http://localhost:5173/payment/success",
                cancel_url: "http://localhost:5173/payment/cancel",
                notify_url: "https://1601833f746b.ngrok-free.app/mack-trading/api/v1/order/notify",
            }
        });

    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        console.error("Create Order Error:", error);
        res.status(500).json({ message: "Failed to create order", error: error.message });
    }
};

export const notifyPayment = async (req: Request, res: Response) => {
    try {
        // 1. PayHere sends data as FORM DATA, not JSON. Ensure you used express.urlencoded() middleware.
        const {
            merchant_id,
            order_id,
            payment_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig
        } = req.body;

        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET as string;
        // 2. Generate Local Hash to verify authenticity
        const hashedSecret = md5(merchantSecret).toUpperCase();
        const localMd5Sig = md5(
            merchant_id +
            order_id +
            payhere_amount +
            payhere_currency +
            status_code +
            hashedSecret
        ).toUpperCase();

        // 3. Compare Signatures
        if (localMd5Sig !== md5sig) {
            console.error("Security Error: MD5 Signature mismatch");
            return res.status(400).send("Signature Mismatch"); // Stop processing
        }

        // 4. Update Database
        // Status "2" means Success
        if (status_code === "2") {
            const updatedOrder = await Order.findByIdAndUpdate(order_id, {
                status: OrderStatus.PLACED,
                payment_status: PaymentStatus.PAID
            }, { new: true });

            if (updatedOrder) {
                console.log(`Payment Success: Order ${order_id} marked as PAID.`);
            } else {
                console.error(`Order ${order_id} not found.`);
            }
        } else {
            console.log(`Payment Failed/Cancelled for Order ${order_id}. Status: ${status_code}`);
        }

        // 5. Acknowledge PayHere (Must allow them to close the connection)
        res.status(200).send("OK");

    } catch (error) {
        console.error("Notify Error:", error);
        res.status(500).send("Error");
    }
};

export const getUserOrders = async (req: any, res: Response) => {
    try {
        const user = req.user;

        // Fetch orders for this user
        // Sort by date descending (newest first)
        const orders = await Order.find({ user_id: user._id })
            .populate({
                path: 'items.item',
                select: 'name price image' // Select fields you need for display
            })
            .sort({ date: -1 });

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};