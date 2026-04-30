class NotFoundError extends Error {
    status: number;
    name : string;
    message : string;
    
    constructor(message : string) {
        super(message);
        this.name = 'NotFoundError';
        this.status = 404;
        this.message = message || 'Resource not found';
    }
}

export default NotFoundError;