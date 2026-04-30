class BadRequestError extends Error {
    status: number;
    constructor(message : string) {
        super(message);
        this.name = 'BadRequestError';
        this.status = 400;
        this.message = message || 'Bad request';
    }
}

export default BadRequestError;