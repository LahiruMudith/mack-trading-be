import { Request, Response } from 'express';
import cloudinary from '../config/cloudnary';
import fs from 'fs';
import {Gallery} from '../models/Gallery';

const cloudinaryFolderPath = "mack-trading-web-site/gallery-photos"

export const saveGalleryItem = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file uploaded" });
        }

        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: cloudinaryFolderPath,
        });

        fs.unlinkSync(req.file.path);

        const { image_category, title, description } = req.body;

        const newGalleryItem = new Gallery({
            image_url: uploadResult.secure_url,
            image_category,
            title,
            description
        });

        const savedItem = await newGalleryItem.save();

        res.status(201).json({
            message: "Gallery item created successfully",
            data: savedItem
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error(error);
        res.status(500).json({ message: "Error creating gallery item", error });
    }
};

export const getAllGalleryItems = async (req: Request, res: Response) => {
    try {
        const items = await Gallery.find();
        res.status(200).json({
            message: "Success",
            data: items
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching items", error });
    }
};

export const getGalleryItemById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const item = await Gallery.findById(id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({
            message: "Success",
            data: item
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching item", error });
    }
};

export const updateGalleryItem = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const itemToUpdate = await Gallery.findById(id);

        if (!itemToUpdate) {
            return res.status(404).json({ message: "Item not found" });
        }

        const { image_category, title, description } = req.body;

        const updateData: any = {};

        if (image_category !== undefined) updateData.image_category = image_category;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;

        if (req.file) {
            if (itemToUpdate.image_url) {
                const publicId = itemToUpdate.image_url.split('/').slice(-3).join('/').split('.')[0];
                console.log(publicId)
                await cloudinary.uploader.destroy(publicId);
            }

            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: cloudinaryFolderPath,
            });

            updateData.image_url = uploadResult.secure_url;
            fs.unlinkSync(req.file.path);
        }

        const updatedItem = await Gallery.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        res.status(200).json({
            message: "Gallery item updated successfully",
            data: updatedItem
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.log(error);
        res.status(500).json({ message: "Error updating item", error });
    }
};

export const deleteGalleryItem = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const itemToDelete = await Gallery.findById(id);

        if (!itemToDelete) {
            return res.status(404).json({ message: "Item not found" });
        }

        if (itemToDelete.image_url) {
            const publicId = itemToDelete.image_url.split('/').slice(-3).join('/').split('.')[0];

            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (cloudError) {
                console.error("Cloudinary delete error:", cloudError);
            }
        }

        await Gallery.findByIdAndDelete(id);

        res.status(200).json({
            message: "Gallery item and image deleted successfully",
            data: itemToDelete
        });

    } catch (error) {
        res.status(500).json({ message: "Error deleting item", error });
    }
};