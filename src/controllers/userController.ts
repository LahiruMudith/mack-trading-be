import {Response, Request} from 'express'
import {User} from "../models/User";
import bcrypt from 'bcrypt';
import {signAccessToken} from "../util/token";
import {signRefreshToken} from "../util/refreshToken";
import {sendUserWelcomeEmail} from "../util/emailService";

export const saveUser = async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body;

        if (!name || !password || !email) {
            return res.status(400).json({
                message: "Please Check Name, Password, or Email",
            });
        }

        const isExists = await User.exists({ email: email });
        if (isExists) {
            return res.status(409).json({
                message: "User Already Exists",
                email
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();


        try {
            await sendUserWelcomeEmail(email, name);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
        }

        // 7. Success Response
        return res.status(201).json({
            message: "User Saved Success & Email Sent",
            data: savedUser
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error",
            error
        });
    }
};
export const getUser = async (req:Request, res:Response) => {
    const email = req.params.email

    const user = await User.findOne({ email: email }).select("name email role status createdAt updatedAt -_id");

    if (!user) {
        return res.status(404).json({ "message": "User Not Found" });
    }

    res.status(200).json({
        "message": "Success",
        "data": user
    });
}

export const updateUser = async (req: Request, res: Response) => {
    const userEmail = req.params.email;

    const updatedUser = await User.findOneAndUpdate(
        { email: userEmail },
        { $set: req.body },
        { new: true }
    );

    if (!updatedUser) {
        return res.status(404).json({ "message": "User Not Found" });
    }

    res.status(200).json({
        "message": "Update success",
        "data": updatedUser
    });
}

export const userLogin = async (req:Request, res:Response)=>{
    try {
        const {email, password} = req.body;

        const existingUser = await User.findOne({email: email})
        if (!existingUser) {
            return res.status(400).json({
                message: "This User Already Exist"
            })
        }
        const bcrypt = require('bcrypt');
        const isPassword = await bcrypt.compare(password, existingUser.password)
        if (!isPassword) {
            return res.status(400).json({
                message: "Invalid password"
            })
        }
        const accessToken = signAccessToken(existingUser)
        const refreshToken = signRefreshToken(existingUser)

        // Access Token Cookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000
        });

        // Refresh Token Cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Login Success",
            email: existingUser.email,
            role: existingUser.role,
            accessToken,
            refreshToken
        })

    }catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal server error while logging in..!"
        })
    }
}

export const userLogout = (req: Request, res: Response) => {
    try {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.status(200).json({
            message: "Logout successful"
        });

    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ message: "Logout failed", error });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const email = req.params.email;

    const user = await User.findOneAndDelete({ email: email });

    if (!user) {
        return res.status(404).json({ "message": "User Not Found" });
    }

    res.status(200).json({ "message": "User deleted successfully" });
}

export const getAllUser = async (req: Request, res: Response) => {
    try {
        const user = await User.find();
        res.status(200).json({
            message: "Success",
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching items", error });
    }
};