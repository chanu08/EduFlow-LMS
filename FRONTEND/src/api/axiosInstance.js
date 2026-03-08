import axios from 'axios';

/**
 * Shared Axios instance for the EduFlow API.
 *
 * Base URL is read from the Vite environment variable VITE_API_URL.
 * - Local dev  → set in FRONTEND/.env          → http://localhost:5000
 * - Production → set in Vercel dashboard        → https://your-api.onrender.com
 *
 * Usage (replace any direct axios import):
 *   import api from '../api/axiosInstance';
 *   const res = await api.get('/api/courses');
 *
 * The Authorization header is attached automatically when a token exists in
 * localStorage, so most call sites don't need to pass it manually.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT automatically ──────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Response interceptor: global 401 redirect ─────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const isAuthEndpoint = url.includes('/api/auth/');

        // Only auto-logout on protected-route 401s — NOT on login/register
        // (wrong password → 401 should show error message, not redirect)
        if (error.response?.status === 401 && !isAuthEndpoint) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
