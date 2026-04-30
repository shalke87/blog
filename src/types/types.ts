export * from "./userTypes.js";
export * from "./postTypes.js";

export interface UploadAvatarPayload {
    buffer: Buffer;
    filename: string;
    mimetype: string;
    size: number;
}

export interface PaginationParams {
    page: number;
    limit: number;
}








