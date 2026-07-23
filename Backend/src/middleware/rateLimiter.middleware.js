import rateLimit from "express-rate-limit"; 
//middleware that count frontend request and store in node memory/RAM but problem is if server restart then count become zero

import { RedisStore } from "rate-limit-redis"; //redis store where we store rate limit data instead of RAM

import redis from "../config/redis.js"; //redis client connection



// Function to create a Redis store.
//reuse in login, signup ...

const createStore = (prefix) =>

     new RedisStore({

        sendCommand: (...args) => redis.call(...args),
        prefix, 
   
    });

// sendCommand: (...args) => redis.call(...args),

/*
suppose express-rate-limter want to increase request count of login:abc@gmail.com
but count is sotre in redis store who to do this 
tthis way:  express-rate-limit -> sendCommand() -> Redis Client -> Redis Server
*/

//prefix
/*
suppose: createStore("login:")

Redis keys become: login:abc@gmail.com

If you create: createStore("signup:")

Redis keys become: signup:abc@gmail.com

prefix keep different limiters separate.
*/


// ==============================
// Login Limiter
// 5 requests / 1 minute
// ==============================


export const loginLimiter = rateLimit({

    store: createStore("login:"), //login redis store - store login count

    windowMs: 1 * 60 * 1000,  //1 min - Time window for counting requests

    max: 15,  //maximum 5 request send


    standardHeaders: true, // Sends modern RateLimit headers - RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset

    legacyHeaders: false, //Disable old X-RateLimit-* headers


    message: {   //Response returned when limit is exceeded

        success: false,

        message:
            "Too many login attempts. Try again after 1 minute.",

    },


});








// ==============================
// Signup Limiter
// 3 requests / 1 hour
// ==============================



export const signupLimiter = rateLimit({

    store: createStore("signup:"), //signup redis store - store signup count

    windowMs: 60 * 60 * 1000, //1 hr 
    max: 30,

    standardHeaders: true,

    legacyHeaders: false,


    message: {

        success: false,

        message:
            "Too many signup attempts. Try again later.",

    },



});





// ==============================
// Verify OTP Limiter
// 10 requests / 15 minutes
// ==============================

export const verifyOtpLimiter = rateLimit({

    store: createStore("verifyOtp:"),

    windowMs: 15 * 60 * 1000, //15 min

    max: 10,  //10 request 

    standardHeaders: true,

    legacyHeaders: false,

    message: {

        success: false,

        message:
            "Too many OTP verification attempts.",

    },

});




// ==============================
// Forgot Password Limiter
// 3 requests / 15 minutes
// ==============================

export const forgotPasswordLimiter = rateLimit({

    store:  createStore("forgotPassword:"),
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,

        message:
            "Too many password reset requests.",
    }




});


// ==============================
// Refresh Token Limiter
// 30 requests / 1 minute
// ==============================

export const refreshTokenLimiter = rateLimit({
    store: createStore("refreshToken:"),
    windowMs: 1 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many refresh requests."
    }


});


// ==============================
// General API Limiter
// For authenticated routes
// 200 requests / 15 minutes
// ==============================



export const apiLimiter = rateLimit({

    store: createStore("api:"),

    windowMs: 15 * 60 * 1000,

    max: 200,

    standardHeaders: true,

    legacyHeaders: false,

    message: {

        success: false,

        message:
            "Too many requests. Please try again later.",

    },

});



















