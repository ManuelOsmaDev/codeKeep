import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth as authAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar si hay token al cargar
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authAPI.getProfile();
                    setUser(response.data);
                    setIsAuthenticated(true);
                } catch (error) {
                    // Token inválido
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Apply theme when user changes
    useEffect(() => {
        console.log('Theme changed:', user?.theme);
        if (user?.theme) {
            const root = document.documentElement;

            if (user.theme === 'dark') {
                console.log('Applying dark theme');
                root.classList.add('dark');
            } else if (user.theme === 'light') {
                console.log('Applying light theme');
                root.classList.remove('dark');
            } else if (user.theme === 'auto') {
                console.log('Applying auto theme');
                // Check system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
            console.log('HTML classList:', root.classList.toString());
        }
    }, [user?.theme]);

    const login = async (email, password) => {
        console.log("login attempt", { email });
        try {
            const response = await authAPI.login({ email, password });
            console.log("login response", response.data);
            const { access_token, user: userData } = response.data;

            if (!access_token || !userData) {
                console.error("Invalid login response structure", response.data);
                throw new Error("Invalid server response");
            }

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);

            toast.success('Welcome back!');
            return { success: true };
        } catch (error) {
            console.error("Login error", error);
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const register = async (name, email, password) => {
        try {
            console.log("register");
            console.log(name, email, password);
            const response = await authAPI.register({ name, email, password });
            const { access_token, user: userData } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);

            toast.success('Account created successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value = {
        user,
        setUser: updateUser,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
