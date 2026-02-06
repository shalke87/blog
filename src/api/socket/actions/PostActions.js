import PostService from "../../../services/PostService.js";
import createPostPayloadSchema from "../validators/createPostPayloadSchema.js";
import updatePostPayloadSchema from "../validators/updatePostPayloadSchema.js";
import idPayloadSchema from "../validators/idPayloadSchema.js";
import paginationQuerySchema from "../validators/paginationQueryValidatorSchema.js";
import addCommentPayloadSchema from "../validators/addCommentPayloadSchema.js";
import updateCommentPayloadSchema from "../validators/updateCommentPayloadSchema.js";
import postIdCommentIdPayloadSchema from "../validators/postIdCommentIdPayloadSchema.js";

class PostActions {
    
    constructor(socket, io) {
        this.socket = socket;
        this.io = io;
        this.PostService = new PostService(io); // Passa io a PostService per poter emettere notifiche
        this.registerEvents();
    }

    registerEvents() {
        this.socket.on("post:create", this.createPost.bind(this));
        this.socket.on("post:update", this.updatePost.bind(this));
        this.socket.on("post:delete", this.deletePost.bind(this));
        this.socket.on("post:read", this.readPost.bind(this));
        this.socket.on("post:listPublished", this.listPublished.bind(this));
        this.socket.on("post:listMine", this.listMine.bind(this));
        this.socket.on("post:addComment", this.addComment.bind(this));
        this.socket.on("post:updateComment", this.updateComment.bind(this));
        this.socket.on("post:deleteComment", this.deleteComment.bind(this));
        this.socket.on("post:toggleLike", this.toggleLike.bind(this));
    }

    async createPost(payload, ack) {
        try {
            const {error, value} = createPostPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.PostService.addPost(this.socket.userId, value.data);
            result.message = "Post added successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error creating post:", err);
            ack({ success: false, error: err.message });
        }
    }


    async updatePost(payload, ack) {
        try {
            const {error, value} = updatePostPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.PostService.updatePost(this.socket.userId, value.postId, value.data);
            result.message = "Post updated successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error updating post:", err);
            ack({ success: false, error: err.message });
        }
    }
    
    async deletePost(payload, ack) {
        try {
            const {error, value} = idPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.PostService.deletePost(this.socket.userId, value.postId);
            result.message = "Post deleted successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error deleting post:", err);
            ack({ success: false, error: err.message });
        }
    }

    async readPost(payload, ack) {
        try {
            const {error, value} = idPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.PostService.readPost(this.socket.userId, value.postId);
            result.message = "Post read successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error reading post:", err);
            ack({ success: false, error: err.message });
        }
    }

    async listPublished(payload, ack) {
        try {
            const {error, value} = paginationQuerySchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }

            const result = await this.PostService.listPublished(this.socket.userId, value.page, value.limit);
            ack({ success: true, 
                result:{ data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }
            });
        } catch (err) {
            ack({ success: false, error: err.message });
        }
    }
    
    async listMine(payload, ack) {
        try {
            const {error, value} = paginationQuerySchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.PostService.listMine(this.socket.userId, value.page, value.limit);
            ack({ success: true, 
                result:{ data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages}
            });
        } catch (err) {
            ack({ success: false, error: err.message });
        }
    }

    async addComment(payload, ack) {
        try {
            console.log("addComment called with payload:", payload);
            const {error, value} = addCommentPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.PostService.addComment(this.socket.userId, value.postId, value.data);
            ack({ success: true, result });
        } catch (err) {
            console.error("Error adding comment:", err);
            ack({ success: false, error: err.message });
        }
    }

    async updateComment(payload, ack) {
        try {
            const {error, value} = updateCommentPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.PostService.updateComment(this.socket.userId, value.postId, value.commentId, value.data);
            result.message = "Comment updated successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error updating comment:", err);
            ack({ success: false, error: err.message });
        }
    }

    async deleteComment(payload, ack) {
        try {
            const {error, value} = postIdCommentIdPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.PostService.deleteComment(this.socket.userId, value.postId, value.commentId);
            result.message = "Comment deleted successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error deleting comment:", err);
            ack({ success: false, error: err.message });
        }
    }

    async toggleLike(payload, ack) {
        try {
            const {error, value} = idPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await this.PostService.toggleLike(this.socket.userId, value.postId);
            result.message = "Post toggled like successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error toggling like:", err);
            ack({ success: false, error: err.message });
        }
    }
}

export default PostActions;

   
