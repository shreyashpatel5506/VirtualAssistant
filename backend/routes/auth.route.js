import express from 'express';
import { authController } from "../controllers/auth.controller.js";
import { authmiddleware } from '../middlewear/auth.middlewear.js';


const authRoute = express.Router();

authRoute.post('/send-otp', authController.sendOtp);
authRoute.post('/verify-otp', authController.verifyOTP);
authRoute.post('/register', authController.register);
authRoute.post('/login', authController.login);
authRoute.post('/password-reset', authController.passwordReset);
authRoute.post('/update-profile', authmiddleware, authController.updateProfile);
authRoute.get('/user-profile', authmiddleware, authController.getUserProfile);
authRoute.post('/logout', authmiddleware, authController.logout);
export default authRoute;