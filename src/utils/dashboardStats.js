export const buildDashboardStats = (
    empleados = [],
    reservas = []
) => {

    let totalAcompanantes = 0;

    // ======================================
    // MAPA DE RESERVAS
    // ======================================

    const reservasPorDocumento = new Map();

    reservas.forEach((reserva) => {

        const documento = reserva.attributes?.documento
            ?.toString()
            .trim();

        const confirm = reserva.attributes?.confirm;

        const llevaAcompanante =
            reserva.attributes?.llevaAcompanante;

        if (llevaAcompanante === true) {
            totalAcompanantes += 1;
        }

        if (!documento) return;

        if (!reservasPorDocumento.has(documento)) {

            reservasPorDocumento.set(documento, {
                totalReservas: 0,
                totalAsistencias: 0
            });
        }

        const actual =
            reservasPorDocumento.get(documento);

        actual.totalReservas += 1;

        if (confirm === true) {
            actual.totalAsistencias += 1;
        }
    });

    // ======================================
    // DATOS POR DEPARTAMENTO
    // ======================================

    const datosPorDepartamento = {};

    // 🔥 EVITAR DUPLICADOS
    const documentosProcesados = new Set();

    empleados.forEach((empleado) => {

        const department =
            empleado.departamento ||
            'Sin departamento';

        const documento = empleado.document_number
            ?.toString()
            .trim();

        if (!datosPorDepartamento[department]) {

            datosPorDepartamento[department] = {
                total_person: 0,
                total_res: 0,
                total_asistentes: 0,
            };
        }

        datosPorDepartamento[department]
            .total_person += 1;

        // ======================================
        // SUMAR RESERVAS SOLO UNA VEZ
        // ======================================

        if (
            documento &&
            reservasPorDocumento.has(documento) &&
            !documentosProcesados.has(documento)
        ) {

            documentosProcesados.add(documento);

            const reservaInfo =
                reservasPorDocumento.get(documento);

            datosPorDepartamento[department]
                .total_res +=
                reservaInfo.totalReservas;

            datosPorDepartamento[department]
                .total_asistentes +=
                reservaInfo.totalAsistencias;
        }
    });

    // ======================================
    // RESERVAS SIN EMPLEADO
    // ======================================

    const documentosEmpleados = new Set(
        empleados.map((empleado) =>
            empleado.document_number
                ?.toString()
                .trim()
        )
    );

    const reservasSinEmpleado = [];

    reservas.forEach((reserva) => {

        const documento =
            reserva.attributes?.documento
                ?.toString()
                .trim();

        if (
            documento &&
            !documentosEmpleados.has(documento)
        ) {

            reservasSinEmpleado.push({
                reservaId: reserva.id,
                documento
            });
        }
    });

    // 🔥 SOLO LOG INFORMATIVO
    if (reservasSinEmpleado.length > 0) {

        console.warn(
            "⚠️ RESERVAS SIN EMPLEADO:",
            reservasSinEmpleado
        );
    }

    // ======================================
    // FORMATEAR DATOS
    // ======================================

    const datosIntegrados = Object.keys(
        datosPorDepartamento
    )
        .filter(
            (department) =>
                department &&
                department.trim() !== ''
        )
        .map((department) => {

            const datos =
                datosPorDepartamento[department];

            const total_person =
                datos.total_person;

            const total_res =
                datos.total_res;

            const total_asistentes =
                datos.total_asistentes;

            const participacion =
                total_person > 0
                    ? total_res / total_person
                    : 0;

            const porcentaje_asistencia =
                total_person > 0
                    ? (
                        (total_asistentes /
                            total_person) *
                        100
                    ).toFixed(2)
                    : 0;

            return {
                department,
                total_person,
                total_res,
                total_asistentes,
                participacion,
                porcentaje_participacion: parseFloat(
                    (participacion * 100).toFixed(2)
                ),
                porcentaje_asistencia: parseFloat(
                    porcentaje_asistencia
                ),
                faltantes: Math.max(
                    0,
                    total_person - total_res
                ),
            };
        })
        .sort((a, b) =>
            a.department.localeCompare(b.department)
        );

    return {
        datosIntegrados,
        totalAcompanantes,
    };
};

// ======================================
// DETALLE DEPARTAMENTO
// ======================================

export const buildDetalleDepartamentoStats = (
    departamento,
    empleados = [],
    reservas = []
) => {

    const reservasPorDocumento = new Map();

    reservas.forEach((reserva) => {

        const documento = reserva.attributes?.documento
            ?.toString()
            .trim();

        const confirm = reserva.attributes?.confirm;

        if (!documento) return;

        reservasPorDocumento.set(documento, confirm);
    });

    const empleadosDepartamento =
        empleados.filter(
            (empleado) =>
                empleado.departamento === departamento
        );

    const personasFaltantes = [];
    const personasInscritas = [];

    empleadosDepartamento.forEach((empleado) => {

        const documento = empleado.document_number
            ?.toString()
            .trim();

        if (
            documento &&
            reservasPorDocumento.has(documento)
        ) {

            personasInscritas.push({
                ...empleado,
                confirm:
                    reservasPorDocumento.get(documento),
            });

        } else {

            personasFaltantes.push(empleado);
        }
    });

    const conReserva =
        personasInscritas.length;

    const participacion =
        empleadosDepartamento.length > 0
            ? (
                (conReserva /
                    empleadosDepartamento.length) *
                100
            ).toFixed(2)
            : 0;

    return {
        personasFaltantes,
        personasInscritas,
        totales: {
            totalPersonas:
                empleadosDepartamento.length,
            conReserva,
            sinReserva:
                personasFaltantes.length,
            totalAsistentes:
                personasInscritas.filter(
                    (persona) =>
                        persona.confirm === true
                ).length,
            participacion,
        },
    };
};

// ======================================
// INDEX DETALLE
// ======================================

export const buildDetalleStatsIndex = (
    empleados = [],
    reservas = []
) => {

    const departamentos = [
        ...new Set(
            empleados
                .map(
                    (empleado) =>
                        empleado.departamento
                )
                .filter(
                    (departamento) =>
                        departamento &&
                        departamento.trim() !== ''
                )
        )
    ];

    return departamentos.reduce(
        (accumulator, departamento) => {

            accumulator[departamento] =
                buildDetalleDepartamentoStats(
                    departamento,
                    empleados,
                    reservas
                );

            return accumulator;

        },
        {}
    );
};

// ======================================
// LÍDERES
// ======================================

export const buildLideresStats = (
    empleados = [],
    reservas = []
) => {

    const cargosPermitidos = [
        'COORDINADORA HELADERIA',
        'COORDINADOR DE ZONA',
        'COORDINADOR (A) HELADERIA PRINCIPAL',
        'ADMINISTRADORA PUNTO DE VENTA',
        'COORDINADOR PUNTO DE VENTA',
        'COORDINADOR PUNTO DE VENTA (FDS)',
        'GERENTE PUNTO DE VENTA'
    ];

    const lideres = empleados.filter(
        (empleado) => {

            const cargo =
                empleado.cargo
                    ?.toUpperCase()
                    .trim() || '';

            return cargosPermitidos.some(
                (cargoPermitido) =>
                    cargo.includes(
                        cargoPermitido
                    ) ||
                    cargoPermitido.includes(cargo)
            );
        }
    );

    const reservasPorDocumento = new Map();

    reservas.forEach((reserva) => {

        const documento = reserva.attributes?.documento
            ?.toString()
            .trim();

        const confirm = reserva.attributes?.confirm;

        if (!documento) return;

        reservasPorDocumento.set(documento, {
            tieneReserva: true,
            confirm,
            id: reserva.id,
        });
    });

    const lideresAsistencia = lideres
        .map((lider) => {

            const documento =
                lider.document_number
                    ?.toString()
                    .trim();

            const reservaInfo =
                reservasPorDocumento.get(documento);

            return {
                ...lider,
                tieneReserva:
                    reservaInfo?.tieneReserva || false,
                asistio:
                    reservaInfo?.confirm === true,
                reservaId:
                    reservaInfo?.id || null,
            };
        })
        .sort((a, b) =>
            (a.nombre || '').localeCompare(
                b.nombre || ''
            )
        );

    const departamentosUnicos = [
        ...new Set(
            lideresAsistencia
                .map(
                    (lider) =>
                        lider.departamento
                )
                .filter(
                    (departamento) =>
                        departamento &&
                        departamento.trim() !== ''
                )
        )
    ].sort();

    return {
        lideresAsistencia,
        departamentosUnicos,
    };
};