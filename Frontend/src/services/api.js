import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // console.log('API Request:', config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Response Error:', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on login page to avoid loops
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const auth = {

    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    googleLogin: () => {

        window.location.href = `${API_URL}/auth/google`;
    },
    refreshGoogleToken: () => api.post('/auth/google/refresh'),
};

// Snippets endpoints
export const snippets = {
    getAll: (filters = {}) => api.get('/snippets', { params: filters }),
    getOne: (id) => api.get(`/snippets/${id}`),
    create: (data) => api.post('/snippets', data),
    update: (id, data) => api.patch(`/snippets/${id}`, data),
    delete: (id) => api.delete(`/snippets/${id}`),
    getTags: () => api.get('/snippets/tags'),
};

// Favorites endpoints
export const favorites = {
    getAll: () => api.get('/favorites'),
    add: (snippetId) => api.post(`/favorites/${snippetId}`),
    remove: (snippetId) => api.delete(`/favorites/${snippetId}`),
};



// Google Drive endpoints
export const drive = {
    listFiles: (filters = {}) => api.get('/google-drive/files', { params: filters }),
    getFile: (fileId) => api.get(`/google-drive/files/${fileId}`),
    downloadFile: (fileId) => api.get(`/google-drive/files/${fileId}/download`, { responseType: 'blob' }),
    exportFile: (fileId, mimeType) => api.get(`/google-drive/files/${fileId}/export`, { params: { mimeType } }),
    createFile: (data) => api.post('/google-drive/files', data),
    updateFile: (fileId, data) => api.patch(`/google-drive/files/${fileId}`, data),
    deleteFile: (fileId) => api.delete(`/google-drive/files/${fileId}`),
    searchFiles: (query) => api.get(`/google-drive/search`, { params: { q: query } }),
    createFolder: (data) => api.post('/google-drive/folders', data),
    moveFile: (fileId, data) => api.patch(`/google-drive/files/${fileId}/move`, data),
    copyFile: (fileId, data) => api.post(`/google-drive/files/${fileId}/copy`, data),
    shareFile: (fileId, data) => api.post(`/google-drive/files/${fileId}/share`, data),
};

// Users endpoints
export const users = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.patch('/users/profile', data),
    getStats: () => api.get('/users/stats'),
    getAll: () => api.get('/users'),
    updatePermissions: (id, data) => api.patch(`/users/${id}/permissions`, data),
};

// Password Manager API
export const passwords = {
    hasMaster: () => api.get('/passwords/has-master'),
    setMaster: (data) => api.post('/passwords/master-password', data),
    verifyMaster: (data) => api.post('/passwords/verify-master', data),
    unlock: (data) => api.post('/passwords/unlock', data),
    list: () => api.get('/passwords'),
    decrypt: (id, data) => api.post(`/passwords/${id}/decrypt`, data),
    create: (data) => api.post('/passwords', data),
    update: (id, data) => api.patch(`/passwords/${id}`, data),
    delete: (id) => api.delete(`/passwords/${id}`)
};

export default api;
