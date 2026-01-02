import mongoose, {Document, Schema} from "mongoose";

export interface IGallery extends Document{
    _id:mongoose.Types.ObjectId
    image_url:string
    image_category:string
    title:string
    description:string
}

const gallerySchema = new Schema<IGallery>({
    image_url: { type:String, required:true },
    image_category: { type:String ,  required:true },
    title: { type:String, required:true },
    description: { type:String, required:true },
    },
    {
        timestamps:true
    }
)

export const Gallery = mongoose.model<IGallery>('Gallery', gallerySchema)