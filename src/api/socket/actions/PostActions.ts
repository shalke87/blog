import PostService from "../../../services/PostService.js";
import createPostPayloadSchema from "../validators/createPostPayloadSchema.js";
import updatePostPayloadSchema from "../validators/updatePostPayloadSchema.js";
import postIdPayloadSchema from "../validators/postIdPayloadSchema.js";
import paginationQuerySchema from "../validators/paginationQueryValidatorSchema.js";
import addCommentPayloadSchema from "../validators/addCommentPayloadSchema.js";
import updateCommentPayloadSchema from "../validators/updateCommentPayloadSchema.js";
import postIdCommentIdPayloadSchema from "../validators/postIdCommentIdPayloadSchema.js";
import fullTextSearchPayloadSchema from "../validators/fullTextSearchPayloadSchema.js";
import { Server, Socket } from "socket.io";
import { AckResponse, Post, PaginationParams, PaginatedPostsResult, PostToCreate, SinglePostResult, Author } from "../../../types/types.js";
import Joi from "joi";

class PostActions {

    private socket : Socket;
    private io : Server;
    private postService : PostService;
    
    constructor(socket: Socket, io: Server) {
        this.socket = socket;
        this.io = io;
        this.postService = new PostService(io); // Passa io a PostService per poter emettere notifiche
        this.registerEvents();
    }

    registerEvents() {
        this.socket.on("post:create", this.createPost.bind(this));
        this.socket.on("post:update", this.updatePost.bind(this));
        this.socket.on("post:delete", this.deletePost.bind(this));
        this.socket.on("post:getById", this.getPostById.bind(this));
        this.socket.on("post:listPublished", this.listPublished.bind(this));
        this.socket.on("post:listMine", this.listMine.bind(this));
        this.socket.on("post:addComment", this.addComment.bind(this));
        this.socket.on("post:updateComment", this.updateComment.bind(this));
        this.socket.on("post:deleteComment", this.deleteComment.bind(this));
        this.socket.on("post:toggleLike", this.toggleLike.bind(this));
        this.socket.on("post:fullTextSearch", this.fullTextSearch.bind(this));
    }

    async createPost(payload : PostToCreate, ack : (response : AckResponse<SinglePostResult>) => void) {
        try {
            const {error, value} = createPostPayloadSchema.validate(payload) as {error: Joi.ValidationError | null, value: {data: PostToCreate}};
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.postService.addPost(this.socket.userId, value.data);
            ack({ success: true, result: result });
        } catch (err) {
            console.error("Error creating post:", err);
            const message = err instanceof Error ? err.message : "Error creating post";
            ack({ success: false, error: message });
        }
    }


    async updatePost(payload : Partial<Post>, ack : (response : AckResponse<SinglePostResult>) => void) {
        try {
            const {error, value} = updatePostPayloadSchema.validate(payload) as {error: Joi.ValidationError | null, value: {postId: string, data: Partial<Post>}};
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.postService.updatePost(this.socket.userId, value.postId, value.data);
            ack({ success: true, result: result });
        } catch (err) {
            console.error("Error updating post:", err);
            const message = err instanceof Error ? err.message : "Error updating post";
            ack({ success: false, error: message });
        }
    }
    
    async deletePost(payload : string, ack : (response : AckResponse<SinglePostResult>) => void) {
        try {
            const {error, value} = postIdPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.postService.deletePost(this.socket.userId, value.postId);
            ack({ success: true, result: result });
        } catch (err) {
            console.error("Error deleting post:", err);
            const message = err instanceof Error ? err.message : "Error deleting post";
            ack({ success: false, error: message });
        }
    }

    async getPostById(payload : string, ack : (response : AckResponse<SinglePostResult>) => void) {
        try {
            const {error, value} = postIdPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.postService.getPostById(this.socket.userId, value.postId);
            ack({ success: true, result: result });
        } catch (err) {
            console.error("Error retrieving post:", err);
            const message = err instanceof Error ? err.message : "Error retrieving post";
            ack({ success: false, error: message });
        }
    }

    async listPublished(payload : PaginationParams, ack : (response : AckResponse<PaginatedPostsResult>) => void) {
        try {
            const {error, value} = paginationQuerySchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }

            const result = await this.postService.listPublished(value.page, value.limit);
            ack({ success: true, 
                result:{ data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error listing published posts";
            ack({ success: false, error: message });
        }
    }
    
    async listMine(payload : PaginationParams, ack : (response : AckResponse<PaginatedPostsResult>) => void) {
        try {
            const {error, value} = paginationQuerySchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.postService.listMine(this.socket.userId, value.page, value.limit);
            ack({ success: true, 
                result:{ data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages}
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error listing user's posts";
            ack({ success: false, error: message });
        }
    }

    async addComment(payload : { postId: string; data: Comment }, ack : (response : AckResponse<SinglePostResult>) => void) {
        try {
            console.log("addComment called with payload:", payload);
            const {error, value} = addCommentPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.postService.addComment(this.socket.userId, value.postId, value.data);
            ack({ success: true, result: result });
        } catch (err) {
            console.error("Error adding comment:", err);
            const message = err instanceof Error ? err.message : "Error adding comment";
            ack({ success: false, error: message });
        }
    }

    async updateComment(payload : { postId: string; commentId: string; data: Comment }, ack : (response : AckResponse<SinglePostResult>) => void) {
        try {
            const {error, value} = updateCommentPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.postService.updateComment(this.socket.userId, value.postId, value.commentId, value.data);
            ack({ success: true, result });
        } catch (err) {
            console.error("Error updating comment:", err);
            const message = err instanceof Error ? err.message : "Error updating comment";
            ack({ success: false, error: message });
        }
    }

    async deleteComment(payload : { postId: string; commentId: string }, ack : (response : AckResponse<SinglePostResult>) => void) {
        try {
            const {error, value} = postIdCommentIdPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.postService.deleteComment(this.socket.userId, value.postId, value.commentId);
            ack({ success: true, result });
        } catch (err) {
            console.error("Error deleting comment:", err);
            const message = err instanceof Error ? err.message : "Error deleting comment";
            ack({ success: false, error: message });
        }
    }

    async toggleLike(payload : { postId: string }, ack : (response : AckResponse<SinglePostResult>) => void) {
        try {
            const {error, value} = postIdPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.postService.toggleLike(this.socket.userId, value.postId);
            ack({ success: true, result });
        } catch (err) {
            console.error("Error toggling like:", err);
            const message = err instanceof Error ? err.message : "Error toggling like";
            ack({ success: false, error: message });
        }
    }

    async fullTextSearch(payload : { query: string; page: number; limit: number }, ack : (response : AckResponse<PaginatedPostsResult>) => void) {
        try {
            const {error, value} = fullTextSearchPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.postService.fullTextSearch(value.query, value.page, value.limit);
            ack({ success: true, 
                result:{ data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error performing full text search";
            ack({ success: false, error: message });
        }
    }
}

export default PostActions;

   
