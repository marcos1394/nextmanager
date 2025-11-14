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
// Se ejecuta ANTES de que cualquier petición sea enviada.
api.interceptors.request.use(
    async (config) => {
        // --- LOG PARA TU TERMINAL ---
        console.log(`[API Request] 🚀 --> ${config.method.toUpperCase()} ${config.url}`);
        if (config.data) {
            console.log('[API Request] Payload:', JSON.stringify(config.data, null, 2));
        }
        // --- FIN DE LOG ---

        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        // Log si la petición ni siquiera se pudo configurar
        console.error('[API Request Error] Error al configurar la petición:', error.message);
        return Promise.reject(error);
    }
);

// 3. Interceptor de Respuesta (Response)
// Se ejecuta DESPUÉS de recibir cualquier respuesta del backend.
api.interceptors.response.use(
    (response) => {
        // --- LOG PARA TU TERMINAL ---
        // Loguea cualquier respuesta exitosa (2xx)
        console.log(`[API Response] ✅ <-- ${response.status} ${response.config.url}`);
        // --- FIN DE LOG ---
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // --- LOG DE ERROR DETALLADO (PARA TU TERMINAL) ---
        // Aquí es donde veremos el 502 Bad Gateway
        console.error(`[API Error] ❌ !!!! ${error.config.method.toUpperCase()} ${error.config.url}`);
        
        if (error.response) {
            // El servidor respondió con un error (4xx, 5xx)
            console.error('[API Error] Status:', error.response.status); // Ej: 502
            console.error('[API Error] Data:', JSON.stringify(error.response.data, null, 2)); // Ej: El HTML de "Bad Gateway"
        } else if (error.request) {
            // La petición se hizo pero no hubo respuesta (ej. sin internet, 502)
            console.error('[API Error] No Response: El servidor no respondió o está caído.', error.message);
        } else {
            // Error al configurar la petición
            console.error('[API Error] Request Setup Error:', error.message);
        }
        // --- FIN DE LOG ---

        // Lógica de Refresh Token (tu código actual)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                if (!refreshToken) return Promise.reject(error);

                // El refresh-token no debe loguearse a sí mismo para evitar bucles
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

// (Aquí irían tus otras funciones de auth: logoutUser, passwordForgot, etc.)

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

// --- POS Service & Restaurant Service ---
// (Aquí puedes añadir getPosLogbook, getFullRestaurantConfig, etc.)

export default api;