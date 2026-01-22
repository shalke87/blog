export default function errorHandler(err, req, res, next) {
    console.error(err);

    const status = err.status || 500;
    const errObject = {
        status: status,
        message: 'Internal Server Error'
    };

    if (err.status !== 500) {
        errObject.message = err.message;
        errObject.details = err.details;
    }
    res.status(status).json(errObject);
}
