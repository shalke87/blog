import PostService from "../../../services/PostService.js";

export default function PostActions(socket) {
    socket.on("post:create", async (payload) => {
        try {
            const result = await PostService.addPost(socket.userId, payload);
            result.message = "Post added successfully.";
            socket.emit("post:created", { success: true, result });
        } catch (err) {
            console.error("Error creating post:", err);
            socket.emit("post:created", { success: false, error: err.message });
        }
    });


    socket.on("post:update", async (payload) => {
        console.log("Update da:", socket.userId, payload);
        const result = await PostService.updatePost(socket.userId, payload.postId, payload);
        result.message = "Post updated successfully.";
        socket.emit("post:updated", result);
    });
    
    socket.on("post:delete", async (payload) => {
        console.log("Delete da:", socket.userId, payload);
        const result = await PostService.deletePost(socket.userId, payload.postId);
        result.message = "Post deleted successfully.";
        socket.emit("post:deleted", result);
    });

    socket.on("post:read", async (payload) => {
        console.log("Read da:", socket.userId, payload);
        const result = await PostService.readPost(socket.userId, payload.postId);
        socket.emit("post:read", result);
    });

    socket.on("post:listPublished", async (payload) => {
        console.log("List Published da:", socket.userId, payload);
        const result = await PostService.listPublished(socket.userId, payload.page, payload.limit);
        socket.emit("post:publishedList", {data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages});
    });

    socket.on("post:listMine", async (payload) => {
        console.log("List Mine da:", socket.userId, payload);
        const result = await PostService.listMine(socket.userId, payload.page, payload.limit);
        socket.emit("post:mineList", {data: result.data, page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages});
    });

    socket.on("post:addComment", async (payload) => {
        console.log("Add Comment da:", socket.userId, payload);
        const result = await PostService.addComment(socket.userId, payload.postId, payload.commentData);
        result.message = "Comment added successfully.";
        socket.emit("post:commentAdded", result);
    });

    socket.on("post:updateComment", async (payload) => {
        console.log("Update Comment da:", socket.userId, payload);
        const result = await PostService.updateComment(socket.userId, payload.postId, payload.commentId, payload.commentData);
        result.message = "Comment updated successfully.";
        socket.emit("post:commentUpdated", result);
    });

    socket.on("post:deleteComment", async (payload) => {
        console.log("Delete Comment da:", socket.userId, payload);
        const result = await PostService.deleteComment(socket.userId, payload.postId, payload.commentId);
        result.message = "Comment deleted successfully.";
        socket.emit("post:commentDeleted", result);
    });

    socket.on("post:toggleLike", async (payload) => {
        console.log("Toggle Like da:", socket.userId, payload);
        const result = await PostService.toggleLike(socket.userId, payload.postId);
        console.log("post:toggleLike result:", result);
        socket.emit("post:likeToggled", result);
    });
}

   
