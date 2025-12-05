import mongoose, {Document, Schema} from "mongoose";

export enum Role {
    ADMIN = "ADMIN",
    USER = "USER"
}

export enum Status {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}

export interface IUser extends Document {
    _id:mongoose.Types.ObjectId
    name:string
    email:string
    password:string
    role:Role
    status:Status
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum:Object.values(Role), default:Role.USER, required: true },
    status: { type: String, enum:Object.values(Status), default:Status.ACTIVE, required: true },
    },
    {
    timestamps:true
    }
)

const User = mongoose.model<IUser>('User', userSchema)