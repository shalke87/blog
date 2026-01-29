import PostModel from "../../infrastructure/database/mongoose/models/postModel.js";

export default {
    async createPost(data) {
        console.log("Creating post with data:", data);
        try{
            const post = await PostModel.create(data);
            console.log("Post created:", post);
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
            console.log("Post updated:", post);
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
    }
}