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

// Variables para manejar colas de peticiones cuando el token expira
let isRefreshingToken = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (accessToken) => {
    refreshSubscribers.map(cb => cb(accessToken));
    refreshSubscribers = [];
};

// ------------------------------------------------------------------
// --- LOGGING DE SISTEMA (INTERCEPTORES) ---
// ------------------------------------------------------------------

// 2. Interceptor de Petición (Request)
api.interceptors.request.use(
    async (config) => {
        // Log limpio para el desarrollador (Sistema)
        // console.log(`[API Request] 🚀 ${config.method.toUpperCase()} ${config.url}`);
        
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        console.error('[System] Error configurando petición:', error.message);
        return Promise.reject(error);
    }
);

// 3. Interceptor de Respuesta (Response)
api.interceptors.response.use(
    (response) => {
        // Log de éxito (opcional, descomentar para depuración profunda)
        // console.log(`[API Response] ✅ ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // --- LÓGICA DE SILENCIO INTELIGENTE ---
        // Si es un error 401 y aún no hemos reintentado, NO mostramos el error rojo todavía.
        // Asumimos que es un token expirado y el sistema intentará arreglarlo silenciosamente.
        const isRetryable = error.response?.status === 401 && !originalRequest._retry;

        if (!isRetryable) {
            // Solo mostramos errores reales o fallos definitivos
            console.error(`[API Error] ❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
            if (error.response) {
                console.error(`   Status: ${error.response.status} - ${error.response.data?.message || 'Sin mensaje'}`);
            } else if (error.request) {
                console.error('   No Response: El servidor no respondió.');
            } else {
                console.error('   Error:', error.message);
            }
        }

        // --- LÓGICA DE REFRESH TOKEN ---
        if (isRetryable) {
            originalRequest._retry = true;
            
            // Si ya estamos renovando el token, encoframos la petición en la cola
            if (isRefreshingToken) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((newToken) => {
                        originalRequest.headers['Authorization'] = newToken;
                        resolve(api(originalRequest));
                    });
                });
            }

            isRefreshingToken = true;
            
            try {
                // Log informativo de sistema (no es un error)
                console.log('[System] 🔄 Token expirado. Renovando sesión...');

                const refreshToken = await SecureStore.getItemAsync('refreshToken');
                if (!refreshToken) {
                    console.log('[System] ⚠️ No hay refresh token. Cerrando sesión.');
                    isRefreshingToken = false;
                    return Promise.reject(error);
                }

                // Llamada directa a axios para evitar bucles con el interceptor
                const rs = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
                const { accessToken } = rs.data;

                // Guardamos el nuevo token
                await SecureStore.setItemAsync('accessToken', accessToken);
                
                // Actualizamos las cabeceras
                api.defaults.headers.common['Authorization'] = accessToken;
                originalRequest.headers['Authorization'] = accessToken;

                console.log('[System] ✅ Sesión renovada. Reintentando petición original.');
                
                isRefreshingToken = false;
                onRefreshed(accessToken); // Despacha las peticiones encoladas
                
                // Reintentamos la petición original
                return api(originalRequest);

            } catch (refreshError) {
                // Si el refresh falla, entonces sí es un error fatal.
                console.error('[System] ❌ Falló la renovación de token. Forzando Logout.');
                
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                
                isRefreshingToken = false;
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

export const logoutUser = async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        // Ignoramos error de red en logout, priorizamos limpieza local
        console.warn('[System] El backend no respondió al logout, limpiando localmente.');
    } finally {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
    }
    return { success: true };
};

export const getAccountDetails = async () => {
    try {
        const response = await api.get('/auth/account-details');
        return response.data; 
    } catch (error) {
        throw error.response?.data || new Error('Error al obtener los detalles de la cuenta.');
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Error al solicitar recuperación de contraseña.');
    }
};

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

// Exportamos la instancia por defecto para usos directos (como en MonitorScreen)
export default api;