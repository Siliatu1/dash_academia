export const buildDashboardStats = (empleados = [], reservas = []) => {
    const reservasPorDocumento = new Map();
    let totalAcompanantes = 0;

    reservas.forEach((reserva) => {
        const documento = reserva.attributes?.documento?.toString().trim();
        const confirm = reserva.attributes?.confirm;
        const llevaAcompanante = reserva.attributes?.llevaAcompanante;

        if (llevaAcompanante === true) {
            totalAcompanantes += 1;
        }

        if (documento) {
            reservasPorDocumento.set(documento, {
                tieneReserva: true,
                confirm,
            });
        }
    });

    const datosPorDepartamento = {};

    empleados.forEach((empleado) => {
        const department = empleado.departamento || 'Sin departamento';
        const documento = empleado.document_number?.toString().trim();

        if (!datosPorDepartamento[department]) {
            datosPorDepartamento[department] = {
                total_person: 0,
                total_res: 0,
                total_asistentes: 0,
            };
        }

        datosPorDepartamento[department].total_person += 1;

        if (documento && reservasPorDocumento.has(documento)) {
            const reservaInfo = reservasPorDocumento.get(documento);
            datosPorDepartamento[department].total_res += 1;

            if (reservaInfo.confirm === true) {
                datosPorDepartamento[department].total_asistentes += 1;
            }
        }
    });

    const datosIntegrados = Object.keys(datosPorDepartamento)
        .filter((department) => department && department.trim() !== '' && department !== 'Sin departamento')
        .map((department) => {
            const datos = datosPorDepartamento[department];
            const total_person = datos.total_person;
            const total_res = datos.total_res;
            const total_asistentes = datos.total_asistentes;
            const participacion = total_person > 0 ? total_res / total_person : 0;
            const porcentaje_asistencia = total_person > 0 ? ((total_asistentes / total_person) * 100).toFixed(2) : 0;

            return {
                department,
                total_person,
                total_res,
                total_asistentes,
                participacion,
                porcentaje_participacion: parseFloat((participacion * 100).toFixed(2)),
                porcentaje_asistencia: parseFloat(porcentaje_asistencia),
                faltantes: Math.max(0, total_person - total_res),
            };
        })
        .sort((a, b) => a.department.localeCompare(b.department));

    return {
        datosIntegrados,
        totalAcompanantes,
    };
};

export const buildDetalleDepartamentoStats = (departamento, empleados = [], reservas = []) => {
    const reservasPorDocumento = new Map();

    reservas.forEach((reserva) => {
        const documento = reserva.attributes?.documento?.toString().trim();
        const confirm = reserva.attributes?.confirm;

        if (documento) {
            reservasPorDocumento.set(documento, confirm);
        }
    });

    const empleadosDepartamento = empleados.filter((empleado) => empleado.departamento === departamento);
    const personasFaltantes = [];
    const personasInscritas = [];

    empleadosDepartamento.forEach((empleado) => {
        const documento = empleado.document_number?.toString().trim();

        if (documento && reservasPorDocumento.has(documento)) {
            personasInscritas.push({
                ...empleado,
                confirm: reservasPorDocumento.get(documento),
            });
        } else {
            personasFaltantes.push(empleado);
        }
    });

    const conReserva = personasInscritas.length;
    const participacion = empleadosDepartamento.length > 0
        ? ((conReserva / empleadosDepartamento.length) * 100).toFixed(2)
        : 0;

    return {
        personasFaltantes,
        personasInscritas,
        totales: {
            totalPersonas: empleadosDepartamento.length,
            conReserva,
            sinReserva: personasFaltantes.length,
            totalAsistentes: personasInscritas.filter((persona) => persona.confirm === true).length,
            participacion,
        },
    };
};

export const buildDetalleStatsIndex = (empleados = [], reservas = []) => {
    const departamentos = [...new Set(
        empleados
            .map((empleado) => empleado.departamento)
            .filter((departamento) => departamento && departamento.trim() !== '' && departamento !== 'Sin departamento')
    )];

    return departamentos.reduce((accumulator, departamento) => {
        accumulator[departamento] = buildDetalleDepartamentoStats(departamento, empleados, reservas);
        return accumulator;
    }, {});
};

export const buildLideresStats = (empleados = [], reservas = []) => {
    const cargosPermitidos = [
        'COORDINADORA HELADERIA',
        'COORDINADOR DE ZONA',
        'COORDINADOR (A) HELADERIA PRINCIPAL',
        'ADMINISTRADORA PUNTO DE VENTA',
        'COORDINADOR PUNTO DE VENTA',
        'COORDINADOR PUNTO DE VENTA (FDS)',
        'GERENTE PUNTO DE VENTA'
    ];

    const lideres = empleados.filter((empleado) => {
        const cargo = empleado.cargo?.toUpperCase().trim() || '';
        return cargosPermitidos.some((cargoPermitido) => (
            cargo.includes(cargoPermitido) || cargoPermitido.includes(cargo)
        ));
    });

    const reservasPorDocumento = new Map();

    reservas.forEach((reserva) => {
        const documento = reserva.attributes?.documento?.toString().trim();
        const confirm = reserva.attributes?.confirm;
        const reservaId = reserva.id;

        if (documento) {
            reservasPorDocumento.set(documento, {
                tieneReserva: true,
                confirm,
                id: reservaId,
            });
        }
    });

    const lideresAsistencia = lideres
        .map((lider) => {
            const documento = lider.document_number?.toString().trim();
            const reservaInfo = reservasPorDocumento.get(documento);

            return {
                ...lider,
                tieneReserva: reservaInfo?.tieneReserva || false,
                asistio: reservaInfo?.confirm === true,
                reservaId: reservaInfo?.id || null,
            };
        })
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

    const departamentosUnicos = [...new Set(
        lideresAsistencia
            .map((lider) => lider.departamento)
            .filter((departamento) => departamento && departamento.trim() !== '')
    )].sort();

    return {
        lideresAsistencia,
        departamentosUnicos,
    };
};