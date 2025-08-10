import {axiosInstance} from '../lib/axiosInstanace.js';
import { create } from "zustand";
import { toast } from 'react-hot-toast';


export const authStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    isSignup: false,
    isLogin: false,
    isSendOtp: false,
    isVerifyOtp: false,
    isUpdateProfile: false,

    sendOtp: async (email) => {
        try {
            const response = await axiosInstance.post('/auth/send-otp', { email });
            if (response.data.success) {
                toast.success("OTP sent successfully");
                set({ isSendOtp: true });
            } else {
                toast.error("Failed to send OTP");
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            toast.error("Error sending OTP");
        }
    },

    verifyOtp: async (email, otp) => {
        try {
            const response = await axiosInstance.post('/auth/verify-otp', { email, otp });
            if (response.data.success) {
                toast.success("OTP verified successfully");
                set({ isVerifyOtp: true });
            } else {
                toast.error("Invalid OTP");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            toast.error("Error verifying OTP");
        }
    },

    signUP: async (name, email, password) => {
        try {
            const response = await axiosInstance.post('/auth/register', { name, email, password });
            if (response.data.success) {
                toast.success("Sign up successful");
                set({ isSignup: true });
            } else {
                toast.error("Sign up failed");
            }
        } catch (error) {
            console.error("Error during sign up:", error);
            toast.error("Error during sign up");
        }
    },

    login: async (email, password) => {
        try {
            const response = await axiosInstance.post('/auth/login', { email, password });
            if (response.data.success) {
                toast.success("Login successful");
                set({ isLogin: true });
            } else {
                toast.error("Login failed");
            }
        } catch (error) {
            console.error("Error during login:", error);
            toast.error("Error during login");
        }
    },

    passwordReset: async (email) => {
        try {
            const response = await axiosInstance.post('/auth/password-reset', { email });
            if (response.data.success) {
                toast.success("Password reset link sent");
            } else {
                toast.error("Failed to send password reset link");
            }
        } catch (error) {
            console.error("Error during password reset:", error);
            toast.error("Error during password reset");
        }
    },
}));

