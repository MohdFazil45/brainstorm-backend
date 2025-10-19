import mongoose, { model, Schema } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "";

if (!MONGO_URL) {
  console.error("❌ MONGO_URL not found in environment variables!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));


const UserSchema = new Schema({
    username: {type: String, unique:true},
    password: String
})

export const UserModel = model("User", UserSchema)

const ContentSchema = new Schema({
    title:String,
    link:String,
    tags:[{type: mongoose.Types.ObjectId, ref: 'Tags'}],
    type:String,
    userId:{type:mongoose.Types.ObjectId, ref:'User', required:true}
})

export const ContentModel = model("Content", ContentSchema)

const LinkSchema = new Schema({
    hash :String,
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required:true}
})

export const LinkModel = model("Link", LinkSchema)

