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
    },

    async listPublished(req, res, next) {
        const {page, limit} = req.query;
        if(req.userId) {
            console.log("User is authenticated with userId:", req.userId);
            // Additional logic for authenticated users can be added here
        }
        try {
            const result = await PostService.listPublished(req.userId, page, limit);
            res.status(200).json({data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages});
        } catch (err) {
            next(err);
        }
    },

    async listMine(req, res, next) {
        const {page, limit} = req.query;
        if(req.userId) {
            console.log("User is authenticated with userId:", req.userId);
            // Additional logic for authenticated users can be added here
        }
        try {
            const result = await PostService.listMine(req.userId, page, limit);
            res.status(200).json({data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages});

        } catch (err) {
            next(err);
        }
    },

    async addComment(req, res, next) {
        try {
            console.log("Entering addComment controller with userId:", req.userId);
            const result = await PostService.addComment(req.userId, req.params.postId, req.body); // req.body should contain comment data
            result.message = "Comment added successfully.";
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },

    async updateComment(req, res, next) {
        try {
            console.log("Entering updateComment controller with userId:", req.userId);
            const result = await PostService.updateComment(req.userId, req.params.postId, req.params.commentId, req.body); // req.body should contain comment data
            result.message = "Comment updated successfully.";
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
};