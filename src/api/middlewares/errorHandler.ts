import { Request, Response, NextFunction } from "express";

interface ErrorResponse extends Error {
    status?: number;
    details?: string;
}

export default function errorHandler(err: ErrorResponse, req: Request, res: Response, next: NextFunction) {
    console.error(err);
    console.log("Handling error:", err );
    if (err.name === 'ValidationError') {
        err.status = 400;
    }
    const status : number = err.status || 500;
    const errObject  = {
        status: status,
        message: 'Internal Server Error',
        details: err.details 
    };

    if (status !== 500) {
        errObject.message = err.message;
        errObject.details = err.details || String(err);
    }
    console.log("status code:", status, "response:", errObject);
    res.status(status).json(errObject);
}
