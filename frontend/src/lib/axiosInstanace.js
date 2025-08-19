


import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "devlopment" ? "https://localhost:8080/api" : "/api",
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Set a timeout of 10 seconds
});

