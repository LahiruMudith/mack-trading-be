import {IUser} from "../model/User";
import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()


export interface authRequest extends Request{
    user ?: any
}

export const authenticateUser = (req:authRequest, res:Response, next:NextFunction) => {
    const authHeader = req.get('Authorization')
    if(!authHeader){
        return res.status(401).json({message:'No token provided'})
    }

    const token = authHeader.split(' ')[1]
    if(!token){
        return res.status(401).json({message:'No token provided'})
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string)
        req.user = payload
        next()
    } catch (error) {
        return res.status(401).json({message:'Invalid token'})
    }
}