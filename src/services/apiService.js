import axios from 'axios';

const API_MACFER = 'https://macfer.crepesywaffles.com/api';
const API_ALOHA = 'https://apialohav2.crepesywaffles.com/buk';

// Variables para caché en memoria (evita recargas al cambiar de ruta)
let cacheEmpleados = null;
let empleadosRequest = null;
let reservasRequest = null;

export const getPersistedDashboardCache = () => {
    return {
        empleados: [],
        reservas: [],
        isReady: false
    };
};

// Obtener todos los empleados usando caché en memoria durante la sesión actual.
export const getEmpleados = async (forceRefresh = false) => {
    if (!forceRefresh) {
        if (cacheEmpleados) {
            return cacheEmpleados;
        }
    }

    if (empleadosRequest) {
        return empleadosRequest;
    }

    empleadosRequest = axios.get(`${API_ALOHA}/empleados3`)
        .then((response) => {
            cacheEmpleados = response.data.data || [];
            return cacheEmpleados;
        })
        .finally(() => {
            empleadosRequest = null;
        });

    return empleadosRequest;
};

// Obtener todas las reservas siempre desde la API, deduplicando solo la petición en vuelo.
export const getReservas = async () => {
    if (reservasRequest) {
        return reservasRequest;
    }

    reservasRequest = axios.get(`${API_MACFER}/Sintonizarte-v2-reservas?pagination[pageSize]=1000`)
        .then((response) => response.data.data || [])
        .finally(() => {
            reservasRequest = null;
        });

    return reservasRequest;
};

export const getDashboardBootstrapData = async (forceRefresh = false) => {
    const [reservas, empleados] = await Promise.all([
        getReservas(),
        getEmpleados(forceRefresh)
    ]);

    return {
        reservas,
        empleados
    };
};

// Obtener reservas por fecha específica
export const getReservasByFecha = async (fechaId) => {
    const response = await axios.get(
        `${API_MACFER}/sintonizarte-v2-reservas?populate=*&filters[sintonizarte_v_2_][id]=${fechaId}&pagination[pageSize]=1000`
    );
    return response.data.data || [];
};

// Obtener fechas disponibles
export const getFechas = async () => {
    const response = await axios.get(`${API_MACFER}/sintonizarte-V2s?pagination[pageSize]=500`);
    return response.data.data || [];
};

// Actualizar asistencia de una reserva
export const updateAsistencia = async (reservaId, confirm) => {
    const response = await axios.put(
        `${API_MACFER}/sintonizarte-v2-reservas/${reservaId}`,
        { data: { confirm } }
    );

    return response.data;
};

// Actualizar acompañante de una reserva
export const updateAcompanante = async (reservaId, llevaAcompanante) => {
    const response = await axios.put(
        `${API_MACFER}/sintonizarte-v2-reservas/${reservaId}`,
        { data: { llevaAcompanante } }
    );

    return response.data;
};

// Eliminar una reserva
export const deleteReserva = async (reservaId) => {
    const response = await axios.delete(
        `${API_MACFER}/sintonizarte-v2-reservas/${reservaId}`
    );

    return response.data;
};

// Crear mapa de empleados por documento (optimizado)
export const createEmpleadosMap = (empleadosArray) => {
    const empleadosMap = new Map();
    
    empleadosArray.forEach(empleado => {
        const documento = empleado.document_number?.toString().trim();
        if (documento) {
            empleadosMap.set(documento, {
                cargo: empleado.cargo || "N/A",
                area_nombre: empleado.area_nombre || "N/A",
                departamento: empleado.departamento || "N/A",
                direction: empleado.direction || "N/A",
                foto: empleado.foto || null
            });
        }
    });
    
    return empleadosMap;
};