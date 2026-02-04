import PostService from "../../../services/PostService.js";
import createPostPayloadSchema from "../validators/createPostPayloadSchema.js";
import updatePostPayloadSchema from "../validators/updatePostPayloadSchema.js";
import idPayloadSchema from "../validators/idPayloadSchema.js";
import paginationQuerySchema from "../validators/paginationQueryValidatorSchema.js";
import addCommentPayloadSchema from "../validators/addCommentPayloadSchema.js";
import updateCommentPayloadSchema from "../validators/updateCommentPayloadSchema.js";
import postIdCommentIdPayloadSchema from "../validators/postIdCommentIdPayloadSchema.js";

export default function PostActions(socket) {
    socket.on("post:create", async (payload, ack) => {
        try {
            const {error, value} = createPostPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await PostService.addPost(socket.userId, value.data);
            result.message = "Post added successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error creating post:", err);
            ack({ success: false, error: err.message });
        }
    });


    socket.on("post:update", async (payload, ack) => {
        try {
            const {error, value} = updatePostPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await PostService.updatePost(socket.userId, value.postId, value.data);
            result.message = "Post updated successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error updating post:", err);
            ack({ success: false, error: err.message });
        }
    });
    
    socket.on("post:delete", async (payload, ack) => {
        try {
            const {error, value} = idPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await PostService.deletePost(socket.userId, value.postId);
            result.message = "Post deleted successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error deleting post:", err);
            ack({ success: false, error: err.message });
        }
    });

    socket.on("post:read", async (payload, ack) => {
        try {
            const {error, value} = idPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await PostService.readPost(socket.userId, value.postId);
            result.message = "Post read successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error reading post:", err);
            ack({ success: false, error: err.message });
        }
    });

    socket.on("post:listPublished", async (payload, ack) => {
        try {
            const {error, value} = paginationQuerySchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }

            const result = await PostService.listPublished(socket.userId, value.page, value.limit);
            ack({ success: true, 
                result:{ data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }
            });
        } catch (err) {
            ack({ success: false, error: err.message });
        }
    });
    
    socket.on("post:listMine", async (payload, ack) => {
        try {
            const {error, value} = paginationQuerySchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await PostService.listMine(socket.userId, value.page, value.limit);
            ack({ success: true, 
                result:{ data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages}
            });
        } catch (err) {
            ack({ success: false, error: err.message });
        }
    });

    socket.on("post:addComment", async (payload, ack) => {
        try {
            const {error, value} = addCommentPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await PostService.addComment(socket.userId, value.postId, value.data);
            ack({ success: true, result });
        } catch (err) {
            console.error("Error adding comment:", err);
            ack({ success: false, error: err.message });
        }
    });

    socket.on("post:updateComment", async (payload, ack) => {
        try {
            const {error, value} = updateCommentPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await PostService.updateComment(socket.userId, value.postId, value.commentId, value.data);
            result.message = "Comment updated successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error updating comment:", err);
            ack({ success: false, error: err.message });
        }
    });

    socket.on("post:deleteComment", async (payload, ack) => {
        try {
            const {error, value} = postIdCommentIdPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await PostService.deleteComment(socket.userId, value.postId, value.commentId);
            result.message = "Comment deleted successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error deleting comment:", err);
            ack({ success: false, error: err.message });
        }
    });

    socket.on("post:toggleLike", async (payload, ack) => {
        try {
            const {error, value} = idPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const result = await PostService.toggleLike(socket.userId, value.postId);
            result.message = "Post toggled like successfully.";
            ack({ success: true, result });
        } catch (err) {
            console.error("Error toggling like:", err);
            ack({ success: false, error: err.message });
        }
    });
}

   
