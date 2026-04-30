import NotFoundError from '../domain/errors/NotFoundError.js';
import PostRepository from '../domain/repository/PostRepository.js';
import TagService from './TagService.js';
import NotificationService from './NotificationService.js';
import { Server } from 'socket.io';
import { Post, PostToCreate } from '../types/postTypes.js';
import { Author } from '../types/types.js';

class PostService {
    private io : Server | null;
    
    constructor(io: Server | null = null) {
        this.io = io;
    }

    async addPost(userId : string, post: {title: string, content: string, status: string, tags: string[]}): Promise<{data: Post<string>}> {
        const postData: PostToCreate = {
            title: post.title,
            content: post.content,
            status: post.status || "draft",
            tags: post.tags || [],
            author: userId,
            publishedAt: post.status === "published" ? new Date() : undefined,
            createdAt: new Date(),
        };
        try{
            if(postData.tags && postData.tags.length > 0){
                const tagsIdResult = await TagService.normalizeAndSaveTags(postData.tags);
                postData.tags = tagsIdResult;
            }
            const result = await PostRepository.createPost(postData);
            return {data: result};
        } catch (error) {
            throw error;
        }
    }

    async updatePost(userId : string, postId: string, post: Partial<Post<string>>): Promise<{data: Post<Author>}> {
        const {tags: newTagsNames, ...postData} = post;
        postData.author = userId; //associa l'autore del post all'utente loggato
        console.log("data:", postData);
        try{
            const existingPost: Post<Author> | null = await PostRepository.getPostById(postId);
            if (!existingPost) {
                throw new NotFoundError("Resource not found");
            }
            if(existingPost.status === "draft" && post.status === "published"){
                post.publishedAt = new Date();
            }

            if (newTagsNames !== undefined){ //se sono stati passati nuovi tag o si vogliono cancellare tutti i tag
                post.tags = await TagService.updateTags(existingPost.tags, newTagsNames); //returns an array of new non duplicate tags ids
            }
            const updatedPost = await PostRepository.updatePost(userId, postId, {...post, updatedAt: new Date()}); //ritorna il post aggiornato con i nuovi tag ids
            if (!updatedPost) {
                throw new NotFoundError("Resource not found");
            }
            const populatedPost = await this.populateTagNames(updatedPost) as Post<Author>; //sostituisco gli ids dei tag con i nomi per la risposta
            return {data: populatedPost};
        } catch (error) {
            throw error;
        }
    }

    async deletePost(userId : string, postId: string): Promise<{data: Post<string>}> {
        console.log("PostService deletePost called with params:", postId);
        try{
            const result = await PostRepository.deletePost(userId, postId);
            if (!result) {
                throw new NotFoundError("Resource not found");
            }
            return {data: result};
        } catch (error) {
            throw error;
        }
    }

    async getPostById(userId : string | undefined, postId: string): Promise<{data: Post<Author>}> {
        const post = await PostRepository.getPostById(postId);

        if (!post) {
            throw new NotFoundError("Resource not found");
        }

        console.log("Post retrieved in getPostById:", post);

        if (post.status === "published") {
            const populatedPost = await this.populateTagNames(post) as Post<Author>; //sostituisco gli ids dei tag con i nomi per la risposta
            return {data: populatedPost};
        }

        if (post.status === "draft") {
            if (!userId || post.author.id !== userId) {
                console.log("userId:", userId, "post.author:", post.author.id);
                throw new NotFoundError("Resource not found");
            }
            const populatedPost = await this.populateTagNames(post) as Post<Author>; //sostituisco gli ids dei tag con i nomi per la risposta
            return {data: populatedPost};
        }
        // opzionale: gestione stati futuri
        throw new NotFoundError("Resource not found");
    }

    async listPublished(page: number, limit: number) {
        try{
            const {posts, totalDocs} = await PostRepository.getAllPublishedPosts(page, limit);
            const populatedPosts = await Promise.all(posts.map(post => this.populateTagNames(post)  ));
            console.log("Posts retrieved in listPublished:", populatedPosts);
            return { data: populatedPosts, page, limit, total: totalDocs, totalPages: Math.ceil(totalDocs / limit) };
        } catch (error) {
            throw error;
        }
    }

    async listMine(userId: string, page: number, limit: number) {
        try{
            const {posts, totalDocs} = await PostRepository.getPostsByAuthor(userId, page, limit);
            const populatedPosts = await Promise.all(posts.map(post => this.populateTagNames(post)));
            return { data: populatedPosts, page, limit, total: totalDocs, totalPages: Math.ceil(totalDocs / limit) };
        } catch (error) {
            throw error;
        }
    }

    async addComment(userId: string, postId: string, commentData: any): Promise<{data: Post<Author>}> {
        try {
            commentData.author = userId;
            commentData.createdAt = new Date();
            const updatedPost = await PostRepository.addComment(postId, commentData);
            if (!updatedPost) {
                throw new NotFoundError("Resource not found");
            }
            await NotificationService.createPostNotification(updatedPost.author.id, userId, updatedPost.id, 'comment'); // to, from, postId, type
            const populatedPost = await this.populateTagNames(updatedPost); //sostituisco gli ids dei tag con i nomi per la risposta
            return {data: populatedPost};
        } catch (error) {
            throw error;
        }
    }

    async updateComment(userId: string, postId: string, commentId: string, commentData: any): Promise<{data: Post<Author>}> {
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

    async deleteComment(userId: string, postId: string, commentId: string) {
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

    async toggleLike(userId: string, postId: string) {
        try {
            const post = await PostRepository.getPostById(postId);
            if (!post || post.status !== "published") {
                throw new NotFoundError("Resource not found");
            }
            const alreadyLiked = post.likes.some(id => id.toString() === userId);
            if(alreadyLiked) {
                // Rimuovi il like
                const result = await PostRepository.removeLike(postId, userId);
                if (!result) {
                    throw new NotFoundError("Resource not found");
                }
                const populatedPost = await this.populateTagNames(result); //sostituisco gli ids dei tag con i nomi per la risposta
                await NotificationService.createPostNotification(post.author.id, userId, post.id, 'refresh'); // to, from, postId, type
                return {liked: false, likesCount: result.likesCount, data: populatedPost};
            } else {
                // Aggiungi il like
                const result = await PostRepository.addLike(postId, userId);
                if (!result) {
                    throw new NotFoundError("Resource not found");
                }
                const populatedPost = await this.populateTagNames(result); //sostituisco gli ids dei tag con i nomi per la risposta
                await NotificationService.createPostNotification(post.author.id, userId, post.id, 'like'); // to, from, postId, type
                return {liked: true, likesCount: result.likesCount, data: populatedPost};
            }
        } catch (error) {
            throw error;
        }
    }

    async fullTextSearch(query: string, page: number, limit: number) { 
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

    async populateTagNames(post: Post<Author>): Promise<Post<Author>> {
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