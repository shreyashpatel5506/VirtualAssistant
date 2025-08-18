import axios from 'axios';

const API_BASE_URL =
    import.meta.env.MODE === 'development'
        ? 'http://localhost:8080/api'
        : '/api';

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});
