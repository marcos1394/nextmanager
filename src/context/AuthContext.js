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
     */
    const handleAuthSuccess = async (data) => {
        const { accessToken, refreshToken, user } = data;
        
        if (!accessToken || !refreshToken || !user) {
            throw new Error("Respuesta de autenticación inválida.");
        }

        // 1. Guardamos ambos tokens y los datos básicos del usuario
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        await SecureStore.setItemAsync('userData', JSON.stringify(user));
        
        // 2. Actualizamos la instancia de API
        api.defaults.headers.common['Authorization'] = accessToken;
        
        // 3. Actualizamos el estado
        setUser(user);
    };

    /**
     * Verifica si ya existe una sesión válida al iniciar la app.
     * Retorna los datos del usuario para uso inmediato.
     */
    const verifySession = useCallback(async () => {
        try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            if (!accessToken) {
                return null; // No hay sesión
            }
            
            api.defaults.headers.common['Authorization'] = accessToken;

            const response = await getAccountDetails(); 
            
            if (response.success) {
                // Sincronizar el caché fresco
                await SecureStore.setItemAsync('userData', JSON.stringify(response.data));
                setUser(response.data);
                return response.data; 
            } else {
                setUser(null);
                return null;
            }
        } catch (error) {
            console.error("Fallo la verificación de la sesión:", error.message);
            // Si es un error de red (no es un 401 fatal), intentar usar el caché
            if (error?.message !== 'Error al obtener los detalles de la cuenta.' && !error?.statusCode) {
                try {
                    const cachedUser = await SecureStore.getItemAsync('userData');
                    if (cachedUser) {
                        const parsedUser = JSON.parse(cachedUser);
                        setUser(parsedUser);
                        console.log('[AuthContext] Usando caché local temporal por falla de red.');
                        return parsedUser;
                    }
                } catch (cacheError) {
                    console.log('Error leyendo caché:', cacheError);
                }
            }
            // Si falla y no hay caché (y el refresh token falló), limpiamos el usuario
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        verifySession();
    }, [verifySession]);

    /**
     * Maneja el inicio de sesión y devuelve la ruta de redirección.
     */
    const login = async (email, password) => {
        try {
            // 1. Llamada a la API
            const response = await loginUser(email, password); 
            
            // 2. Guardado de sesión
            await handleAuthSuccess(response.data);
            
            // 3. Obtención de datos frescos y completos (incluyendo 'plan' y 'restaurants')
            const userData = await verifySession();

            if (!userData) {
                throw new Error('Error al verificar el perfil del usuario.');
            }

            // Ya no regresamos strings mágicos para la navegación. 
            // AppNavigator se encargará automáticamente observando el estado de autenticación.
            return userData;

        } catch (error) {
            await logout(); 
            throw error;
        }
    };

    /**
     * Maneja el registro.
     */
    const register = async (registrationData) => {
        try {
            const response = await registerUser(registrationData);
            await handleAuthSuccess(response.data);
            // El registro siempre redirige a planes, así que no necesitamos lógica compleja aquí
            return response.data;
        } catch (error) {
            await logout();
            throw error;
        }
    };

    /**
     * Cierra sesión.
     */
    const logout = async () => {
        try {
            await logoutUser(); 
        } catch (error) {
            console.error("Error notificando al backend sobre el logout:", error);
        }
        
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('userData');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        verifySession
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};