import axiosInstance from '../lib/axiosInstanace';
import { create } from "zustand";
import toast from "toast";


export const authStore = create((set, get) => {
    user: null;
    isAuthenticated: false;
    loading: false;
    isSignup: false;
    isLogin: false;
    isSendOtp: false;
    isVerifyOtp: false;
    isUpdateProfile: false;


});

