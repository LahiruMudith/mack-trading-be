import {authRequest} from "./auth";
import {NextFunction, Response} from "express";


export const authorizeRole = (...roles:string[]) => {
    const allowRole = new Set(roles.map((role:string) => role.toString().toUpperCase()));

    return (req:authRequest, res:Response, next:NextFunction)=>{
        const user = req.user

        if (!user) return res.status(401).json({message:'Unauthenticated'})

        const userRole = user.role.toUpperCase()

        if (!allowRole.has(userRole)) return res.status(403).json({message:'Unauthorized'})

        next()
    }
}