import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(null);

    const api = axios.create({
        baseURL: 'http://localhost:8000/api',
    });

    api.interceptors.request.use(config => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    React.useEffect(() => {
        if (token) {
            api.get('/auth/profile/')
                .then(res => setUser(res.data))
                .catch(err => {
                    console.error("Failed to fetch user profile", err);
                    if (err.response && err.response.status === 401) {
                        logout();
                    }
                });
        } else {
            setUser(null);
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login/', { email, password });
            if (response.data.access) {
                setToken(response.data.access);
                localStorage.setItem('token', response.data.access);
                return { success: true };
            }
            return { success: false, error: 'Failed to retrieve access token.' };
        } catch (error) {
            console.error("Login failed:", error);
            const message =
                error.response?.data?.detail ||
                error.response?.data?.non_field_errors?.[0] ||
                'Invalid email or password.';
            return { success: false, error: message };
        }
    };

    const register = async (name, email, password, password_confirm) => {
        try {
            const response = await api.post('/auth/register/', { name, email, password, password_confirm });
            
            const access = response.data.tokens ? response.data.tokens.access : response.data.access;
            if (access) {
                setToken(access);
                localStorage.setItem('token', access);
                return { success: true };
            }
            return { success: false, error: 'Registration succeeded but token was missing.' };
        } catch (error) {
            console.error("Register failed:", error);
            let message = 'Registration failed.';
            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data === 'object') {
                    const errors = Object.entries(data).map(([field, msgs]) => {
                        const formattedField = field === 'non_field_errors' ? '' : `${field}: `;
                        const text = Array.isArray(msgs) ? msgs.join(', ') : msgs;
                        return `${formattedField}${text}`;
                    });
                    message = errors.join(' | ');
                } else if (typeof data === 'string') {
                    message = data;
                }
            }
            return { success: false, error: message };
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ token, user, setUser, login, register, logout, api }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
