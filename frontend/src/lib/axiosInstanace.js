import axios from 'axios';

const apiBaseUrl =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === "development"
        ? "http://localhost:8080/api"
        : "/api");

export const axiosInstance = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
});

