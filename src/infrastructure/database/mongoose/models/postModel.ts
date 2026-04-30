import mongoose from "mongoose";
import config from "../../../../config/config.js";
import CommentModel, { IComment } from "./commentModel.js";
import { Author } from "../../../../types/types.js";

interface IAuthor {
    _id: mongoose.Types.ObjectId;
    username: string;
    avatarURL: string | null;
}

export interface IPost<TAuthor extends (mongoose.Types.ObjectId | IAuthor) = mongoose.Types.ObjectId> 
  extends mongoose.Document {
  title: string;
  content: string;
  status: string;
  publishedAt: Date | null;
  author: TAuthor;
  tags: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  comments: IComment[];
  updatedAt?: Date;
}

export type IPostNotPopulated = IPost<mongoose.Types.ObjectId>;
export type IPostPopulated = IPost<IAuthor>;

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    content: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [config.POST_STATUS.DRAFT, config.POST_STATUS.PUBLISHED],
      default: config.POST_STATUS.DRAFT
    },

    publishedAt: {
      type: Date,
      default: null
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag"
      }
    ],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    likesCount: {
      type: Number,
      default: 0
    },

    comments: [CommentModel.schema]

  },
  {
    timestamps: true    // Aggiunge automaticamente i campi createdAt e updatedAt
  }
);

PostSchema.index({ title: "text", content: "text", tags: "text" }); // title, content e tags sono indicizzati con il nome text
const PostModel = mongoose.model<IPost>("Post", PostSchema);

export default PostModel;
