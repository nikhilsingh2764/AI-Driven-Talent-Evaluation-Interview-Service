import Redis from "ioredis"; //ioredis - node package allow express server to communicate with redis server


const redis = new Redis(process.env.REDIS_URL);  
/*
new Redis - create new redis client  express app -> redis client -> redis server
*/

export default redis;

