import {Response, Request} from 'express'
import {authRequest} from "../middelware/auth";
import {IUser, User} from "../model/User";

export const saveUser = async (req:Request, res:Response) => {
    const { email, name, password} = req.body

    if (!name || !password || !email) {
        res.status(400).send({
            "message":"Please Check Name , Password or Email",
        })
    }

    const isExists = await User.exists({email:email})
    if (isExists) {
        res.status(409).json({
            "message":"User Already Exists",
            email
        })
    }


    const newUser = new User({
        name,
        email,
        password
    })

    await newUser.save()
    res.status(201).json({
        "message":"User Saved Success",
        "data":newUser
    })
}

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

export const updateUser = (req:Request, res:Response) => {}

export const deleteUser = (req:Request, res:Response) => {}
