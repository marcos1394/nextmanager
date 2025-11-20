import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// --- URL BASE DE TU API ---
const API_URL = 'https://www.nextmanager.com.mx/api';

// 1. Crea la instancia de Axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ------------------------------------------------------------------
// --- LOGGING DE PETICIONES (INTERCEPTORES) ---
// ------------------------------------------------------------------

// 2. Interceptor de Petición (Request)
api.interceptors.request.use(
    async (config) => {
        console.log(`[API Request] 🚀 --> ${config.method.toUpperCase()} ${config.url}`);
        if (config.data) {
            console.log('[API Request] Payload:', JSON.stringify(config.data, null, 2));
        }

        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        console.error('[API Request Error] Error al configurar la petición:', error.message);
        return Promise.reject(error);
    }
);

// 3. Interceptor de Respuesta (Response)
api.interceptors.response.use(
    (response) => {
        console.log(`[API Response] ✅ <-- ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        console.error(`[API Error] ❌ !!!! ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
        
        if (error.response) {
            console.error('[API Error] Status:', error.response.status);
            console.error('[API Error] Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('[API Error] No Response: El servidor no respondió o está caído.', error.message);
        } else {
            console.error('[API Error] Request Setup Error:', error.message);
        }

        // Lógica de Refresh Token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                if (!refreshToken) return Promise.reject(error);

                const rs = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
                const { accessToken } = rs.data;

                await SecureStore.setItemAsync('accessToken', accessToken);
                api.defaults.headers.common['Authorization'] = accessToken;
                
                return api(originalRequest);
            } catch (refreshError) {
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// ------------------------------------------------------------------
// --- ENDPOINTS DE LA API ---
// ------------------------------------------------------------------

// --- Auth Service ---
export const registerUser = async (registrationData) => {
    return api.post('/auth/register', registrationData);
};

export const loginUser = async (email, password) => {
    return api.post('/auth/login', { email, password });
};

// ⭐ AGREGADO: Función logoutUser
export const logoutUser = async () => {
    try {
        const response = await api.post('/auth/logout');
        // Limpiar tokens del almacenamiento local
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return response.data;
    } catch (error) {
        // Incluso si el logout falla en el backend, limpiamos los tokens localmente
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        throw error.response?.data || new Error('Error al cerrar sesión.');
    }
};

// ⭐ AGREGADO: Función para recuperar contraseña
export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Error al solicitar recuperación de contraseña.');
    }
};

// ⭐ AGREGADO: Función para resetear contraseña
export const resetPassword = async (token, newPassword) => {
    try {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Error al resetear la contraseña.');
    }
};

// --- Payment Service ---
export const getAvailablePlans = async () => {
    try {
        const response = await api.get('/payments/plans');
        if (response.data.success) {
            return response.data.plans;
        } else {
            throw new Error('No se pudieron cargar los planes.');
        }
    } catch (error) {
        throw error.response?.data || new Error('Error al obtener los planes.');
    }
};

export const createPaymentPreference = async (paymentData) => {
    try {
        const response = await api.post('/payments/create-preference', paymentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Error al crear la preferencia de pago.');
    }
};

export const getPurchaseStatus = async (purchaseId) => {
    try {
        const response = await api.get(`/payments/purchase-status/${purchaseId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Error al verificar el estado de la compra.');
    }
};

// --- Notification Service ---
export const sendContactForm = async (contactData) => {
    try {
        const response = await api.post('/notifications/contact-form', contactData);
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Error al enviar el formulario de contacto.');
    }
};

// --- Content Service ---
export const getHelpCenterContent = async () => {
    try {
        const response = await api.get('/content/help-center/content');
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Error al cargar el centro de ayuda.');
    }
};

export const searchHelpArticles = async (query) => {
    try {
        const response = await api.get('/content/help-center/search', {
            params: { q: query }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Error al realizar la búsqueda.');
    }
};

export const createHelpArticle = async (articleData) => {
    try {
        const response = await api.post('/content/help-center/articles', articleData);
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Error al crear el artículo.');
    }
};

/**
 * Obtiene los detalles completos de la cuenta del usuario (Perfil, Plan, Restaurantes).
 * Ruta protegida: El interceptor adjuntará el token automáticamente.
 */
export const getAccountDetails = async () => {
    try {
        const response = await api.get('/auth/account-details');
        return response.data; // Devuelve { success: true, data: { profile: ..., plan: ... } }
    } catch (error) {
        throw error.response?.data || new Error('Error al obtener los detalles de la cuenta.');
    }
};

// --- POS Service & Restaurant Service ---
// (Aquí puedes añadir getPosLogbook, getFullRestaurantConfig, etc.)

export default api;