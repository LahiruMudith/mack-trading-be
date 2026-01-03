import { Request, Response } from 'express';
import {Address, IAddress } from '../models/Address';
import {authRequest} from "../middelware/auth"; // ඔබේ Model path එක

export const createAddress = async (req: authRequest, res: Response) => {
    try {
        const {
            type, address, city, state, zip, country,
            phone_number_01, phone_number_02, isDefault
        } = req.body;

        const user_id = (req as any).user._id;

        if (!address || !city || !country) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        if (isDefault) {
            await Address.updateMany(
                { user_id: user_id },
                { $set: { isDefault: false } }
            );
        }

        const newAddress = new Address({
            type,
            address,
            city,
            state,
            zip,
            country,
            phone_number_01,
            phone_number_02,
            isDefault: isDefault || false,
            user_id
        });

        const savedAddress = await newAddress.save();

        res.status(201).json({
            message: "Address created successfully",
            data: savedAddress
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating address", error });
    }
};

export const getUserAddresses = async (req: authRequest, res: Response) => {
    try {
        const userId = (req as any).user._id;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const addresses = await Address.find({ user_id: userId });

        res.status(200).json({
            message: "Addresses fetched successfully",
            count: addresses.length,
            data: addresses
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching addresses", error });
    }
};

export const getAddressById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const address = await Address.findById(id);

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        res.status(200).json({
            message: "Address fetched successfully",
            data: address
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching address", error });
    }
};

export const updateAddress = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.isDefault === true) {
            const currentAddress = await Address.findById(id);
            if (currentAddress) {
                await Address.updateMany(
                    { user_id: currentAddress.user_id },
                    { $set: { isDefault: false } }
                );
            }
        }

        const updatedAddress = await Address.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ message: "Address not found" });
        }

        res.status(200).json({
            message: "Address updated successfully",
            data: updatedAddress
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating address", error });
    }
};

export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deletedAddress = await Address.findByIdAndDelete(id);

        if (!deletedAddress) {
            return res.status(404).json({ message: "Address not found" });
        }

        if (deletedAddress.isDefault) {
            return res.status(400).json({
                message: "Cannot delete default address"
            });
        }

        res.status(200).json({
            message: "Address deleted successfully",
            data: deletedAddress
        });

    } catch (error) {
        res.status(500).json({ message: "Error deleting address", error });
    }
};