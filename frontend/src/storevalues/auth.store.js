import axiosInstance from '../lib/axiosInstanace';
import { create } from "zustand";
import toast from "toast";
import { sendOtp } from './../../../backend/controllers/auth.controller';


export const authStore = create((set, get) => {
    user: null;
    isAuthenticated: false;
    loading: false;
    isSignup: false;
    isLogin: false;
    isSendOtp: false;
    isVerifyOtp: false;
    isUpdateProfile: false;

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
    };

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
    };

    // signup: async (userData) => {

});

