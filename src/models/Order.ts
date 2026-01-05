import mongoose, { Document, Schema } from "mongoose";

export enum OrderStatus {
    PAYMENT_PENDING = "PAYMENT_PENDING",
    PLACED = "PLACED",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}

export interface IOrderItem {
    item: mongoose.Types.ObjectId;
    qty: number;
}

export interface IOrder extends Document {
    _id: mongoose.Types.ObjectId;
    tracking_number: string;
    date: Date;
    status: OrderStatus;
    payment_status: PaymentStatus;
    items: IOrderItem[];
    est_delivery: Date;
    user_id: mongoose.Types.ObjectId;
    address_id: mongoose.Types.ObjectId;
}

const orderSchema = new Schema<IOrder>({
    tracking_number: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PAYMENT_PENDING, required: true },
    payment_status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING, required: true },
    items: [
        {
            item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
            qty: { type: Number, required: true, min: 1 }
        }
    ],
    est_delivery: { type: Date, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
}, {
    timestamps: true
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);