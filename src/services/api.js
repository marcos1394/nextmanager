import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// --- URL BASE DE TU API ---
// Usa tu dominio de producción real
const API_URL = 'https://www.nextmanager.com.mx/api';

// 1. Crea la instancia de Axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Interceptor de Petición (Request)
// Esto es clave: adjunta el accessToken a CADA petición automáticamente.
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Interceptor de Respuesta (Response)
// Maneja la expiración de tokens automáticamente.
api.interceptors.response.use(
    (response) => response, // Si todo bien, devuelve la respuesta
    async (error) => {
        const originalRequest = error.config;
        
        // Si el token expiró (error 401) y no hemos reintentado...
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Intenta obtener un nuevo accessToken usando el refreshToken
                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                if (!refreshToken) return Promise.reject(error);

                const rs = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
                const { accessToken } = rs.data;

                // Guarda el nuevo token y actualiza la cabecera por defecto
                await SecureStore.setItemAsync('accessToken', accessToken);
                api.defaults.headers.common['Authorization'] = accessToken;
                
                // Reintenta la petición original con el nuevo token
                return api(originalRequest);
            } catch (refreshError) {
                // Si el refresh falla, borra todo y rechaza
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// --- Funciones de API que tu app usará ---

export const registerUser = async (registrationData) => {
    return api.post('/auth/register', registrationData);
};

export const loginUser = async (email, password) => {
    return api.post('/auth/login', { email, password });
};

export const getAvailablePlans = async () => {
    try {
        // Hacemos un GET al endpoint de planes. 
        // No necesita autenticación porque es una ruta pública.
        const response = await api.get('/payments/plans');
        
        if (response.data.success) {
            return response.data.plans; // Devuelve solo el array de planes
        } else {
            throw new Error('No se pudieron cargar los planes.');
        }
    } catch (error) {
        throw error.response?.data || new Error('Error al obtener los planes.');
    }
};

/**
 * Llama al backend para crear una preferencia de pago en Mercado Pago.
 * @param {object} paymentData - Los datos para crear la preferencia.
 * @param {string} paymentData.planId - El ID del plan de la base de datos.
 * @param {string} paymentData.billingCycle - 'monthly' o 'annually'.
 * @param {string} paymentData.userId - El ID del perfil del usuario.
 * @param {object} paymentData.payerInfo - Información del pagador.
 */
export const createPaymentPreference = async (paymentData) => {
    try {
        const response = await api.post('/payments/create-preference', paymentData);
        return response.data; // Devuelve { success: true, init_point: '...' }
    } catch (error) {
        throw error.response?.data || new Error('Error al crear la preferencia de pago.');
    }
};

/**
 * Consulta el estado de una compra específica en nuestra base de datos.
 * Esta función es crucial para verificar el resultado de un webhook.
 * @param {string} purchaseId - El ID de la tabla 'plan_purchases'.
 */
export const getPurchaseStatus = async (purchaseId) => {
    try {
        const response = await api.get(`/payments/purchase-status/${purchaseId}`);
        return response.data; // Devuelve { success: true, status: 'active' }
    } catch (error) {
        throw error.response?.data || new Error('Error al verificar el estado de la compra.');
    }
};

/**
 * Envía el formulario de contacto al backend (notification-service).
 * Esta ruta es pública, pero el interceptor adjuntará el token si el usuario está logueado.
 * @param {object} contactData - { subject, message, userInfo }
 */
export const sendContactForm = async (contactData) => {
    try {
        const response = await api.post('/notifications/contact-form', contactData);
        return response.data; // Devuelve { success: true, message: '...' }
    } catch (error) {
        throw error.response?.data || new Error('Error al enviar el formulario de contacto.');
    }
};

/**
 * Obtiene el contenido principal para la pantalla del Centro de Ayuda.
 * (Categorías, Artículos Populares, etc.)
 */
export const getHelpCenterContent = async () => {
    try {
        // El api-gateway redirigirá /api/content -> /content-service
        const response = await api.get('/content/help-center/content');
        return response.data; // Devuelve { success: true, data: {...} }
    } catch (error) {
        throw error.response?.data || new Error('Error al cargar el centro de ayuda.');
    }
};

/**
 * Busca artículos de ayuda basados en un término de búsqueda.
 * @param {string} query - El término a buscar.
 */
export const searchHelpArticles = async (query) => {
    try {
        const response = await api.get('/content/help-center/search', {
            params: { q: query } // Envía el término como un query param
        });
        return response.data; // Devuelve { success: true, results: [...] }
    } catch (error) {
        throw error.response?.data || new Error('Error al realizar la búsqueda.');
    }
};

/**
 * CREA un nuevo artículo de ayuda (para un admin).
 * @param {object} articleData - { categoryId, title, slug, content, isPopular }
 */
export const createHelpArticle = async (articleData) => {
    try {
        const response = await api.post('/content/help-center/articles', articleData);
        return response.data; // Devuelve { success: true, article: {...} }
    } catch (error) {
        throw error.response?.data || new Error('Error al crear el artículo.');
    }
}

// ... (Aquí irán el resto de tus funciones: getAccountDetails, etc.)

export default api;