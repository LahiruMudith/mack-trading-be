import mongoose, {Document, Schema} from "mongoose";

export interface IItem extends Document{
    _id:mongoose.Types.ObjectId
    name:string
    description:string
    image_url:string
    price:number
    category:string
    stock:number
    key_features:string[]
    user_id:mongoose.Types.ObjectId
}

const itemSchema = new Schema<IItem>({
    name: { type:String, required:true },
    description: { type:String, required:true },
    image_url: { type:String, required:true },
    price: { type:Number, required:true },
    category: { type:String, required:true },
    stock: { type:Number, required:true },
    key_features: { type:[String], required:true },
    user_id: { type:mongoose.Types.ObjectId, required:true },
    },
    {
        timestamps:true
    }
)

const Item = mongoose.model<IItem>('Item', itemSchema)
