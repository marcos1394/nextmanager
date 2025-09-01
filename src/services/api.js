// src/services/api.js

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// La IP de tu servidor. En producción, será tu dominio.
const API_URL = 'https://192.168.0.200/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR DE PETICIÓN (Request) ---
// Antes de que cualquier petición se envíe, este interceptor se asegura
// de que lleve el token de acceso en las cabeceras.
api.interceptors.request.use(
  async (config) => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    if (accessToken) {
      config.headers.Authorization = accessToken; // Ya debe tener el formato "Bearer ..."
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTOR DE RESPUESTA (Response) ---
// Este interceptor se activa si una petición falla por un error de autenticación (401).
// Su trabajo es intentar refrescar el token y reintentar la petición original.
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, no hace nada.
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es un 401 y no es una petición de refresco fallida
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marcamos para evitar bucles infinitos

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) return Promise.reject(error);

        // Pedimos un nuevo token de acceso usando el de refresco
        const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken: newAccessToken } = response.data;
        
        // Guardamos el nuevo token de acceso
        await SecureStore.setItemAsync('accessToken', newAccessToken);

        // Actualizamos la cabecera de la petición original y la reintentamos
        api.defaults.headers.common['Authorization'] = newAccessToken;
        originalRequest.headers['Authorization'] = newAccessToken;
        
        return api(originalRequest);
        
      } catch (refreshError) {
        // Si el refresco falla (ej. el refreshToken también expiró), cerramos la sesión.
        // Aquí podrías llamar a una función de logout global.
        console.error("Refresh token inválido. Cerrando sesión.", refreshError);
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        // Redirigir al login
      }
    }
    return Promise.reject(error);
  }
);

export default api;