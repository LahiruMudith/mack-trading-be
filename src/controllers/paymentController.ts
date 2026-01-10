// import { Request, Response } from 'express';
// import {Order} from '../models/Order';
// import {authRequest} from "../middelware/auth";
// import crypto from 'crypto'; // Use Node's built-in crypto
// import {Cart} from "../models/cart";
//
// // Helper to calculate MD5
// const md5 = (text: string) => {
//     return crypto.createHash('md5').update(text).digest('hex').toUpperCase();
// };
//
// export const createPayment = async (req: authRequest, res: Response) => {
//     try {
//         const user = req.user;
//
//         // --- 1. SECURITY: Calculate Amount from Database ---
//         // Do NOT use req.body.amount
//         const cart = await Cart.findOne({ user: user._id }).populate('items.product');
//
//         if (!cart || cart.items.length === 0) {
//             return res.status(400).json({ message: "Cart is empty" });
//         }
//
//         const calculatedTotal = cart.items.reduce((sum: number, item: any) => {
//             return sum + (item.product.price * item.quantity);
//         }, 0);
//
//         // --- 2. Generate Unique Order ID ---
//         // Format: Order_UserID_Timestamp (Ensures uniqueness)
//         const orderId = `ORD-${user._id.toString().slice(-4)}-${Date.now()}`;
//
//         // --- 3. Prepare Variables ---
//         const merchantId = process.env.PAYHERE_MERCHANT_ID as string;
//         const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET as string; // Make sure variable name matches .env
//         const currency = 'LKR';
//         const formattedAmount = calculatedTotal.toFixed(2); // Ensure 2 decimal places
//
//         // --- 4. Hashing Logic (Your logic was correct, kept here) ---
//         const hashedSecret = md5(merchantSecret);
//         const hash = md5((merchantId + orderId + formattedAmount + currency + hashedSecret));
//
//         res.status(200).json({
//             message: "Payment data generated",
//             merchant_id: merchantId,
//             order_id: orderId,
//             amount: formattedAmount,
//             currency: currency,
//             hash: hash,
//
//             // --- 5. UX: Point to React Frontend (Port 5173) ---
//             return_url: "http://localhost:5173/checkout",
//             cancel_url: "http://localhost:5173/checkout",
//
//             // This MUST be your Public Backend URL (Ngrok or Real Domain) for PayHere to notify you
//             notify_url: "https://your-backend-domain.com/mack-trading/api/v1/payment/notify",
//
//             name: user.name || "Customer",
//             email: user.email,
//             phone: user.phone || "",
//             address: "No Address", // Optional or fetch from DB
//             city: "Colombo",       // Optional or fetch from DB
//             country: "Sri Lanka"
//         });
//
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error generating payment data", error });
//     }
// };
//
// // 2. PayHere Notify (Webhook) - සල්ලි ගෙව්වද නැද්ද කියලා Backend එකට කියන තැන
// export const notifyPayment = async (req: Request, res: Response) => {
//     try {
//         // PayHere එකෙන් Form Data විදියට තමයි එවන්නේ
//         const {
//             merchant_id,
//             order_id,
//             payment_id,
//             payhere_amount,
//             payhere_currency,
//             status_code,
//             md5sig // PayHere එකෙන් එවන security signature එක
//         } = req.body;
//
//         const merchantSecret = process.env.PAYHERE_SECRET as string;
//
//         // --- VERIFY SIGNATURE ---
//         // අපිට ආපු data ඇත්තටම PayHere එකෙන්ද ආවේ කියලා බලන්න ඕන
//         const localMd5Sig = md5(
//             merchant_id +
//             order_id +
//             payhere_amount +
//             payhere_currency +
//             status_code +
//             md5(merchantSecret).toUpperCase()
//         ).toUpperCase();
//
//         if (localMd5Sig !== md5sig) {
//             // කවුරුහරි හැකර් කෙනෙක් බොරු request එකක් එවලා
//             return res.status(400).send("Signature verification failed");
//         }
//
//         // Status Code 2 කියන්නේ Payment Success
//         if (status_code === "2") {
//             // Database එක Update කරන්න
//             await Order.findByIdAndUpdate(order_id, {
//                 status: 'PAID', // Order Status එක වෙනස් කරන්න ඕන නම්
//                 payment_id: payment_id
//             });
//
//             console.log(`Payment Success for Order: ${order_id}`);
//         }
//
//         // PayHere එකට 200 OK එකක් යවන්න ඕන, නැත්නම් එයාලා දිගටම request එවනවා
//         res.status(200).send("Status Updated");
//
//     } catch (error) {
//         console.error("Payment Notify Error:", error);
//         res.status(500).send("Internal Server Error");
//     }
// };