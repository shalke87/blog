import config from "../../../config/config.js";
import PostModel from "../../infrastructure/database/mongoose/models/postModel.js";

export default {
    async createPost(data) {
        console.log("Creating post with data:", data);
        try{
            const post = await PostModel.create(data);
            return post.toObject();
        } catch (error) {
            console.error("Error creating post:", error);
            throw error;
        }
    },

    async updatePost(userId, postId, data) {
        console.log("Updating post with data:", data);
        try{
            const post = await PostModel.findByIdAndUpdate({ _id: postId, author: userId }, data, { new: true });
            return post.toObject();
        } catch (error) {
            console.error("Error updating post:", error);
            throw error;
        }
    },

    async deletePost(userId, postId) {
        console.log("Deleting post with params:", postId);
        try{
            const post = await PostModel.findOneAndDelete({ _id: postId, author: userId });
            console.log("Post deleted:", post);
            if (!post) {
                return null;
            }
            return post.toObject();
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    },

    async getPostById(postId) {
        try{
            const post = await PostModel.findOne({ _id: postId });
            if (!post) {
                return null;
            }
            return post.toObject();
        } catch (error) {
            console.error("Error retrieving post by ID:", error);
            throw error;
        }
    },

    async getAllPublishedPosts(page, limit) {
        const skip = (page - 1) * limit;
        try{
            const posts = await PostModel.find({ status: config.POST_STATUS.PUBLISHED })
                .skip(skip)
                .limit(limit)
                .lean();
            const totalDocs = await PostModel.countDocuments({ status: config.POST_STATUS.PUBLISHED });
            return { posts, totalDocs };
        } catch (error) {
            console.error("Error listing published posts:", error);
            throw error;
        }
    },

    async getPostsByAuthor(authorId, page, limit) {
        const skip = (page - 1) * limit;
        try{
            const posts = await PostModel.find({ author: authorId })
                .skip(skip)
                .limit(limit)
                .lean();

            const totalDocs = await PostModel.countDocuments({ author: authorId });
            return { posts, totalDocs };
        } catch (error) {
            console.error("Error listing posts by author:", error);
            throw error;
        }
    },

    async addComment(postId, commentData) {
        try {
            const updatedPost = await PostModel.findByIdAndUpdate(
                postId,
                {
                    $push: {
                        comments: {
                            author: commentData.author,
                            text: commentData.text,
                            createdAt: commentData.createdAt
                        }
                    }
                },
                { new: true }
            );
            if (!updatedPost) {
                return null;
            }
            console.log("Comment added to post:", updatedPost.toObject());
            return updatedPost.toObject();
        } catch (error) {
            console.error("Error adding comment to post:", error);
            throw error;
        }
    },

    async updateComment(postId, commentId, userId, commentData) {
        try {
            const updatedPost = await PostModel.findOneAndUpdate(
                { _id: postId, "comments._id": commentId, "comments.author": userId },
                {
                    $set: {
                        "comments.$.text": commentData.text,
                        "comments.$.updatedAt": commentData.updatedAt
                    }
                },
                { new: true }
            );
            if (!updatedPost) {
                return null;
            }
            console.log("Comment updated in post:", updatedPost.toObject());
            return updatedPost.toObject();
        } catch (error) {
            console.error("Error updating comment in post:", error);
            throw error;
        }
    },

    async deleteComment(postId, commentId, userId) {
        try {
            const updatedPost = await PostModel.findOneAndUpdate(
                { _id: postId, "comments._id": commentId, "comments.author": userId },
                {
                    $pull: {
                        comments: { _id: commentId }
                    }
                },
                { new: true }
            );
            if (!updatedPost) {
                return null;
            }
            console.log("Comment deleted from post:", updatedPost.toObject());
            return updatedPost.toObject();
        } catch (error) {
            console.error("Error deleting comment from post:", error);
            throw error;
        }
    },

    async addLike(postId, userId) {
        const result = await PostModel.findByIdAndUpdate(
            { _id: postId },
            { $addToSet: { likes: userId }, $inc: { likesCount: 1 } },
            { new: true }
        );
        return result;
    },

    async removeLike(postId, userId) {
        const result = await PostModel.findByIdAndUpdate(
            { _id: postId },
            { $pull: { likes: userId }, $inc: { likesCount: -1 } },
            { new: true }
        );
        return result;
    }


    
}