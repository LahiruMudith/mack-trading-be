import dotenv from "dotenv";
import {IUser} from "../models/User";
import jwt from "jsonwebtoken";

dotenv.config()

const JWT_REFRESH_SECRETS = process.env.JWT_REFRESH_SECRETS as string;

export const signRefreshToken = (user : IUser) => {
    return jwt.sign(
        {
            _id:user._id
        },
        JWT_REFRESH_SECRETS,
        {
            expiresIn:'7d'
        }
    )
}