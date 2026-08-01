import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import errorHandler from "./middleware/error.middleware.js";


import userRouter from "./route/auth/user.routes.js";
import tokenRoutes  from "./route/auth/token.routes.js"
import resumeRoutes from "./route/resume/resume.routes.js"
import analysisRouters from "./route/resume/analysis.routes.js"
import interviewRouters from "./route/interview/interview.routes.js"
import performanceRouters from "./route/performance/performance.routes.js"

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

/*
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
*/

app.use(
    cors({
        origin: [
            process.env.CLIENT_URL,
            "https://hoppscotch.io"
        ],
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

app.use((req, res, next) => {
    console.log("METHOD:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("ORIGIN:", req.headers.origin);
    next();
});



app.use('/api/v1',userRouter);  //routes at last after all middleware because when request come first go to all middleware then come to routes
app.use('/api/v1',tokenRoutes);
app.use('/api/v1',resumeRoutes)
app.use('/api/v1',analysisRouters)
app.use('/api/v1',interviewRouters)
app.use('/api/v1',performanceRouters);



// Global Error Handler (ALWAYS LAST)
app.use(errorHandler);


export default app;




























