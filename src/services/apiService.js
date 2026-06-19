import axios from 'axios';

const API_MACFER = 'https://macfer.crepesywaffles.com/api';
const API_ALOHA = 'https://apialohav2.crepesywaffles.com/buk';

// ===============================
// CACHE EN MEMORIA
// ===============================

let cacheEmpleados = null;
let empleadosRequest = null;
let reservasRequest = null;

// ===============================
// CACHE PERSISTIDO
// ===============================

export const getPersistedDashboardCache = () => {
    return {
        empleados: [],
        reservas: [],
        isReady: false
    };
};

// ===============================
// OBTENER EMPLEADOS
// ===============================

export const getEmpleados = async (forceRefresh = false) => {

    if (!forceRefresh && cacheEmpleados) {
        console.log(" EMPLEADOS DESDE CACHE:", cacheEmpleados.length);
        return cacheEmpleados;
    }

    if (empleadosRequest) {
        return empleadosRequest;
    }

    empleadosRequest = axios
        .get(`${API_ALOHA}/empleados3`)
        .then((response) => {

            const empleadosRaw = response.data.data || [];

            
            const isActiveEmpleado = (empleado) => {
                if (!empleado) return false;

                if (empleado.status != null) {
                    return empleado.status.toString().toLowerCase().trim() === 'activo';
                }

                if (typeof empleado.active === 'boolean') return empleado.active === true;
                if (typeof empleado.isActive === 'boolean') return empleado.isActive === true;

                const getNested = (obj, ...keys) => {
                    return keys.reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj);
                };

                const candidates = [
                    empleado.estado,
                    empleado.estado_empleado,
                    getNested(empleado, 'attributes', 'status'),
                    getNested(empleado, 'attributes', 'estado'),
                    getNested(empleado, 'attributes', 'active'),
                    getNested(empleado, 'user', 'active')
                ];

                for (const raw of candidates) {
                    if (raw == null) continue;

                    const str = raw.toString().toLowerCase().trim();

                    if (str === 'activo' || str === 'active' || str === '1' || str === 'true') {
                        return true;
                    }

                    if (str === 'inactivo' || str === 'inactive' || str === '0' || str === 'false') {
                        return false;
                    }
                }
                return false;
            };

            const empleados = empleadosRaw.filter(isActiveEmpleado);

            console.log("👥 TOTAL EMPLEADOS API (raw):", empleadosRaw.length, " -> activos filtrados:", empleados.length);

            cacheEmpleados = empleados;

            return empleados;
        })
        .catch((error) => {
            console.error("❌ ERROR OBTENIENDO EMPLEADOS:", error);
            return [];
        })
        .finally(() => {
            empleadosRequest = null;
        });

    return empleadosRequest;
};

// ===============================
// OBTENER TODAS LAS RESERVAS
// ===============================

export const getReservas = async () => {

    if (reservasRequest) {
        return reservasRequest;
    }

    reservasRequest = axios
        .get(
            `${API_MACFER}/sintonizarte-v2-reservas?pagination[pageSize]=2000`
        )
        .then((response) => {

            const reservas =
                response.data.data || [];

            console.log(
                "🎟️ TOTAL RESERVAS API:",
                reservas.length
            );

            return reservas;
        })
        .catch((error) => {

            console.error(
                "❌ ERROR OBTENIENDO RESERVAS:",
                error
            );

            return [];
        })
        .finally(() => {
            reservasRequest = null;
        });

    return reservasRequest;
};



export const getDashboardBootstrapData = async (forceRefresh = false) => {

    try {

        const [reservas, empleados] = await Promise.all([
            getReservas(),
            getEmpleados(forceRefresh)
        ]);

        return {
            reservas,
            empleados
        };

    } catch (error) {

        console.error("❌ ERROR EN DASHBOARD BOOTSTRAP:", error);

        return {
            reservas: [],
            empleados: []
        };
    }
};

// ===============================
// RESERVAS POR FECHA
// ===============================

export const getReservasByFecha = async (fechaId) => {

    try {

        const response = await axios.get(
            `${API_MACFER}/sintonizarte-v2-reservas?populate=*&filters[sintonizarte_v_2_][id]=${fechaId}&pagination[pageSize]=1000`
        );

        const reservas = response.data.data || [];

        console.log(
            ` RESERVAS FECHA ${fechaId}:`,
            reservas.length
        );

        return reservas;

    } catch (error) {

        console.error("❌ ERROR RESERVAS POR FECHA:", error);

        return [];
    }
};

// ===============================
// FECHAS DISPONIBLES
// ===============================

export const getFechas = async () => {

    try {

        const response = await axios.get(
            `${API_MACFER}/sintonizarte-V2s?pagination[pageSize]=500`
        );

        const fechas = response.data.data || [];

      

        return fechas;

    } catch (error) {


        return [];
    }
};

// ===============================
// ACTUALIZAR ASISTENCIA
// ===============================

export const updateAsistencia = async (reservaId, confirm) => {

    const response = await axios.put(
        `${API_MACFER}/sintonizarte-v2-reservas/${reservaId}`,
        {
            data: {
                confirm
            }
        }
    );

    return response.data;
};

// ===============================
// ACTUALIZAR ACOMPAÑANTE
// ===============================

export const updateAcompanante = async (
    reservaId,
    llevaAcompanante
) => {

    const response = await axios.put(
        `${API_MACFER}/sintonizarte-v2-reservas/${reservaId}`,
        {
            data: {
                llevaAcompanante
            }
        }
    );

    return response.data;
};

// ===============================
// ELIMINAR RESERVA
// ===============================

export const deleteReserva = async (reservaId) => {

    const response = await axios.delete(
        `${API_MACFER}/sintonizarte-v2-reservas/${reservaId}`
    );

    return response.data;
};

// ===============================
// MAPA DE EMPLEADOS
// ===============================

export const createEmpleadosMap = (empleadosArray) => {

    const empleadosMap = new Map();

    empleadosArray.forEach((empleado) => {

        const documento = empleado.document_number
            ?.toString()
            .trim();

        if (!documento) {
            return;
        }

        empleadosMap.set(documento, {
            cargo: empleado.cargo || "N/A",
            area_nombre: empleado.area_nombre || "N/A",
            departamento: empleado.departamento || "N/A",
            direction: empleado.direction || "N/A",
            foto: empleado.foto || null
        });
    });

    

    return empleadosMap;
};