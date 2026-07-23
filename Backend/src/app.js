import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import userRouter from "./route/user.Router.js";
import tokenRoutes  from "./route/token.routes.js"
import errorHandler from "./middleware/error.middleware.js";

const app = express();

//app.use()   //express method used to register/add middleware runs for every incoming requests.
//parse= read raw data, understand its format and convert into Javascript Object

console.log("APP LOADED");

app.set("trust proxy", 1);

// Security
app.use(helmet());  //adds security-related HTTP headers to protect an Express application from common web attacks.



app.use((req, res, next) => {
    console.log("METHOD:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("ORIGIN:", req.headers.origin);
    next();
});


app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);




// Parse/convert JSON into a JavaScript object and stores it in req.body. || frontend -> express.json() -> req.body
app.use(express.json());



// Parse URL-encoded Form Data and store in req.body
app.use(express.urlencoded({ extended: true }));



// parses cookies from the request and stored in req.cookies.
app.use(cookieParser());



// HTTP Request Logger that logs HTTP requests for debugging and monitoring.
app.use(morgan("dev"));



app.use('/api/v1',userRouter);  //routes at last after all middleware because when request come first go to all middleware then come to routes
app.use('/api/v1',tokenRoutes);


// Global Error Handler (ALWAYS LAST)
app.use(errorHandler);


export default app;




























