import NotFoundError from '../domain/errors/NotFoundError.js';
import PostRepository from '../domain/repository/PostRepository.js';
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
                post.tags = await TagService.updateTags(existingPost.tags, newTagsNames); //returns an array of new non duplicate tags ids
            }
            const updatedPost = await PostRepository.updatePost(userId, postId, post); //ritorna il post aggiornato con i nuovi tag ids
            const tagsObj = await TagService.getTagsByIds(updatedPost.tags);
            const result = {...updatedPost, 
                            tags: tagsObj.map(tag => tag.name) //sostituisco gli ids dei tag con i nomi
                         };
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
    },

    async readPost(userId, postId) {
        const post = await PostRepository.getPostById(postId);

        if (!post) {
            throw new NotFoundError("Resource not found");
        }

        console.log("Post retrieved in readPost:", post);

        if (post.status === "published") {
            return post;
        }

        if (post.status === "draft") {
            if (!userId || post.author.toString() !== userId) {
                throw new NotFoundError("Resource not found");
            }
            return post;
        }
        // opzionale: gestione stati futuri
        throw new NotFoundError("Resource not found");
    },

    async listPublished(userId, page, limit) {
        try{
            const {posts, totalDocs} = await PostRepository.getAllPublishedPosts(page, limit);
            return { data: posts, page, limit, total: totalDocs, totalPages: Math.ceil(totalDocs / limit) };
        } catch (error) {
            next(error);
        }
    },

    async listMine(userId, page, limit) {
        try{
            const {posts, totalDocs} = await PostRepository.getPostsByAuthor(userId, page, limit);
            return { data: posts, page, limit, total: totalDocs, totalPages: Math.ceil(totalDocs / limit) };
        } catch (error) {
            next(error);
        }
    },

    async addComment(userId, postId, commentData) {
        try {
            commentData.author = userId;
            commentData.createdAt = new Date();
            const updatedPost = await PostRepository.addComment(postId, commentData);
            if (!updatedPost) {
                throw new NotFoundError("Resource not found");
            }
            return updatedPost;
        } catch (error) {
            throw error;
        }
    },

    async updateComment(userId, postId, commentId, commentData) {
        try {
            commentData.updatedAt = new Date();
            const updatedPost = await PostRepository.updateComment(postId, commentId, userId, commentData);
            if (!updatedPost) {
                throw new NotFoundError("Resource not found");
            }
            return updatedPost;
        } catch (error) {
            throw error;
        }
    }

}

