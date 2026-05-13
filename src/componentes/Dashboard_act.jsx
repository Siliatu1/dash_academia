import React, { useState, useEffect, useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import LoadingSpinner from "./LoadingSpinner";
import "./styles/Dashboard_act.css";
import DetallePersonas from "./DetallePersonas";
import { useAppData } from "../context/AppDataContext";
import PaginationControls from "./PaginationControls";

const Dashboard_act = () => {

    const [filtroSeleccionado, setFiltroSeleccionado] =
        useState('todos');

    const [searchTerm, setSearchTerm] =
        useState('');

    const [departamentoSeleccionado,
        setDepartamentoSeleccionado] =
        useState(null);

    const [paginaActual, setPaginaActual] =
        useState(1);

    const tarjetasPorPagina = 8;

    const {
        dashboardStats,
        loading,
        error
    } = useAppData();

    const {
        datosIntegrados = [],
        totalAcompanantes = 0,
    } = dashboardStats || {};

    // ======================================
    // FILTROS
    // ======================================

    const datosFiltrados = useMemo(() => {

        let resultado = [...datosIntegrados];

        if (filtroSeleccionado === 'alta') {

            resultado = resultado.filter(
                item => item.porcentaje_asistencia >= 50
            );

        } else if (
            filtroSeleccionado === 'baja'
        ) {

            resultado = resultado.filter(
                item => item.porcentaje_asistencia < 50
            );
        }

        if (searchTerm) {

            const termLower =
                searchTerm.toLowerCase();

            resultado = resultado.filter(
                item =>
                    item.department
                        ?.toLowerCase()
                        .includes(termLower)
            );
        }

        return resultado;

    }, [
        datosIntegrados,
        filtroSeleccionado,
        searchTerm
    ]);

    // ======================================
    // RESETEAR PAGINACIÓN
    // ======================================

    useEffect(() => {
        setPaginaActual(1);
    }, [
        filtroSeleccionado,
        searchTerm
    ]);

    // ======================================
    // TOTALES
    // ======================================

    const totalesGenerales = useMemo(() => {

        let reservas = 0;
        let asistentes = 0;
        let empleados = 0;

        datosIntegrados.forEach((item) => {

            reservas += Number(
                item.total_res || 0
            );

            asistentes += Number(
                item.total_asistentes || 0
            );

            empleados += Number(
                item.total_person || 0
            );
        });

        const porcentaje =
            empleados > 0
                ? (
                    (asistentes / empleados) * 100
                ).toFixed(2)
                : 0;

        return {
            totalReservas: reservas,
            totalAsistentes: asistentes,
            totalEmpleados: empleados,
            porcentajeAsistencia: porcentaje
        };

    }, [datosIntegrados]);

    // ======================================
    // LOADING
    // ======================================

    if (
        loading &&
        datosIntegrados.length === 0
    ) {

        return (
            <LoadingSpinner
                message="Cargando datos del dashboard..."
            />
        );
    }

    // ======================================
    // ERROR
    // ======================================

    if (error) {

        return (
            <div className="error">
                Error al cargar los datos: {error}
            </div>
        );
    }

    // ======================================
    // DETALLE DEPARTAMENTO
    // ======================================

    if (departamentoSeleccionado) {

        return (
            <DetallePersonas
                departamento={
                    departamentoSeleccionado
                }
                onVolver={() =>
                    setDepartamentoSeleccionado(null)
                }
            />
        );
    }

    // ======================================
    // PAGINACIÓN
    // ======================================

    const indiceInicial =
        (paginaActual - 1) *
        tarjetasPorPagina;

    const tarjetasMostradas =
        datosFiltrados.slice(
            indiceInicial,
            indiceInicial + tarjetasPorPagina
        );

    return (

        <div className="dashboard-container">

            {/* ====================================== */}
            {/* TOTALES */}
            {/* ====================================== */}

            <div className="totals-section">

                <div className="total-card">

                    <p className="total-label">
                        Total Reservas
                    </p>

                    <p className="total-value primary">
                        {totalesGenerales.totalReservas}
                    </p>

                </div>

                <div className="total-card">

                    <p className="total-label">
                        Total Colaboradores
                    </p>

                    <p className="total-value success">
                        {totalesGenerales.totalAsistentes}
                    </p>

                </div>

                <div className="total-card">

                    <p className="total-label">
                        Porcentaje Asistencia
                    </p>

                    <p className="total-value success">
                        {
                            totalesGenerales
                                .porcentajeAsistencia
                        }%
                    </p>

                </div>

                <div className="total-card">

                    <p className="total-label">
                        Total Acompañantes
                    </p>

                    <p className="total-value success">
                        {totalAcompanantes}
                    </p>

                </div>

            </div>

            {/* ====================================== */}
            {/* FILTROS */}
            {/* ====================================== */}

            <div className="filters-section">

                <div className="filters-top-row">

                    <div className="search-box">

                        <input
                            type="text"
                            placeholder="Buscar departamento..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                            className="search-input"
                        />

                        {searchTerm && (

                            <i
                                className="bi bi-x-circle clear-search"
                                onClick={() =>
                                    setSearchTerm('')
                                }
                            ></i>
                        )}

                    </div>

                    <div className="filter-buttons">

                        <button
                            className={`filter-btn ${
                                filtroSeleccionado ===
                                'todos'
                                    ? 'active'
                                    : ''
                            }`}
                            onClick={() =>
                                setFiltroSeleccionado(
                                    'todos'
                                )
                            }
                        >
                            Todos (
                            {datosIntegrados.length}
                            )
                        </button>

                        <button
                            className={`filter-btn ${
                                filtroSeleccionado ===
                                'alta'
                                    ? 'active'
                                    : ''
                            }`}
                            onClick={() =>
                                setFiltroSeleccionado(
                                    'alta'
                                )
                            }
                        >
                            Asistencia Alta
                        </button>

                        <button
                            className={`filter-btn ${
                                filtroSeleccionado ===
                                'baja'
                                    ? 'active'
                                    : ''
                            }`}
                            onClick={() =>
                                setFiltroSeleccionado(
                                    'baja'
                                )
                            }
                        >
                            Asistencia Baja
                        </button>

                    </div>

                </div>

            </div>

            {/* ====================================== */}
            {/* TARJETAS */}
            {/* ====================================== */}

            <section className="dashboard-section">

                <div className="cards-container">

                    {tarjetasMostradas.map(
                        (item, index) => (

                            <div
                                key={`integrado-${index}`}
                                className="department-card"
                                onClick={() =>
                                    setDepartamentoSeleccionado(
                                        item.department
                                    )
                                }
                                style={{
                                    cursor: 'pointer'
                                }}
                            >

                                <div className="card-percentage">

                                    <svg
                                        className="percentage-circle"
                                        width="140"
                                        height="140"
                                        viewBox="0 0 140 140"
                                    >

                                        <circle
                                            className="percentage-bg"
                                            cx="70"
                                            cy="70"
                                            r="60"
                                        />

                                        <circle
                                            className="percentage-fill"
                                            cx="70"
                                            cy="70"
                                            r="60"
                                            strokeDasharray={`${
                                                2 *
                                                Math.PI *
                                                60
                                            }`}
                                            strokeDashoffset={`${
                                                2 *
                                                Math.PI *
                                                60 *
                                                (
                                                    1 -
                                                    item.porcentaje_asistencia /
                                                    100
                                                )
                                            }`}
                                        />

                                        <text
                                            x="70"
                                            y="70"
                                            className="percentage-text"
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            {
                                                item
                                                    .porcentaje_asistencia
                                            }%
                                        </text>

                                    </svg>

                                </div>

                                <h3 className="card-title">
                                    {item.department}
                                </h3>

                                <div className="card-details">

                                    <div className="detail-item">

                                        <span className="detail-label">
                                            Colaboradores
                                        </span>

                                        <span className="detail-value">
                                            {
                                                item.total_person
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-item">

                                        <span className="detail-label">
                                            Colaboradores con reservas
                                        </span>

                                        <span className="detail-value">
                                            {
                                                item.total_res
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-item">

                                        <span className="detail-label">
                                            Colaboradores que asistieron
                                        </span>

                                        <span className="detail-value">
                                            {
                                                item.total_asistentes
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-item warning">

                                        <span className="detail-label">
                                            Colaboradores sin reserva
                                        </span>

                                        <span className="detail-value faltantes-clickable">
                                            {
                                                item.faltantes
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-item highlight">

                                        <span className="detail-label">
                                            Porcentaje Reservas:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                item.porcentaje_participacion
                                            }%
                                        </span>

                                    </div>

                                </div>

                            </div>
                        )
                    )}

                </div>

                <PaginationControls
                    currentPage={paginaActual}
                    totalItems={
                        datosFiltrados.length
                    }
                    pageSize={tarjetasPorPagina}
                    onPageChange={
                        setPaginaActual
                    }
                    itemLabel="elementos"
                />

            </section>

        </div>
    );
};

export default Dashboard_act;