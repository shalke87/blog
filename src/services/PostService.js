import NotFoundError from '../domain/errors/NotFoundError.js';
import PostRepository from '../domain/repository/PostRepository.js';
import TagService from './TagService.js';
import NotificationService from './NotificationService.js';

class PostService {

    constructor(io = null) {
        this.io = io;
        this.notificationService = new NotificationService(this.io);
    }

    async addPost(userId, data) {
        data.author = userId; //associa l'autore del post all'utente loggato
        const {tags, ...post} = data;
        if(post.status === "published"){
            post.publishedAt = new Date();
        }
        post.createdAt = new Date();
        try{
            if(tags){
                const tagsIdResult = await TagService.normalizeAndSaveTags(tags);
                post.tags = tagsIdResult;
            }
            const result = await PostRepository.createPost(post);
            return {data: result};
        } catch (error) {
            throw error;
        }
    }

    async updatePost(userId, postId, data) {
        const {tags: newTagsNames, ...post} = data;
        post.author = userId; //associa l'autore del post all'utente loggato
        console.log("data:", data);
        try{
            const existingPost = await PostRepository.getPostById(postId);
            if (!existingPost) {
                throw new NotFoundError("Resource not found");
            }
            if(existingPost.status === "draft" && post.status === "published"){
                post.publishedAt = new Date();
            }

            if (newTagsNames !== undefined){ //se sono stati passati nuovi tag o si vogliono cancellare tutti i tag
                post.tags = await TagService.updateTags(existingPost.tags, newTagsNames); //returns an array of new non duplicate tags ids
            }
            const updatedPost = await PostRepository.updatePost(userId, postId, post); //ritorna il post aggiornato con i nuovi tag ids
            const populatedPost = await this.populateTagNames(updatedPost); //sostituisco gli ids dei tag con i nomi per la risposta
            return {data: populatedPost};
        } catch (error) {
            throw error;
        }
    }

    async deletePost(userId, postId) {
        console.log("PostService deletePost called with params:", postId);
        try{
            const result = await PostRepository.deletePost(userId, postId);
            if (!result) {
                throw new NotFoundError("Resource not found");
            }
            const populatedPost = await this.populateTagNames(result); //sostituisco gli ids dei tag con i nomi per la risposta
            return {data: populatedPost};
        } catch (error) {
            throw error;
        }
    }

    async readPost(userId, postId) {
        const post = await PostRepository.getPostById(postId);

        if (!post) {
            throw new NotFoundError("Resource not found");
        }

        console.log("Post retrieved in readPost:", post);

        if (post.status === "published") {
            const populatedPost = await this.populateTagNames(post); //sostituisco gli ids dei tag con i nomi per la risposta
            return {data: populatedPost};
        }

        if (post.status === "draft") {
            if (!userId || post.author.toString() !== userId) {
                throw new NotFoundError("Resource not found");
            }
            const populatedPost = await this.populateTagNames(post); //sostituisco gli ids dei tag con i nomi per la risposta
            return {data: populatedPost};
        }
        // opzionale: gestione stati futuri
        throw new NotFoundError("Resource not found");
    }

    async listPublished(userId, page, limit) {
        try{
            const {posts, totalDocs} = await PostRepository.getAllPublishedPosts(page, limit);
            const populatedPosts = await Promise.all(posts.map(post => this.populateTagNames(post)));
            console.log("Posts retrieved in listPublished:", populatedPosts);
            return { data: populatedPosts, page, limit, total: totalDocs, totalPages: Math.ceil(totalDocs / limit) };
        } catch (error) {
            next(error);
        }
    }

    async listMine(userId, page, limit) {
        try{
            const {posts, totalDocs} = await PostRepository.getPostsByAuthor(userId, page, limit);
            const populatedPosts = await Promise.all(posts.map(post => this.populateTagNames(post)));
            return { data: populatedPosts, page, limit, total: totalDocs, totalPages: Math.ceil(totalDocs / limit) };
        } catch (error) {
            next(error);
        }
    }

    async addComment(userId, postId, commentData) {
        try {
            commentData.author = userId;
            commentData.createdAt = new Date();
            const updatedPost = await PostRepository.addComment(postId, commentData);
            if (!updatedPost) {
                throw new NotFoundError("Resource not found");
            }
            await this.notificationService.createPostNotification(updatedPost.author, userId, updatedPost._id, 'comment'); // to, from, postId, type
            const populatedPost = await this.populateTagNames(updatedPost); //sostituisco gli ids dei tag con i nomi per la risposta
            return {data: populatedPost};
        } catch (error) {
            throw error;
        }
    }

    async updateComment(userId, postId, commentId, commentData) {
        try {
            commentData.updatedAt = new Date();
            const updatedPost = await PostRepository.updateComment(postId, commentId, userId, commentData);
            if (!updatedPost || updatedPost.status !== "published") {
                throw new NotFoundError("Resource not found");
            }
            const populatedPost = await this.populateTagNames(updatedPost); //sostituisco gli ids dei tag con i nomi per la risposta
            return {data: populatedPost};
        } catch (error) {
            throw error;
        }
    }

    async deleteComment(userId, postId, commentId) {
        try {
            const updatedPost = await PostRepository.deleteComment(postId, commentId, userId);
            if (!updatedPost) {
                throw new NotFoundError("Resource not found");
            }
            const populatedPost = await this.populateTagNames(updatedPost); //sostituisco gli ids dei tag con i nomi per la risposta
            return {data: populatedPost};
        } catch (error) {
            throw error;
        }
    }

    async toggleLike(userId, postId) {
        try {
            const post = await PostRepository.getPostById(postId);
            if (!post || post.status !== "published") {
                throw new NotFoundError("Resource not found");
            }
            const alreadyLiked = post.likes.some(id => id.toString() === userId);
            if(alreadyLiked) {
                const result = await PostRepository.removeLike(postId, userId);
                return {liked: false, likesCount: result.likesCount, data: result};
            } else {
                // Aggiungi il like
                const result = await PostRepository.addLike(postId, userId);
                await this.notificationService.createPostNotification(post.author, userId, post._id, 'like'); // to, from, postId, type
                return {liked: true, likesCount: result.likesCount, data: result};
            }
        } catch (error) {
            throw error;
        }
    }

    async fullTextSearch(query, page, limit) { 
        try {
            const {posts, totalDocs} = await PostRepository.fullTextSearch(query);
            const tagIds = await TagService.fullTextSearch(query);
            const postsByTags = await PostRepository.getPublishedPostsByTagIds(tagIds);
            const allPosts = [...new Set([...posts, ...postsByTags])]; // Rimuove i duplicati
            // Implementazione della paginazione manuale sui risultati combinati
            const start = (page - 1) * limit;
            const end = start + limit;
            const paginated = allPosts.slice(start, end);
            const populatedPosts = await Promise.all(paginated.map(post => this.populateTagNames(post)));
            return { data: populatedPosts, page, limit, total: totalDocs, totalPages: Math.ceil(totalDocs / limit) };
        } catch (error) {
            throw error;
        }
    }

    async populateTagNames(post) {
        try {
            const tagsObj = await TagService.getTagsByIds(post.tags);
            const postWithTagNames = {...post, 
                                    tags: tagsObj.map(tag => tag.name) //sostituisco gli ids dei tag con i nomi
            };
            return postWithTagNames;
        } catch (error) {
            throw error;
        }   
    }

}

export default PostService;