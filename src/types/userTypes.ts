export interface User {
    id: string;
    username: string;
    email: string;
    avatarURL: string | null;
    status: string;
    createdAt: Date;
    hashedPassword: string;
    resetToken?: string | null;
    resetTokenExpiration?: Date | null;
    emailVerificationToken?: string | null;
    emailVerificationTokenExpiration?: Date | null;
}

export interface PublicUser {
    id: string;
    username: string;
    email: string;
    avatarURL: string | null;
    status: string;
    createdAt: Date;
}

export interface Author {
    id: string;
    username: string;
    avatarURL: string | null;
}