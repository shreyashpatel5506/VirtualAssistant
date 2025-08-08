import express from 'express';
import {
    login,
    sendOtp,
    verifyOTP,
    signUP,
    updateProfile,
    getUserProfile,
    logout,
    passwordReset
} from "../controllers/auth.controller.js";
import { authmiddleware } from '../middlewear/auth.middlewear.js';


const authRoute = express.Router();

authRoute.post('/send-otp', sendOtp);
authRoute.post('/verify-otp', verifyOTP);
authRoute.post('/register', signUP);
authRoute.post('/login', login);
authRoute.post('/password-reset', passwordReset);
authRoute.post('/update-profile', authmiddleware, updateProfile);
authRoute.get('/user-profile', authmiddleware, getUserProfile);
authRoute.post('/logout', authmiddleware, logout);
export default authRoute;