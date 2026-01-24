class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BadRequestError';
        this.status = 400;
        this.message = message || 'Bad request';
    }
}

export default BadRequestError;