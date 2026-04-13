import PostService from '../../../services/PostService.js';

class PostController {

    constructor() {
        this.postService = new PostService();

        // Bind methods to ensure 'this' context is correct
        this.addPost = this.addPost.bind(this);
        this.updatePost = this.updatePost.bind(this);
        this.deletePost = this.deletePost.bind(this);
        this.readPost = this.readPost.bind(this);
        this.listPublished = this.listPublished.bind(this);
        this.listMine = this.listMine.bind(this);
        this.addComment = this.addComment.bind(this);
        this.updateComment = this.updateComment.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
        this.toggleLike = this.toggleLike.bind(this);
    }

    async addPost(req, res, next) {
        try {
            console.log("Entering addPost controller with userId:", req.userId);
            const result = await this.postService.addPost(req.userId, req.body);
            result.message = "Post added successfully.";
            res.status(201).json(result);
            console.log("addPost result:", result);
        } catch (err) {
            next(err);
        }
    }

    async updatePost(req, res, next) {
        try {
            console.log("Entering updatePost controller with userId:", req.userId);
            const result = await this.postService.updatePost(req.userId, req.params.postId, req.body);
            result.message = "Post updated successfully.";
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async deletePost(req, res, next) {
        try {
            console.log("Entering deletePost controller with userId:", req.userId);
            const result = await this.postService.deletePost(req.userId, req.params.postId);
            result.message = "Post deleted successfully.";
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async readPost(req, res, next) {
        if (req.userId) {
            console.log("User is authenticated with userId:", req.userId);
            // Additional logic for authenticated users can be added here
        }
        try {
            console.log("Entering readPost controller with userId:", req.userId);
            const result = await this.postService.readPost(req.userId, req.params.postId);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async listPublished(req, res, next) {
        const { page, limit } = req.query;
        if (req.userId) {
            console.log("User is authenticated with userId:", req.userId);
            // Additional logic for authenticated users can be added here
        }
        try {
            const result = await this.postService.listPublished(req.userId, page, limit);
            res.status(200).json({ data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
        } catch (err) {
            next(err);
        }
    }

    async listMine(req, res, next) {
        const { page, limit } = req.query;
        if (req.userId) {
            console.log("User is authenticated with userId:", req.userId);
            // Additional logic for authenticated users can be added here
        }
        try {
            const result = await this.postService.listMine(req.userId, page, limit);
            res.status(200).json({ data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });

        } catch (err) {
            next(err);
        }
    }
    
    async addComment(req, res, next) {
        try {
            console.log("Entering addComment controller with userId:", req.userId);
            const result = await this.postService.addComment(req.userId, req.params.postId, req.body); // req.body should contain comment data
            res.status(200).json({ data: result.data, message: "Comment added successfully." });
        } catch (err) {
            next(err);
        }
    }

    async updateComment(req, res, next) {
        try {
            console.log("Entering updateComment controller with userId:", req.userId);
            const result = await this.postService.updateComment(req.userId, req.params.postId, req.params.commentId, req.body); // req.body should contain comment data
            result.message = "Comment updated successfully.";
            res.status(200).json({ data: result.data, message: result.message });
        } catch (err) {
            next(err);
        }
    }

    async deleteComment(req, res, next) {
        try {
            console.log("Entering deleteComment controller with userId:", req.userId);
            const result = await this.postService.deleteComment(req.userId, req.params.postId, req.params.commentId);
            res.status(200).json({ data: result.data, message: "Comment deleted successfully." });
        } catch (err) {
            next(err);
        }
    }

    async toggleLike(req, res, next) {
        try {
            console.log("Entering toggleLike controller with userId:", req.userId);
            const result = await this.postService.toggleLike(req.userId, req.params.postId);
            console.log("toggleLike result:", result);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
};

export default new PostController();