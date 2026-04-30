import config from "../../config/config.js";
import PostModel, { IPost, IPostPopulated } from "../../infrastructure/database/mongoose/models/postModel.js";
import { Post, PostComment, PostToCreate } from "../../types/postTypes.js";
import { IComment } from "../../infrastructure/database/mongoose/models/commentModel.js";
import { Author } from "../../types/types.js";
import mongoose from "mongoose";


export default {
    async createPost(data: PostToCreate): Promise<Post<string>> {
        console.log("Creating post with data:", data);
        try {
            const post: IPost = await PostModel.create(data);
            return this.toPost(post);
        } catch (error) {
            console.error("Error creating post:", error);
            throw error;
        }
    },

    async updatePost(userId: string, postId: string, data: Partial<PostToCreate>): Promise<Post<Author> | null> {
        console.log("Updating post with data:", data);
        try {
            const post: IPostPopulated | null = await PostModel.findByIdAndUpdate({ _id: postId, author: userId }, data, { new: true })
                .populate("author", "username avatarURL") as IPostPopulated | null;
            return post ? this.toPopulatedPost(post) : null;
        } catch (error) {
            console.error("Error updating post:", error);
            throw error;
        }
    },

    async deletePost(userId: string, postId: string): Promise<Post<string> | null> {
        console.log("Deleting post with params:", postId);
        try {
            const post = await PostModel.findOneAndDelete({ _id: postId, author: userId });
            console.log("Post deleted:", post);
            if (!post) {
                return null;
            }
            return this.toPost(post);
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    },

    async getPostById(postId: string): Promise<Post<Author> | null> {
        try {
            const post = await PostModel.findOne({ _id: postId })
                .populate("author", "username avatarURL")
                .populate("comments.author", "username avatarURL")
                .lean() as IPostPopulated | null;
            if (!post) {
                return null;
            }
            return this.toPopulatedPost(post);
        } catch (error) {
            console.error("Error retrieving post by ID:", error);
            throw error;
        }
    },

    async getAllPublishedPosts(page: number, limit: number): Promise<{ posts: Post<Author>[]; totalDocs: number }> {
        const skip = (page - 1) * limit;
        try {
            const posts = await PostModel.find({ status: config.POST_STATUS.PUBLISHED })
                .skip(skip)
                .limit(limit)
                .sort({ publishedAt: -1 }) // Ordina per data di pubblicazione decrescente
                .populate("author", "username avatarURL")
                .populate("comments.author", "username avatarURL")
                .lean() as any[];
            const totalDocs = await PostModel.countDocuments({ status: config.POST_STATUS.PUBLISHED });
            console.log("Posts retrieved in getAllPublishedPosts:", posts);
            return { posts: posts.map(post => this.toPopulatedPost(post)), totalDocs };
        } catch (error) {
            console.error("Error listing published posts:", error);
            throw error;
        }
    },

    async fullTextSearch(query: string) {
        try {
            const posts = await PostModel.find(
                { status: config.POST_STATUS.PUBLISHED, $text: { $search: query } },  // $text è l'indice definito nel modello
                { score: { $meta: "textScore" } })
                .populate("author", "username avatarURL")
                .populate("comments.author", "username avatarURL")
                .lean() as unknown as IPostPopulated[];
            const totalDocs = await PostModel.countDocuments({ status: config.POST_STATUS.PUBLISHED });
            return { posts: posts.map(post => this.toPopulatedPost(post)), totalDocs };
        } catch (error) {
            console.error("Error listing published posts:", error);
            throw error;
        }
    },

    async getPostsByAuthor(authorId: string, page: number, limit: number): Promise<{ posts: Post<Author>[]; totalDocs: number }> {
        const skip = (page - 1) * limit;
        try {
            const posts = await PostModel.find({ author: authorId })
                .skip(skip)
                .limit(limit)
                .populate("author", "username avatarURL")
                .lean() as any[] as IPostPopulated[];

            const totalDocs = await PostModel.countDocuments({ author: authorId });
            return { posts: posts.map(post => this.toPopulatedPost(post)), totalDocs };
        } catch (error) {
            console.error("Error listing posts by author:", error);
            throw error;
        }
    },

    async addComment(postId: string, commentData: { author: string; text: string; createdAt: Date }): Promise<Post<Author> | null> {
        try {
            const updatedPost = await PostModel.findByIdAndUpdate(
                postId,
                {
                    $push: {
                        comments: {
                            author: commentData.author,
                            text: commentData.text,
                            createdAt: commentData.createdAt
                        }
                    }
                },
                { new: true }
            )
                .populate({
                    path: "comments.author",
                    select: "_id username avatarURL"
                })
                .populate({
                    path: "author",
                    select: "_id username avatarURL"
                }) as IPostPopulated | null;

            if (!updatedPost) {
                return null;
            }
            console.log("Comment added to post:", this.toPopulatedPost(updatedPost));
            return this.toPopulatedPost(updatedPost);
        } catch (error) {
            console.error("Error adding comment to post:", error);
            throw error;
        }
    },

    async updateComment(postId: string, commentId: string, userId: string, commentData: { text: string; updatedAt: Date }): Promise<Post<Author> | null> {
        try {
            const updatedPost = await PostModel.findOneAndUpdate(
                { _id: postId, "comments._id": commentId, "comments.author": userId },
                {
                    $set: {
                        "comments.$.text": commentData.text,
                        "comments.$.updatedAt": commentData.updatedAt
                    }
                },
                { new: true }
            ).populate({
                path: "comments.author",
                select: "_id username avatarURL"
            })
                .populate({
                    path: "author",
                    select: "_id username avatarURL"
                }) as IPostPopulated | null;

            if (!updatedPost) {
                return null;
            }
            console.log("Comment updated in post:", this.toPopulatedPost(updatedPost));
            return this.toPopulatedPost(updatedPost);
        } catch (error) {
            console.error("Error updating comment in post:", error);
            throw error;
        }
    },

    async deleteComment(postId: string, commentId: string, userId: string) {
        try {
            const updatedPost = await PostModel.findOneAndUpdate(
                { _id: postId, "comments._id": commentId, "comments.author": userId },
                {
                    $pull: {
                        comments: { _id: commentId }
                    }
                },
                { new: true }
            ).populate("author", "username avatarURL")
                .populate({
                    path: "comments.author",
                    select: "_id username avatarURL"
                }) as IPostPopulated | null;

            if (!updatedPost) {
                return null;
            }
            console.log("Comment deleted from post:", this.toPopulatedPost(updatedPost));
            return this.toPopulatedPost(updatedPost);
        } catch (error) {
            console.error("Error deleting comment from post:", error);
            throw error;
        }
    },

    async addLike(postId: string, userId: string) {
        const result = await PostModel.findByIdAndUpdate(
            { _id: postId },
            { $addToSet: { likes: userId }, $inc: { likesCount: 1 } },
            { new: true }
        ).populate("author", "username avatarURL")
            .populate("comments.author", "username avatarURL")
            .lean() as IPostPopulated | null;
        return result ? this.toPopulatedPost(result) : null;
    },

    async removeLike(postId: string, userId: string) {
        const result = await PostModel.findByIdAndUpdate(
            { _id: postId },
            { $pull: { likes: userId }, $inc: { likesCount: -1 } },
            { new: true }
        ).populate("author", "username avatarURL")
            .populate("comments.author", "username avatarURL")
            .lean() as IPostPopulated | null;
        return result ? this.toPopulatedPost(result) : null;
    },

    async getPublishedPostsByTagIds(tagIds: string[]): Promise<Post<Author>[]> {
        try {
            const posts = await PostModel.find(
                { status: config.POST_STATUS.PUBLISHED, tags: { $in: tagIds } }
            )
                .populate("author", "username avatarURL")
                .populate("comments.author", "username avatarURL")
                .lean() as any[];
            return posts.map(post => this.toPopulatedPost(post));
        } catch (error) {
            console.error("Error retrieving posts by tag IDs:", error);
            throw error;
        }
    },

    toPost(iPost: IPost): Post<string> {
        return {
            id: iPost._id.toString(),
            title: iPost.title,
            content: iPost.content,
            author: iPost.author.toString(),
            status: iPost.status,
            likes: iPost.likes.map(id => id.toString()),
            likesCount: iPost.likesCount,
            comments: iPost.comments.map(comment => this.toComment(comment)),
            tags: iPost.tags.map(e => e.toString()),
            publishedAt: iPost.publishedAt ?? undefined,
        };
    },

    toPopulatedPost(iPost: IPostPopulated): Post<Author> {
        return {
            id: iPost._id.toString(),
            title: iPost.title,
            content: iPost.content,
            author: {
                id: iPost.author._id.toString(),
                username: iPost.author.username,
                avatarURL: iPost.author.avatarURL
            },
            status: iPost.status,
            likes: iPost.likes.map(id => id.toString()),
            likesCount: iPost.likesCount,
            comments: iPost.comments.map(comment => this.toComment(comment)),
            tags: iPost.tags.map(e => e.toString()),
            publishedAt: iPost.publishedAt ?? undefined,
            updatedAt: iPost.updatedAt ?? undefined,
        };
    },

    toComment(comment: IComment): PostComment {
        return {
            id: comment._id.toString(),
            author: comment.author instanceof mongoose.Types.ObjectId ? comment.author.toString() : {
                id: comment.author._id.toString(),
                username: comment.author.username,
                avatarURL: comment.author.avatarURL
            },
            text: comment.text,
            createdAt: comment.createdAt,
        };

    }
}