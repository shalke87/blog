import mongoose from "mongoose";
import config from "../../../../../config/config.js";
import CommentModel from "./commentModel.js";



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

const PostModel = mongoose.model("Post", PostSchema);

export default PostModel;
