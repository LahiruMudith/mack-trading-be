import { Request, Response } from 'express';
import {Item} from '../models/Item';
import cloudinary from '../config/cloudnary';
import fs from 'fs';
import {authRequest} from "../middelware/auth";

const folderName = "/mack-trading-web-site/item-photos"

const deleteCloudinaryImage = async (imageUrl: string) => {
    if (!imageUrl) return;
    try {
        const publicId = imageUrl.split('/').slice(-3).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error deleting cloud image:", error);
    }
};

export const createItem = async (req: authRequest, res: Response) => {
    try {
        const userId = (req as any).user?._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized request" });
        }

        const { name, description, price, category, stock, key_features } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: folderName,
        });

        let parsedFeatures = key_features;
        if (typeof key_features === 'string') {
            try {
                parsedFeatures = JSON.parse(key_features);
            } catch (e) {
                parsedFeatures = key_features.split(',').map(f => f.trim());
            }
        }

        const newItem = new Item({
            name,
            description,
            image_url: uploadResult.secure_url,
            price: Number(price),
            category,
            stock: Number(stock),
            key_features: Array.isArray(parsedFeatures) ? parsedFeatures : [parsedFeatures],
            user_id: userId
        });

        const savedItem = await newItem.save();

        fs.unlinkSync(req.file.path);

        res.status(201).json({
            message: "Item created successfully",
            data: savedItem
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error(error);
        res.status(500).json({ message: "Error creating item", error });
    }
};

export const getAllItems = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        const query = category ? { category } : {};

        const items = await Item.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Items fetched successfully",
            count: items.length,
            data: items
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching items", error });
    }
};

export const getItemById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({
            message: "Item fetched successfully",
            data: item
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching item", error });
    }
};

export const updateItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        const updateData: any = { ...req.body };

        if (req.file) {
            await deleteCloudinaryImage(item.image_url);

            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: folderName,
            });
            updateData.image_url = uploadResult.secure_url;

            fs.unlinkSync(req.file.path);
        }

        if (updateData.key_features && typeof updateData.key_features === 'string') {
            try {
                updateData.key_features = JSON.parse(updateData.key_features);
            } catch (e) {
                updateData.key_features = updateData.key_features.split(',').map((f:string) => f.trim());
            }
        }

        const updatedItem = await Item.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({
            message: "Item updated successfully",
            data: updatedItem
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: "Error updating item", error });
    }
};

export const deleteItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        await deleteCloudinaryImage(item.image_url);

        await item.deleteOne();

        res.status(200).json({
            message: "Item and associated image deleted successfully",
            data: item
        });

    } catch (error) {
        res.status(500).json({ message: "Error deleting item", error });
    }
};