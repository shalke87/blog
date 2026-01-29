import PostService from '../../../services/PostService.js';

export default {
    async addPost(req, res, next) {
        try {
            console.log("Entering addPost controller with userId:", req.userId);
            const result = await PostService.addPost(req.userId, req.body);
            result.message = "Post added successfully.";
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    },

    async updatePost(req, res, next) {
        try {
            console.log("Entering updatePost controller with userId:", req.userId);
            const result = await PostService.updatePost(req.userId, req.params.postId, req.body);
            result.message = "Post updated successfully.";
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },

    async deletePost(req, res, next) {
        try {
            console.log("Entering deletePost controller with userId:", req.userId);
            const result = await PostService.deletePost(req.userId, req.params.postId);
            result.message = "Post deleted successfully.";
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },

    async readPost(req, res, next) {
        if(req.userId) {
            console.log("User is authenticated with userId:", req.userId);
            // Additional logic for authenticated users can be added here
        }
        try {
            console.log("Entering readPost controller with userId:", req.userId);
            const result = await PostService.readPost(req.userId, req.params.postId);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
};