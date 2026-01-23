export default function errorHandler(err, req, res, next) {
    console.error(err);
    console.log("Handling error:", err);
    if (err.name === 'ValidationError') {
        err.status = 400;
    }
    const status = err.status || 500;
    const errObject = {
        status: status,
        message: 'Internal Server Error'
    };

    if (err.status !== 500) {
        errObject.message = err.message;
        errObject.details = err.details;
    }
    console.log("status code:", status, "response:", errObject);
    res.status(status).json(errObject);
}
