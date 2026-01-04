import { Request, Response } from 'express';
import {Order, OrderStatus } from '../models/Order';
import crypto from 'crypto';
import {authRequest} from "../middelware/auth"; // Random ID හදන්න Node built-in module එකක්

export const createOrder = async (req: authRequest, res: Response) => {
    try {
        const userId = (req as any).user?._id;

        // Frontend එකෙන් Items ID ටික සහ Address ID එක එවන්න ඕන
        const { items, address_id } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items provided" });
        }
        if (!address_id) {
            return res.status(400).json({ message: "Address is required" });
        }

        const tracking_number = `MRK-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

        const est_delivery = new Date();
        est_delivery.setDate(est_delivery.getDate() + 5);

        const newOrder = new Order({
            tracking_number,
            date: new Date(),
            status: OrderStatus.PENDING,
            items,
            est_delivery,
            user_id: userId,
            address_id
        });

        const savedOrder = await newOrder.save();

        res.status(201).json({
            message: "Order placed successfully",
            data: savedOrder
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error placing order", error });
    }
};

// 2. Get My Orders (Logged In User)
export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id;

        // items සහ address_id කියන fields වල විස්තර පුරවලා (populate) එවන්න
        const orders = await Order.find({ user_id: userId })
            .populate('items')      // Item වල සම්පූර්ණ විස්තර එනවා
            .populate('address_id') // Address එකේ විස්තර එනවා
            .sort({ createdAt: -1 }); // අලුත් ඒවා උඩින්

        res.status(200).json({
            message: "Orders fetched successfully",
            count: orders.length,
            data: orders
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error });
    }
};

// 3. Get All Orders (Admin Only)
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find()
            .populate('user_id', 'name email') // User ගේ නම සහ email විතරක් ගන්නවා
            .populate('items')
            .populate('address_id')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "All orders fetched successfully",
            count: orders.length,
            data: orders
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error });
    }
};

// 4. Update Order Status (Admin Only)
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Enum check
        if (!Object.values(OrderStatus).includes(status)) {
            return res.status(400).json({ message: "Invalid order status" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Order status updated successfully",
            data: updatedOrder
        });

    } catch (error) {
        res.status(500).json({ message: "Error updating status", error });
    }
};