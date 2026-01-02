import dotenv from "dotenv";
import {IUser} from "../models/User";
import jwt from "jsonwebtoken"

dotenv.config()

const JWT_SECRETS = process.env.JWT_SECRETS as string;

export const signAccessToken = (user:IUser)=>{
    return jwt.sign(
        {
            _id:user._id,
            email:user.email,
            role:user.role
        },
        JWT_SECRETS,
        {
            expiresIn:'1d'
        }
    )
}