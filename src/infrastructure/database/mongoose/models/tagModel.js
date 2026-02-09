import mongoose from "mongoose";

const TagSchema = new mongoose.Schema(
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
const TagModel = mongoose.model("Tag", TagSchema);

export default TagModel;
