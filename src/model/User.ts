import mongoose, {Document, Schema} from "mongoose";

export enum Role {
    ADMIN = "ADMIN",
    USER = "USER"
}

export interface IUser extends Document {
    _id:mongoose.Types.ObjectId
    name:string
    email:string
    password:string
    role:Role
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum:Object.values(Role), default:Role.USER, required: true },
    },
    {
    timestamps:true
    }
)

const User = mongoose.model<IUser>('User', userSchema)