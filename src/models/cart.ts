import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
    image: string;
    price: number;
}

export interface ICart extends Document {
    user: mongoose.Types.ObjectId;
    items: ICartItem[];
    totalAmount: number;
}

const cartItemSchema = new Schema<ICartItem>({
    product: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
    price: { type: Number, required: true }
});

const cartSchema = new Schema<ICart>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    totalAmount: { type: Number, default: 0 }
}, {
    timestamps: true
});

cartSchema.pre('save', function(next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
});

export const Cart = mongoose.model<ICart>('Cart', cartSchema);