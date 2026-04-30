import PostService from '../../../services/PostService.js';
import { Request, Response, NextFunction } from 'express';

class PostController {

    private postService: PostService;
    constructor() {
        this.postService = new PostService();

        // Bind methods to ensure 'this' context is correct
        this.addPost = this.addPost.bind(this);
        this.updatePost = this.updatePost.bind(this);
        this.deletePost = this.deletePost.bind(this);
        this.getPostById = this.getPostById.bind(this);
        this.listPublished = this.listPublished.bind(this);
        this.listMine = this.listMine.bind(this);
        this.addComment = this.addComment.bind(this);
        this.updateComment = this.updateComment.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
        this.toggleLike = this.toggleLike.bind(this);
    }

    async addPost(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Entering addPost controller with userId:", req.userId);
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const result = await this.postService.addPost(req.userId, req.body);
            res.status(201).json(result);
            console.log("addPost result:", result);
        } catch (err) {
            next(err);
        }
    }

    async updatePost(req: Request<{ postId: string }>, res: Response, next: NextFunction) { // Specify type for req.params, first of 5 generics
        try {
            console.log("Entering updatePost controller with userId:", req.userId);
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const result = await this.postService.updatePost(req.userId, req.params.postId, req.body);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async deletePost(req: Request<{ postId: string }>, res: Response, next: NextFunction) {
        try {
            console.log("Entering deletePost controller with userId:", req.userId);
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const result = await this.postService.deletePost(req.userId, req.params.postId);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async getPostById(req: Request<{ postId: string }>, res: Response, next: NextFunction) {
        if (req.userId) {
            console.log("User is authenticated with userId:", req.userId);
            // Additional logic for authenticated users can be added here
        }
        try {
            console.log("Entering getPostById controller with userId:", req.userId);
            const result = await this.postService.getPostById(req.userId, req.params.postId);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async listPublished(req: Request<{}, {}, {}, { page: string; limit: string }>, res: Response, next: NextFunction) {
        const { page, limit } = req.query;
        if (req.userId) {
            console.log("User is authenticated with userId:", req.userId);
            // Additional logic for authenticated users can be added here
        }
        try {
            const result = await this.postService.listPublished(parseInt(page), parseInt(limit));
            res.status(200).json({ data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });
        } catch (err) {
            next(err);
        }
    }

    async listMine(req: Request<{}, {}, {}, { page: string; limit: string }>, res: Response, next: NextFunction) {
        const { page, limit } = req.query;
        if (req.userId) {
            console.log("User is authenticated with userId:", req.userId);
            // Additional logic for authenticated users can be added here
        }
        try {
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const result = await this.postService.listMine(req.userId, parseInt(page), parseInt(limit));
            res.status(200).json({ data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages });

        } catch (err) {
            next(err);
        }
    }
    
    async addComment(req: Request<{ postId: string }>, res: Response, next: NextFunction) {
        try {
            console.log("Entering addComment controller with userId:", req.userId);
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const result = await this.postService.addComment(req.userId, req.params.postId, req.body); // req.body should contain comment data
            res.status(200).json({ data: result.data, message: "Comment added successfully." });
        } catch (err) {
            next(err);
        }
    }

    async updateComment(req: Request<{ postId: string; commentId: string }>, res: Response, next: NextFunction) {
        try {
            console.log("Entering updateComment controller with userId:", req.userId);
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const result = await this.postService.updateComment(req.userId, req.params.postId, req.params.commentId, req.body); // req.body should contain comment data
            res.status(200).json({ data: result.data});
        } catch (err) {
            next(err);
        }
    }

    async deleteComment(req: Request<{ postId: string; commentId: string }>, res: Response, next: NextFunction) {
        try {
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            console.log("Entering deleteComment controller with userId:", req.userId);
            const result = await this.postService.deleteComment(req.userId, req.params.postId, req.params.commentId);
            res.status(200).json({ data: result.data, message: "Comment deleted successfully." });
        } catch (err) {
            next(err);
        }
    }

    async toggleLike(req: Request<{ postId: string }>, res: Response, next: NextFunction) {
        try {
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
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