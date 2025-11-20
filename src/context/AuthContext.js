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

        // 1. Guardamos ambos tokens
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        
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
                setUser(response.data);
                return response.data; // <-- CORRECCIÓN: Devolvemos los datos
            } else {
                setUser(null);
                return null;
            }
        } catch (error) {
            console.error("Fallo la verificación de la sesión:", error.message);
            // Si falla (y el refresh token también falla), limpiamos el usuario
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

            // 4. Lógica de Redirección Inteligente
            // Caso A: Sin plan
            if (!userData.plan?.name || userData.plan.name === 'Sin Plan Activo') {
                return '/plans';
            }
            
            // Caso B: Con plan pero sin configurar (En mobile esto va al dashboard igual)
            if (!userData.restaurants || userData.restaurants.length === 0) {
                // return '/restaurant-config'; // En web iríamos aquí
                return '/dashboard'; // En mobile vamos directo al dashboard
            }
            
            // Caso C: Todo listo
            return '/dashboard';

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