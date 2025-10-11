import mongoose, { model, Schema } from "mongoose";

mongoose.connect("mongodb+srv://Fazilop:Bi4wPWjiyk54g2Uq@cluster0.yw9inxs.mongodb.net/brainstorm")

const UserSchema = new Schema({
    username: {type: String, unique:true},
    password: String
})

export const UserModel = model("User", UserSchema)

const ContentSchema = new Schema({
    title:String,
    link:String,
    tags:[{type: mongoose.Types.ObjectId, ref: 'Tags'}],
    userId:{type:mongoose.Types.ObjectId, ref:'User', required:true}
})

export const ContentModel = model("Content", ContentSchema)

