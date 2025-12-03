import mongoose, {Document, Schema} from "mongoose";

export enum GalleryType {
    "USER" = "USER",
    "ADMIN" = "ADMIN"
}

export interface IGallery extends Document{
    _id:mongoose.Types.ObjectId
    image_url:string
    image_type:GalleryType
    title:string
    description:string
}

const gallerySchema = new Schema<IGallery>({
    image_url: { type:String, required:true },
    image_type: { type:String, enum:Object.values(GalleryType), default:GalleryType.USER ,  required:true },
    title: { type:String, required:true },
    description: { type:String, required:true },
    },
    {
        timestamps:true
    }
)

const Gallery = mongoose.model<IGallery>('Gallery', gallerySchema)