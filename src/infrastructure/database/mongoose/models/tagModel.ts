import e from "express";
import mongoose from "mongoose";

export interface ITag extends mongoose.Document {
    name: string;
}
const TagSchema = new mongoose.Schema<ITag>(
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

TagSchema.index({ name: "text" }); // Aggiungi un indice di testo sul campo 'name' per la ricerca full-text
const TagModel = mongoose.model<ITag>("Tag", TagSchema);

export default TagModel;
