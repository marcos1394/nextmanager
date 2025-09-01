// src/context/AuthContext.js

import React,{ createContext, useState, useEffect, useCallback, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const verifySession = useCallback(async () => {
        try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            if (!accessToken) {
                return; // No hay sesión guardada
            }
            const response = await api.get('/auth/account-details');
            if (response.data.success) {
                setUser(response.data.data);
            }
        } catch (error) {
            console.error("Fallo la verificación de la sesión:", error.message);
            // Si el token es inválido, el interceptor de la API intentará refrescarlo.
            // Si eso también falla, el usuario permanecerá como null.
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        verifySession();
    }, [verifySession]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { accessToken, refreshToken, user } = response.data;
            
            if (accessToken && refreshToken) {
                // Guardamos ambos tokens en la "caja fuerte" del dispositivo
                await SecureStore.setItemAsync('accessToken', accessToken);
                await SecureStore.setItemAsync('refreshToken', refreshToken);
                
                // Actualizamos el estado del usuario
                setUser(user);
            }
            return response.data;
        } catch (error) {
            // Limpiamos todo en caso de un login fallido
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            setUser(null);
            throw error;
        }
    };

    const logout = async () => {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        
        // Limpiamos los tokens del almacenamiento seguro
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        setUser(null);
        
        // Notificamos al backend para invalidar el refresh token
        try {
            await api.post('/auth/logout', { refreshToken });
        } catch (error) {
            console.error("Error notificando al backend sobre el logout:", error);
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};