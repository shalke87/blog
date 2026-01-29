import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
    { 
      name: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        lowercase: true, 
      }, 
    }, 
    { timestamps: true }
)

const TagModel = mongoose.model("Tag", PostSchema);

export default TagModel;
