import {Response, Request} from 'express'
import {User} from "../models/User";
import bcrypt from 'bcrypt';
import {signAccessToken} from "../util/token";
import {signRefreshToken} from "../util/refreshToken";
import {sendPasswordEmail, sendUserWelcomeEmail} from "../util/emailService";
import crypto from 'crypto';
import jwt, {JwtPayload} from "jsonwebtoken";
import dotenv from "dotenv";
import {authRequest} from "../middelware/auth";
import connectDB from "../util/db";
dotenv.config()

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export const saveUser = async (req: Request, res: Response) => {
    try {
        await connectDB();
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
            code:201,
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
        code:200,
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
            return res.status(404).json({
                message: "Cannot find user"
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

        const isProduction = process.env.NODE_ENV === 'production';

        // Access Token Cookie
        res.cookie('accessToken', accessToken, {
            maxAge: 60 * 60 * 1000
        });

        // Refresh Token Cookie
        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // //email
        // res.cookie('userEmail', existingUser.email, {
        //     httpOnly: false,
        //     secure: process.env.NODE_ENV === 'production',
        //     sameSite: 'strict',
        //     maxAge: 60 * 60 * 1000
        // });

        res.status(200).json({
            code:200,
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

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { email, name } = req.body;

        let user = await User.findOne({ email: email });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;

            const rawPassword = crypto.randomBytes(5).toString('hex');

            // Password එක Hash කරන්න
            const hashedPassword = await bcrypt.hash(rawPassword, 10);

            user = new User({
                name,
                email,
                password: hashedPassword
            });

            user = await user.save();

            sendPasswordEmail(email, rawPassword);
        }

        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user);

        // Access Token Cookie
        res.cookie('accessToken', accessToken, {
            maxAge: 60 * 60 * 1000
        });

        // Refresh Token Cookie
        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        // //email
        // res.cookie('userEmail', user.email, {
        //     httpOnly: false,
        //     secure: process.env.NODE_ENV === 'production',
        //     sameSite: 'strict',
        //     maxAge: 60 * 60 * 1000
        // });

        // Response එක යවන්න
        res.status(isNewUser ? 201 : 200).json({
            email: user.email,
            role: user.role,
            isNewUser: isNewUser,
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error during Google Login"
        });
    }
};

export const userLogout = (req: Request, res: Response) => {
    try {
        res.clearCookie('accessToken', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.clearCookie('refreshToken', {
            httpOnly: false,
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

export const handleRefreshToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.body.token;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh Token is required" });
        }

        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;

        const user = await User.findById(payload._id);

        if (!user) {
            return res.status(403).json({ message: "User not found" });
        }

        const accessToken = signAccessToken(user);

        res.cookie('accessToken', accessToken, { maxAge: 60 * 60 * 1000 });

        return res.status(200).json({ accessToken });
    } catch (e) {
        console.error(e);
        return res.status(403).json({ message: "Invalid or Expired Refresh Token" });
    }
}

export const updatePassword = async (req: authRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const userId = (req as any).user?._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User not found in session." });
        }

        const user = await User.findById(userId).select('+password'); // Ensure password field is selected if hidden by default

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            code: 200,
            message: "Password updated successfully."
        });

    } catch (error) {
        console.error("Update Password Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};