import mongoose from "mongoose";

export interface IComment extends mongoose.Document {
  author: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; username: string; avatarURL: string };
  text: string;
  createdAt: Date;
  updatedAt: Date | null;
}

const CommentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: null
    }
  }
);


const CommentModel = mongoose.model<IComment>("Comment", CommentSchema);

export default CommentModel;