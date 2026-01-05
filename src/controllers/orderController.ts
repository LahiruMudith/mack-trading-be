import { Request, Response } from 'express';
import { Order, OrderStatus, PaymentStatus } from '../models/Order';
import crypto from 'crypto';
import md5 from 'md5';
import {Item} from "../models/Item"; // npm install md5

export const checkoutAndPay = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id;
        const { items, address_id, total_amount } = req.body;

        if (!items || items.length === 0) return res.status(400).json({ message: "No items provided" });
        if (!address_id) return res.status(400).json({ message: "Address is required" });

        let calculatedSubtotal = 0;

        for (const orderItem of items) {
            const dbItem = await Item.findById(orderItem.item);
            if (!dbItem) {
                return res.status(404).json({ message: `Item not found: ${orderItem.item}` });
            }
            calculatedSubtotal += dbItem.price * orderItem.qty;
        }

        const tax = calculatedSubtotal * 0.10;
        const shipping = calculatedSubtotal > 100 ? 0 : 15;
        const calculatedTotal = calculatedSubtotal + tax + shipping;


        if (Math.abs(calculatedTotal - Number(total_amount)) > 10.00) {
            return res.status(400).json({
                message: "Total amount mismatch! Price may have changed.",
                serverTotal: calculatedTotal,
                clientTotal: Number(total_amount)
            });
        }

        const tracking_number = `ORD-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

        const est_delivery = new Date();
        est_delivery.setDate(est_delivery.getDate() + 5);

        const newOrder = new Order({
            tracking_number,
            status: OrderStatus.PAYMENT_PENDING,
            payment_status: PaymentStatus.PENDING,
            total_amount: calculatedTotal, // ආරක්ෂිත අගය
            items,
            est_delivery,
            user_id: userId,
            address_id
        });

        const savedOrder = await newOrder.save();

        const merchantId = process.env.PAYHERE_MERCHANT_ID as string;
        const merchantSecret = process.env.PAYHERE_SECRET as string;
        const amountFormatted = calculatedTotal.toFixed(2); // Format to 2 decimal places
        const currency = 'LKR';
        const hashedSecret = md5(merchantSecret).toUpperCase();

        const hash = md5(merchantId + savedOrder._id + amountFormatted + currency + hashedSecret).toUpperCase();

        res.status(201).json({
            message: "Order created successfully",
            order: savedOrder,
            payhere_data: {
                merchant_id: merchantId,
                return_url: "http://localhost:3000/payment/success",
                cancel_url: "http://localhost:3000/payment/cancel",
                notify_url: "https://your-ngrok-url.io/api/orders/notify",
                order_id: savedOrder._id,
                items: "Order Payment",
                currency: currency,
                amount: amountFormatted,
                hash: hash,
                // Add user details here if needed
            }
        });

    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).json({ message: "Error processing checkout", error });
    }
};

export const notifyPayment = async (req: Request, res: Response) => {
    try {
        const {
            merchant_id, order_id, payment_id, payhere_amount,
            payhere_currency, status_code, md5sig
        } = req.body;

        const merchantSecret = process.env.PAYHERE_SECRET as string;

        const localMd5Sig = md5(
            merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(merchantSecret).toUpperCase()
        ).toUpperCase();

        if (status_code === "2") {
            await Order.findByIdAndUpdate(order_id, {
                status: OrderStatus.PLACED,
                payment_status: PaymentStatus.PAID
            });
            console.log(`Order ${order_id} Confirmed!`);
        }

        res.status(200).send("OK");

    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
};