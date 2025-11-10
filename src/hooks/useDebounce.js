// src/hooks/useDebounce.js

import { useState, useEffect } from 'react';

/**
 * Un hook personalizado que retrasa la actualización de un valor.
 * Es perfecto para evitar llamadas a la API en cada pulsación de tecla
 * en una barra de búsqueda.
 *
 * @param value El valor que se quiere "retrasar" (ej. el texto de búsqueda).
 * @param delay El tiempo en milisegundos a esperar (ej. 500).
 * @returns El valor "retrasado" (debounced).
 */
export const useDebounce = (value, delay) => {
    // Estado para guardar el valor "retrasado"
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Inicia un temporizador para actualizar el valor...
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // ... pero si el 'value' cambia (el usuario sigue escribiendo),
        // limpia el temporizador anterior y crea uno nuevo.
        // Esto se llama "cleanup function" de useEffect.
        return () => {
            clearTimeout(handler);
        };
    },
    // El efecto solo se vuelve a ejecutar si el valor (lo que escribe el usuario)
    // o el tiempo de retraso cambian.
    [value, delay]
    );

    return debouncedValue;
};