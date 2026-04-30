import { Author } from "./types";

export interface Post <TAuthor = string> {
    id: string;
    title: string;
    content: string;
    status: string;
    author: TAuthor;
    tags: string[]; 
    likes: string[];
    likesCount: number;
    publishedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    comments : PostComment[];
}

export interface PostToCreate {
    title: string;
    content: string;
    status: string;
    tags: string[];
    author: string;
    publishedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PaginatedPostsResult {
    data: Post<Author>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface SinglePostResult {
    data: Post<Author | string>;
}


export interface PostComment {
    id: string;
    author: Author | string; //può essere un oggetto con id, username e avatarURL se è popolato, o una stringa con l'id dell'autore se non è popolato
    text: string;
    createdAt: Date;
    updatedAt?: Date;
}

// export interface PostTag {
//     id: string;
//     name: string;
// }

type AckSuccess<T> = {
    success: true;
    result: T;
};

type AckError = {
    success: false;
    error: string;
};

export type AckResponse<T> = AckSuccess<T> | AckError;






