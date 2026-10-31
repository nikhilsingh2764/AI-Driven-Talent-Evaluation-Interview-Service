// Wraps an async handler so any thrown error reaches the error middleware.
const TryCatch = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        next(error);
    }
};
export default TryCatch;
