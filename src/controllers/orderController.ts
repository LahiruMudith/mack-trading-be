import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { Order, OrderStatus, PaymentStatus } from '../models/Order';
import { Cart } from '../models/cart';
import { sendOrderConfirmationEmail } from '../util/emailService';
import {authRequest} from "../middelware/auth";

const md5 = (text: string) => {
    return crypto.createHash('md5').update(text).digest('hex').toUpperCase();
};

const generateTrackingNumber = () => {
    return 'TRK-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};

export const createOrder = async (req: authRequest, res: Response) => {
    // Start a MongoDB session for transaction safety
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = req.user; // Assumes auth middleware attaches user
        const { address_id } = req.body;

        if (!address_id) {
            return res.status(400).json({ message: "Address is required" });
        }

        const cart = await Cart.findOne({ user: user._id }).populate('items.product');

        if (!cart) {
            return res.status(400).json({ message: "Cart is empty" });
        }

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
            });
        }

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

        await newOrder.save();

        try {
            const populatedOrder = await newOrder.populate('items.item');
            await sendOrderConfirmationEmail(user.email, populatedOrder, user);
        } catch (emailErr) {
            console.error("Email sending failed (non-critical):", emailErr);
        }

        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

        if (!merchantId || !merchantSecret) {
            throw new Error("PayHere credentials missing in .env");
        }

        const orderId = newOrder._id.toString(); // Use the MongoDB Order ID
        const amountFormatted = totalAmount.toFixed(2);
        const currency = 'LKR';

        const hashedSecret = md5(merchantSecret).toUpperCase();
        const hash = md5(merchantId + orderId + amountFormatted + currency + hashedSecret).toUpperCase();

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Order created successfully",
            order_id: newOrder._id,

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
        const hashedSecret = md5(merchantSecret).toUpperCase();
        const localMd5Sig = md5(
            merchant_id +
            order_id +
            payhere_amount +
            payhere_currency +
            status_code +
            hashedSecret
        ).toUpperCase();

        if (localMd5Sig !== md5sig) {
            console.error("Security Error: MD5 Signature mismatch");
            return res.status(400).send("Signature Mismatch"); // Stop processing
        }

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

        res.status(200).send("OK");

    } catch (error) {
        console.error("Notify Error:", error);
        res.status(500).send("Error");
    }
};

export const getUserOrders = async (req: any, res: Response) => {
    try {
        const user = req.user;

        const orders = await Order.find({ user_id: user._id })
            .populate({
                path: 'items.item',
                select: 'name price image'
            })
            .sort({ date: -1 });

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};