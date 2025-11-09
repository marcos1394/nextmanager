import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, getAccountDetails, logoutUser, registerUser } from '../services/api';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Función interna para manejar el éxito de la autenticación.
     * Guarda tokens y actualiza el estado del usuario.
     * Esta es la fuente única de verdad para el estado de login.
     */
    const handleAuthSuccess = async (data) => {
        const { accessToken, refreshToken, user } = data;
        
        if (!accessToken || !refreshToken || !user) {
            throw new Error("Respuesta de autenticación inválida.");
        }

        // 1. Guardamos ambos tokens en la "caja fuerte" del dispositivo
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        
        // 2. Actualizamos la instancia de API para usar el nuevo token en
        //    todas las futuras peticiones de esta sesión.
        api.defaults.headers.common['Authorization'] = accessToken;
        
        // 3. Actualizamos el estado del usuario en React
        setUser(user);
    };

    /**
     * Verifica si ya existe una sesión válida al iniciar la app.
     */
    const verifySession = useCallback(async () => {
        try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            if (!accessToken) {
                return; // No hay sesión guardada
            }
            
            // Adjunta el token a la instancia de api para la primera llamada
            api.defaults.headers.common['Authorization'] = accessToken;

            // Llama al endpoint protegido
            const response = await getAccountDetails(); // Usa la función de api.js
            
            if (response.success) {
                setUser(response.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Fallo la verificación de la sesión:", error.message);
            // El interceptor de api.js intentará refrescar. Si falla, el usuario quedará null.
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        verifySession();
    }, [verifySession]);

    /**
     * Maneja el inicio de sesión del usuario.
     */
    const login = async (email, password) => {
        try {
            const response = await loginUser(email, password); // Usa la función de api.js
            await handleAuthSuccess(response.data);
            return response.data; // Devuelve los datos al componente
        } catch (error) {
            await logout(); // Llama a la función de logout para limpiar todo
            throw error;
        }
    };

    /**
     * Maneja el registro de un nuevo usuario.
     */
    const register = async (registrationData) => {
        try {
            const response = await registerUser(registrationData); // Usa la función de api.js
            await handleAuthSuccess(response.data);
            return response.data; // Devuelve los datos al componente
        } catch (error) {
            await logout(); // Llama a la función de logout para limpiar todo
            throw error;
        }
    };

    /**
     * Maneja el cierre de sesión del usuario.
     */
    const logout = async () => {
        // Notificamos al backend PRIMERO, mientras aún tenemos el token
        try {
            await logoutUser(); // Usa la función de api.js
        } catch (error) {
            console.error("Error notificando al backend sobre el logout:", error);
        }
        
        // Limpiamos todo localmente
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register, // <-- Exportamos la nueva función de registro
        logout,
        verifySession // <-- Exportamos verifySession para uso futuro
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