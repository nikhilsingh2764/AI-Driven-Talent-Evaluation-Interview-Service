const TryCatch = (Handler) => {

    return async (req, res, next) => {
        try {

            await Handler(req,res,next);

        } catch (error) {

            next(error);

        }
    }

}



export default TryCatch;

