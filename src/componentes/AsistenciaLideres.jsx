import React, { useEffect, useMemo, useState } from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import LoadingSpinner from "./LoadingSpinner";
import "./styles/AsistenciaLideres.css";
import { useAppData } from "../context/AppDataContext";
import PaginationControls from "./PaginationControls";

const AsistenciaLideres = () => {
    const [filtroAsistencia, setFiltroAsistencia] = useState('todos');
    const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 10;
    const { lideresStats, loading, error, refreshSharedData } = useAppData();
    const { lideresAsistencia, departamentosUnicos } = lideresStats;

    useEffect(() => {
        setPaginaActual(1);
    }, [filtroAsistencia, departamentoSeleccionado]);

    const lideresFiltrados = useMemo(() => {
        let lideresFiltrados = [...lideresAsistencia];
        if (filtroAsistencia === 'asistieron') {
            lideresFiltrados = lideresFiltrados.filter(lider => lider.asistio);
        } else if (filtroAsistencia === 'no_asistieron') {
            lideresFiltrados = lideresFiltrados.filter(lider => lider.tieneReserva && !lider.asistio);
        } else if (filtroAsistencia === 'sin_reserva') {
            lideresFiltrados = lideresFiltrados.filter(lider => !lider.tieneReserva);
        }
        if (departamentoSeleccionado) {
            lideresFiltrados = lideresFiltrados.filter(lider =>
                lider.departamento === departamentoSeleccionado
            );
        }
        
        return lideresFiltrados;
    }, [lideresAsistencia, filtroAsistencia, departamentoSeleccionado]);

    const resumen = useMemo(() => {
        const totalLideres = lideresAsistencia.length;
        const totalAsistieron = lideresAsistencia.filter((lider) => lider.asistio).length;
        const totalConReserva = lideresAsistencia.filter((lider) => lider.tieneReserva).length;
        const totalNoAsistieron = totalConReserva - totalAsistieron;
        const totalSinReserva = totalLideres - totalConReserva;
        const porcentajeAsistencia = totalConReserva > 0
            ? ((totalAsistieron / totalConReserva) * 100).toFixed(1)
            : 0;

        return {
            totalLideres,
            totalAsistieron,
            totalConReserva,
            totalNoAsistieron,
            totalSinReserva,
            porcentajeAsistencia,
        };
    }, [lideresAsistencia]);


    const exportarAExcel = () => {
        // Preparar datos para exportar
        const dataToExport = lideresFiltrados.map(lider => {
            let estado = 'Sin Reserva';
            if (lider.tieneReserva) {
                estado = lider.asistio ? 'Asistió' : 'No Asistió';
            }
            
            return {
                'Nombre': lider.nombre || 'Sin nombre',
                'Cargo': lider.cargo || '-',
                'Departamento': lider.departamento || 'Sin departamento',
                'Documento': lider.document_number || 'N/A',
                'Correo': lider.correo || '-',
                'Estado': estado
            };
        });

        // Crear hoja de Excel
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        
        // Ajustar ancho de columnas automáticamente
        const colWidths = [
            { wch: 30 },  // Nombre
            { wch: 35 },  // Cargo
            { wch: 25 },  // Departamento
            { wch: 15 },  // Documento
            { wch: 30 },  // Correo
            { wch: 15 }   // Estado
        ];
        ws['!cols'] = colWidths;

        // Crear libro de Excel
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Asistencia Coordinadores");
        
        // Descargar archivo
        const fecha = new Date().toLocaleDateString('es-CO').replace(/\//g, '-');
        const fileName = `Asistencia_Coordinadores_${fecha}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    if (loading && lideresAsistencia.length === 0) {
        return <LoadingSpinner message="Cargando asistencia de líderes..." />;
    }

    if (error) {
        return (
            <div className="asistencia-lideres-container">
                <div className="error-message">
                    <i className="bi bi-exclamation-triangle"></i>
                    <p>Error al cargar la asistencia: {error}</p>
                    <button className="btn-retry" onClick={refreshSharedData}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="asistencia-lideres-container">
            {/* Filtros y Búsqueda */}
            <div className="filtros-asistencia">
                <div className="select-wrapper-asistencia">
                    <select
                        id="departamento-select"
                        value={departamentoSeleccionado}
                        onChange={(e) => setDepartamentoSeleccionado(e.target.value)}
                        className="select-departamento-asistencia"
                    >
                        <option value="">Todos los departamentos</option>
                        {departamentosUnicos.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    {departamentoSeleccionado && (
                        <button 
                            className="btn-clear-filter-asistencia" 
                            onClick={() => setDepartamentoSeleccionado('')}
                            title="Limpiar filtro"
                        >
                            <i className="bi bi-x-circle"></i>
                        </button>
                    )}
                </div>

                <div className="botones-filtro-asistencia">
                    <button
                        className={`btn-filtro-asistencia ${filtroAsistencia === 'todos' ? 'active' : ''}`}
                        onClick={() => setFiltroAsistencia('todos')}
                    >
                        Todos ({resumen.totalLideres})
                    </button>
                    <button
                        className={`btn-filtro-asistencia asistieron ${filtroAsistencia === 'asistieron' ? 'active' : ''}`}
                        onClick={() => setFiltroAsistencia('asistieron')}
                    >
                        Asistieron ({resumen.totalAsistieron})
                    </button>
                    <button
                        className={`btn-filtro-asistencia no-asistieron ${filtroAsistencia === 'no_asistieron' ? 'active' : ''}`}
                        onClick={() => setFiltroAsistencia('no_asistieron')}
                    >
                        No Asistieron ({resumen.totalNoAsistieron})
                    </button>
                    <button
                        className={`btn-filtro-asistencia sin-reserva ${filtroAsistencia === 'sin_reserva' ? 'active' : ''}`}
                        onClick={() => setFiltroAsistencia('sin_reserva')}
                    >
                        Sin Reserva ({resumen.totalSinReserva})
                    </button>

                    <Button
                    icon={<DownloadOutlined />}
                    onClick={exportarAExcel}
                    className="btn-export-excel"
                    disabled={lideresFiltrados.length === 0}
                    >
                    Exportar a Excel
                    </Button>
                </div>
            </div>

            {/* Tabla de Líderes */}
            <div className="tabla-container lideres-tabla-container">
                <table className="tabla-asistencia">
                    <thead>
                        <tr>
                            <th>Foto</th>
                            <th>Nombre</th>
                            <th>Cargo</th>
                            <th>Departamento</th>
                            <th>Documento</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lideresFiltrados.length > 0 ? (
                            lideresFiltrados
                                .slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina)
                                .map((lider, index) => (
                                <tr key={index} className="fila-lider">
                                    <td>
                                        <div className="foto-container">
                                            {lider.foto ? (
                                                <img src={lider.foto} alt={lider.nombre} className="foto-lider-tabla" />
                                            ) : (
                                                <div className="foto-placeholder">
                                                    
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="nombre-lider">{lider.nombre || 'Sin nombre'}</td>
                                    <td>{lider.cargo || '-'}</td>
                                    <td>{lider.departamento || 'Sin departamento'}</td>
                                    <td>{lider.document_number || 'N/A'}</td>
                                    <td>
                                        {!lider.tieneReserva ? (
                                            <span className="badge-estado sin-reserva">
                                                Sin Reserva
                                            </span>
                                        ) : lider.asistio ? (
                                            <span className="badge-estado asistio">
                                                Asistió
                                            </span>
                                        ) : (
                                            <span className="badge-estado no-asistio">
                                                No Asistió
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-resultados-tabla">
                                    <i className="bi bi-inbox"></i>
                                    <p>No se encontraron coordinadores</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <PaginationControls
                currentPage={paginaActual}
                totalItems={lideresFiltrados.length}
                pageSize={itemsPorPagina}
                onPageChange={setPaginaActual}
                itemLabel="lideres"
            />
        </div>
    );
};

export default AsistenciaLideres;
