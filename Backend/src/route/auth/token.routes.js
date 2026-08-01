import express from 'express';
import { RefreshToken } from "../../controller/auth/token.controller.js"
import { refreshTokenLimiter } from '../../middleware/rateLimiter.middleware.js';


const router = express.Router();

router.post('/refresh-token', refreshTokenLimiter, RefreshToken)


export default router;
