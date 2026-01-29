import { get } from 'mongoose';
import NotFoundError from '../domain/errors/NotFoundError.js';
import PostRepository from '../domain/repository/PostRepository.js';
import TagRepository from '../domain/repository/TagRepository.js';
import TagService from './TagService.js';

export default {
    async addPost(userId, data) {
        data.author = userId; //associa l'autore del post all'utente loggato
        const {tags, ...post} = data;
        try{
            const tagsIdResult = await TagService.normalizeAndSaveTags(tags);
            post.tags = tagsIdResult;
            const result = await PostRepository.createPost(post);
            return result;
        } catch (error) {
            throw error;
        }
    },

    async updatePost(userId, postId, data) {
        const {tags: newTagsNames, ...post} = data;
        post.author = userId; //associa l'autore del post all'utente loggato
        console.log("data:", data);
        try{
            const existingPost = await PostRepository.getPostById(postId);
            if (!existingPost) {
                throw new NotFoundError("Resource not found");
            }
            if (newTagsNames !== undefined){ //se sono stati passati nuovi tag o si vogliono cancellare tutti i tag
                post.tags = await TagService.updateTags(existingPost.tags, newTagsNames); //returns an array of new non duplicate tagsIDs
            }
            const result = await PostRepository.updatePost(userId, postId, post);
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