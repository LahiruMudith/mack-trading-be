import { Request, Response } from 'express';
import md5 from 'md5';
import {Order} from '../models/Order';
import {authRequest} from "../middelware/auth";

export const createPayment = async (req: authRequest, res: Response) => {
    try {
        const { orderId, amount } = req.body;
        const user = req.user

        const merchantId = process.env.PAYHERE_MERCHANT_ID as string;
        const merchantSecret = process.env.PAYHERE_SECRET as string;

        const formattedAmount = Number(amount).toFixed(2);
        const currency = 'LKR';

        const hashedSecret = md5(merchantSecret).toUpperCase();
        const amountFormated = formattedAmount; // Just strictly string
        const hash = md5(merchantId + orderId + amountFormated + currency + hashedSecret).toUpperCase();

        res.status(200).json({
            message: "Payment data generated",
            merchant_id: merchantId,
            order_id: orderId,
            amount: formattedAmount,
            currency: currency,
            hash: hash,
            notify_url: "https://your-domain.com/api/payment/notify",

            return_url: "http://localhost:3000/payment/success",
            cancel_url: "http://localhost:3000/payment/cancel",

            first_name: user.name,
            email: user.email,
        });

    } catch (error) {
        res.status(500).json({ message: "Error generating payment data", error });
    }
};

// 2. PayHere Notify (Webhook) - සල්ලි ගෙව්වද නැද්ද කියලා Backend එකට කියන තැන
export const notifyPayment = async (req: Request, res: Response) => {
    try {
        // PayHere එකෙන් Form Data විදියට තමයි එවන්නේ
        const {
            merchant_id,
            order_id,
            payment_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig // PayHere එකෙන් එවන security signature එක
        } = req.body;

        const merchantSecret = process.env.PAYHERE_SECRET as string;

        // --- VERIFY SIGNATURE ---
        // අපිට ආපු data ඇත්තටම PayHere එකෙන්ද ආවේ කියලා බලන්න ඕන
        const localMd5Sig = md5(
            merchant_id +
            order_id +
            payhere_amount +
            payhere_currency +
            status_code +
            md5(merchantSecret).toUpperCase()
        ).toUpperCase();

        if (localMd5Sig !== md5sig) {
            // කවුරුහරි හැකර් කෙනෙක් බොරු request එකක් එවලා
            return res.status(400).send("Signature verification failed");
        }

        // Status Code 2 කියන්නේ Payment Success
        if (status_code === "2") {
            // Database එක Update කරන්න
            await Order.findByIdAndUpdate(order_id, {
                status: 'PAID', // Order Status එක වෙනස් කරන්න ඕන නම්
                payment_id: payment_id
            });

            console.log(`Payment Success for Order: ${order_id}`);
        }

        // PayHere එකට 200 OK එකක් යවන්න ඕන, නැත්නම් එයාලා දිගටම request එවනවා
        res.status(200).send("Status Updated");

    } catch (error) {
        console.error("Payment Notify Error:", error);
        res.status(500).send("Internal Server Error");
    }
};