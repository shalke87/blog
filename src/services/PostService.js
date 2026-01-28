import NotFoundError from '../domain/errors/NotFoundError.js';
import PostRepository from '../domain/repository/PostRepository.js';

export default {
    async addPost(userId, data) {
        data.author = userId; //associa l'autore del post all'utente loggato
        try{
            const result = await PostRepository.createPost(data);
            return result;
        } catch (error) {
            throw error;
        }
    },

    async updatePost(userId, postId, data) {
        data.author = userId; //associa l'autore del post all'utente loggato
        console.log("PostService updatePost called with data:", data);
        console.log("PostService updatePost called with params:", postId);
        try{
            const result = await PostRepository.updatePost(userId, postId, data);
            return result;
        } catch (error) {
            throw error;
        }
    },

    async deletePost(userId, postId) {
        console.log("PostService deletePost called with params:", postId);
        try{
            const result = await PostRepository.deletePost(userId, postId);
            if (!result) {
                throw new NotFoundError("Resource not found");
            }
            return result;
        } catch (error) {
            throw error;
        }
    }
}