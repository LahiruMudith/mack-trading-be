import mongoose, {Document, Schema} from "mongoose";

export enum AddressType {
    "HOME" = "HOME",
    "WORK" = "WORK",
    "OTHER" = "OTHER"
}

export enum Country {
    SRI_LANKA = 'Sri Lanka',
    INDIA = 'India',
    MALDIVES = 'Maldives',
    BANGLADESH = 'Bangladesh',
    MYANMAR = 'Myanmar',
    THAILAND = 'Thailand',
    MALAYSIA = 'Malaysia',
    INDONESIA = 'Indonesia',
    NEPAL = 'Nepal',
    BHUTAN = 'Bhutan',
    PAKISTAN = 'Pakistan',
}

export interface IAddress extends Document{
    _id:mongoose.Types.ObjectId
    type:AddressType
    address:string
    city:string
    state:string
    zip:string
    country:Country
    phone_number_01:string
    phone_number_02:string
    isDefault:boolean
    user_id:mongoose.Types.ObjectId
}

const addressSchema = new Schema<IAddress>({
    type: { type:String, enum:Object.values(AddressType), default:AddressType.HOME, required:true },
    address: { type:String, required:true },
    city: { type:String, required:true },
    state: { type:String, required:true },
    zip: { type:String, required:true },
    country: { type:String, enum:Object.values(Country), default:Country.SRI_LANKA, required:true },
    phone_number_01: { type:String, required:true },
    phone_number_02: { type:String, required:true },
    isDefault: {type:Boolean, required:true},
    user_id: { type:mongoose.Types.ObjectId, ref:'User', required:true },
    },
    {
        timestamps:true
    }
)

export const Address = mongoose.model<IAddress>('Address', addressSchema)