import mongoose, {Document, Schema} from "mongoose";
import {IItem} from "./Item";

export enum OrderStatus {
    PENDING = "PENDING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}

export interface IOrder extends Document {
    _id:mongoose.Types.ObjectId
    tracking_number:string
    date:Date
    status:OrderStatus
    items:IItem[]
    est_delivery:Date
    user_id:mongoose.Types.ObjectId
    address_id:mongoose.Types.ObjectId
}

const orderSchema = new Schema<IOrder>({
    tracking_number: { type:String, required:true },
    date: { type:Date, required:true },
    status: { type:String, enum:Object.values(OrderStatus), default:OrderStatus.PENDING, required:true },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true }],
    est_delivery: { type:Date, required:true },
    user_id: { type:mongoose.Types.ObjectId, ref:'User', required:true },
    address_id: { type:mongoose.Types.ObjectId, ref:'Address', required:true },
    },
    {
        timestamps:true
    }
)

export const Order = mongoose.model<IOrder>('Order', orderSchema)
