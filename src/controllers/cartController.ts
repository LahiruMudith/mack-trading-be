import { Request, Response } from "express";
import { Cart } from "../models/cart";
import { Item } from "../models/Item";
import {authRequest} from "../middelware/auth";

const calculateCartTotal = (cart: any) => {
    return cart.items.reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity);
    }, 0);
};


export const addToCart = async (req: authRequest, res: Response) => {
    try {
        const userId = req.user?._id; // Assumes your auth middleware adds this
        const { productId, quantity } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // 1. Validate the Product exists and get REAL price
        const product = await Item.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        // 2. Find the user's cart
        let cart = await Cart.findOne({ user: userId });

        if (cart) {
            // --- Cart exists: Update it ---
            const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

            if (itemIndex > -1) {
                // Product exists in cart -> Update quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Product not in cart -> Add new item
                cart.items.push({
                    product: product._id,
                    quantity: quantity,
                    image: product.image_url,
                    price: product.price
                });
            }
        } else {
            // --- No Cart: Create new one ---
            cart = new Cart({
                user: userId,
                items: [{
                    product: product._id,
                    quantity: quantity,
                    image: product.image_url,
                    price: product.price
                }]
            });
        }

        // 3. Save (The pre-save hook in the model will calculate totalAmount)
        await cart.save();

        return res.status(200).json({ message: "Item added to cart", cart });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error", error });
    }
};

export const getCart = async (req: authRequest, res: Response) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product'); // Populate product details for display

        if (!cart) {
            return res.status(200).json({
                items: [],
                totalAmount: 0
            });
        }

        const totalAmount = calculateCartTotal(cart);

        cart.totalAmount = totalAmount;
        await cart.save();

        res.status(200).json({
            _id: cart._id,
            items: cart.items,
            totalAmount: totalAmount // <--- The secure total
        });

    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const updateCartItem = async (req: authRequest, res: Response) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === itemId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;

            // Recalculate totalAmount (optional, but good practice)
            // cart.totalAmount = ... (logic to recalculate)

            await cart.save();
            res.status(200).json(cart);
        } else {
            res.status(404).json({ message: "Item not found in cart" });
        }
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const removeCartItem = async (req: authRequest, res: Response) => {
    const { itemId } = req.params;

    try {
        await Cart.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );

        res.status(200).json({ message: "Item removed" });
    } catch (error) {
        console.error("Error removing item:", error);
        res.status(500).json({ message: "Server Error" });
    }
};