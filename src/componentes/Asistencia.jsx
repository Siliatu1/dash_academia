import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Button } from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import LoadingSpinner from "./LoadingSpinner";
import "./styles/Asistencia.css";
import { getEmpleados, getFechas, getReservasByFecha, updateAsistencia, updateAcompanante, deleteReserva, createEmpleadosMap } from "../services/apiService";
import { useAppData } from "../context/AppDataContext";
import { createTablePagination } from "../utils/pagination";

const Asistencia = () => {
    const navigate = useNavigate();
    const { patchReserva, removeReserva } = useAppData();
    const [asistenciaData, setAsistenciaData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [Fecha, setFecha] = useState("");
    const [fechasDisponibles, setFechasDisponibles] = useState([]);
    const [loadingFechas, setLoadingFechas] = useState(true);
    const [searchDocumento, setSearchDocumento] = useState("");
    const [fechaSeleccionada, setFechaSeleccionada] = useState("");
    const [loadingToggle, setLoadingToggle] = useState(false);
    const [empleadosMap, setEmpleadosMap] = useState(new Map());
    const [currentPage, setCurrentPage] = useState(1);
    const [mesSeleccionado, setMesSeleccionado] = useState("");
    const [fechasFiltradas, setFechasFiltradas] = useState([]);

    useEffect(() => {
        const fetchFechas = async () => {
            try {
                setLoadingFechas(true);
                const fechas = await getFechas();
                setFechasDisponibles(fechas);
                setLoadingFechas(false);
            } catch (err) {
                console.error('Error al cargar fechas:', err);
                setError(err.message);
                setLoadingFechas(false);
            }
        };
        fetchFechas();
    }, []);

    useEffect(() => {
        const fetchEmpleados = async () => {
            try {
                const empleadosArray = await getEmpleados();
                const empleadosMapTemp = createEmpleadosMap(empleadosArray);
                setEmpleadosMap(empleadosMapTemp);
            } catch (err) {
                console.error("Error al cargar empleados:", err);
            }
        };
        fetchEmpleados();
    }, []);

    useEffect(() => {
        const fetchReservas = async () => {
            if (!Fecha) {
                setAsistenciaData([]);
                return;
            }
            
            try {
                setLoading(true);
                const reservas = await getReservasByFecha(Fecha);
                setAsistenciaData(reservas);
                setLoading(false);
            } catch (err) {
                console.error('Error al cargar reservas:', err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchReservas();
    }, [Fecha]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchDocumento, Fecha]);

    const handleFechaChange = (e) => {
        const selectedId = e.target.value;
        setFecha(selectedId);
        
        
        const fechaObj = fechasDisponibles.find(f => f.id === parseInt(selectedId));
        if (fechaObj) {
            setFechaSeleccionada(fechaObj.attributes?.fecha || "");
        } else {
            setFechaSeleccionada("");
        }
    };

  
    const handleMesChange = (e) => {
        const mes = e.target.value;
        setMesSeleccionado(mes);
        setFecha(""); // Resetear fecha seleccionada
        setFechaSeleccionada("");
        
        if (mes) {
            const fechasFiltradas = fechasDisponibles.filter(fecha => {
                const fechaStr = fecha.attributes?.fecha || "";
                if (!fechaStr) return false;
                
                let mesEvento = null;
                

                if (fechaStr.includes('/')) {
                    const partes = fechaStr.split("/");
                    if (partes.length >= 2) {
                        mesEvento = partes[1].padStart(2, '0');
                    }
                } else if (fechaStr.includes('-')) {
                    const partes = fechaStr.split("-");
                    if (partes.length === 3) {
                        if (partes[0].length === 4) {

                            mesEvento = partes[1].padStart(2, '0');
                        } else {

                            mesEvento = partes[1].padStart(2, '0');
                        }
                    }
                }
                
                return mesEvento === mes;
            });
            

            fechasFiltradas.sort((a, b) => {
                const fechaA = a.attributes?.fecha || "";
                const fechaB = b.attributes?.fecha || "";
 
                const parseDate = (fechaStr) => {
                    if (fechaStr.includes('/')) {
                        const [dia, mes, año] = fechaStr.split("/");
                        return new Date(año, mes - 1, dia);
                    } else if (fechaStr.includes('-')) {
                        const partes = fechaStr.split("-");
                        if (partes[0].length === 4) {

                            return new Date(fechaStr);
                        } else {
         
                            const [dia, mes, año] = partes;
                            return new Date(año, mes - 1, dia);
                        }
                    }
                    return new Date(0);
                };
                
                return parseDate(fechaA) - parseDate(fechaB);
            });
            
            setFechasFiltradas(fechasFiltradas);
        } else {
            setFechasFiltradas([]);
        }
    };

    // Obtener meses disponibles de las fechas
    const obtenerMesesDisponibles = () => {
        const meses = new Set();
        
        fechasDisponibles.forEach(fecha => {
            const fechaStr = fecha.attributes?.fecha || "";
            
            if (fechaStr) {
                let mes = null;

                if (fechaStr.includes('/')) {
                    const partes = fechaStr.split("/");
                    if (partes.length >= 2) {
                        mes = partes[1].padStart(2, '0');
                    }
                } else if (fechaStr.includes('-')) {
                    const partes = fechaStr.split("-");
                    if (partes.length === 3) {
                        if (partes[0].length === 4) {
  
                            mes = partes[1].padStart(2, '0');
                        } else {
              
                            mes = partes[1].padStart(2, '0');
                        }
                    }
                }
                
                if (mes) {
                    meses.add(mes);
                }
            }
        });
        
        const mesesArray = Array.from(meses).sort();
        return mesesArray;
    };


    const nombreMes = (numeroMes) => {
        const meses = {
            '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
            '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
            '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
        };
        return meses[numeroMes] || numeroMes;
    };

    const handleCardClick = (fechaId, fecha) => {
        setFecha(fechaId);
        setFechaSeleccionada(fecha);
    };

    
    const handleAsistenciaToggle = async (reservaId, estadoActual) => {
        try {
            setLoadingToggle(true);
            const nuevoEstado = !estadoActual;
            
            await updateAsistencia(reservaId, nuevoEstado);

            setAsistenciaData(prevData => 
                prevData.map(reserva => 
                    reserva.id === reservaId 
                        ? { 
                            ...reserva, 
                            attributes: { 
                                ...reserva.attributes, 
                                confirm: nuevoEstado 
                            } 
                        }
                        : reserva
                )
            );

            patchReserva(reservaId, { confirm: nuevoEstado });
            
            setLoadingToggle(false);
        } catch (err) {
            console.error('Error al actualizar asistencia:', err);
            setLoadingToggle(false);
            alert("Error al actualizar la asistencia");
        }
    };

    const handleAcompananteToggle = async (reservaId, estadoActual) => {
        try {
            setLoadingToggle(true);
            const nuevoEstado = !estadoActual;
            
            await updateAcompanante(reservaId, nuevoEstado);

            setAsistenciaData(prevData => 
                prevData.map(reserva => 
                    reserva.id === reservaId 
                        ? { 
                            ...reserva, 
                            attributes: { 
                                ...reserva.attributes, 
                                llevaAcompanante: nuevoEstado 
                            } 
                        }
                        : reserva
                )
            );

            patchReserva(reservaId, { llevaAcompanante: nuevoEstado });
            
            setLoadingToggle(false);
        } catch (err) {
            console.error('Error al actualizar acompañante:', err);
            setLoadingToggle(false);
            alert("Error al actualizar el acompañante");
        }
    };

    const handleEliminarReserva = async (reservaId, nombreUsuario) => {
        if (!window.confirm(`¿Está seguro de eliminar la reserva de ${nombreUsuario}?`)) {
            return;
        }

        try {
            setLoadingToggle(true);
            
            await deleteReserva(reservaId);

            // Actualizar el estado local eliminando la reserva
            setAsistenciaData(prevData => 
                prevData.filter(reserva => reserva.id !== reservaId)
            );

            removeReserva(reservaId);
            
            setLoadingToggle(false);
            alert("Reserva eliminada exitosamente");
        } catch (err) {
            console.error("Error al eliminar:", err);
            setLoadingToggle(false);
            alert("Error al eliminar la reserva");
        }
    };


    const exportToExcel = () => {
        const dataToExport = filteredData.map((reserva, index) => {
            const documento = reserva.attributes?.documento?.toString().trim();
            const empleado = empleadosMap.get(documento) || {};
            const llevaAcompanante = reserva.attributes?.llevaAcompanante;
            
            return {
                'Documento': reserva.attributes?.documento || "N/A",
                'Nombre': reserva.attributes?.nombreUsuario || "N/A",
                'Cargo': empleado.cargo || "N/A",
                'Departamento': empleado.departamento || "N/A",
                'Dirección': empleado.direction || "N/A",
                'Acompañante': llevaAcompanante === true ? "Sí" : llevaAcompanante === false ? "No" : "No definido",
                'Fecha': fechaSeleccionada || reserva.attributes?.fecha || "N/A",
                'Estado': reserva.attributes?.confirm === true ? "Asistió" : reserva.attributes?.confirm === false ? "No asistió" : "Pendiente"
            };
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
        
    
        const fileName = `Asistencia_${fechaSeleccionada || 'datos'}_${new Date().toLocaleDateString('es-CO').replace(/\//g, '-')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

   
    const filteredData = asistenciaData.filter(reserva => {
        const documento = reserva.attributes?.documento || "";
        return documento.toString().includes(searchDocumento);
    });


    const pageSize = 8;

    const paginationConfig = createTablePagination({
        currentPage,
        pageSize,
        totalItems: filteredData.length,
        onChange: (page) => setCurrentPage(page),
        itemLabel: 'reservas',
    });

   
    const columns = [
        {
            title: 'FOTO',
            key: 'foto',
            width: 90,
            render: (_, record) => {
                const documento = record.attributes?.documento?.toString().trim();
                const empleado = empleadosMap.get(documento);
                const nombre = record.attributes?.nombreUsuario || "";
                const iniciales = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                
                return (
                    <div className="foto-container">
                        {empleado?.foto ? (
                            <img src={empleado.foto} alt="Foto empleado" className="foto-empleado-tabla" />
                        ) : (
                            <div className="foto-placeholder">
                                {iniciales}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'DOCUMENTO',
            dataIndex: ['attributes', 'documento'],
            key: 'documento',
            width: 150,
        },
        {
            title: 'NOMBRE',
            dataIndex: ['attributes', 'nombreUsuario'],
            key: 'nombreUsuario',
            width: 250,
        },
        {
            title: 'CARGO',
            key: 'cargo',
            width: 200,
            render: (_, record) => {
                const documento = record.attributes?.documento?.toString().trim();
                const empleado = empleadosMap.get(documento);
                return empleado?.cargo || "N/A";
            },
        },
        {
            title: 'DEPARTAMENTO',
            key: 'departamento',
            width: 200,
            render: (_, record) => {
                const documento = record.attributes?.documento?.toString().trim();
                const empleado = empleadosMap.get(documento);
                return empleado?.departamento || "N/A";
            },
        },
        {
            title: 'DIRECCIÓN',
            key: 'direction',
            width: 220,
            render: (_, record) => {
                const documento = record.attributes?.documento?.toString().trim();
                const empleado = empleadosMap.get(documento);
                return empleado?.direction || "N/A";
            },
        },
        
        {
            title: 'ESTADO',
            key: 'accion',
            width: 200,
            render: (_, record) => (
                <div 
                    className={`toggle-container ${record.attributes?.confirm ? 'active' : ''}`}
                    onClick={() => handleAsistenciaToggle(record.id, record.attributes?.confirm)}
                >
                    <div className="toggle-switch">
                        <div className="toggle-slider"></div>
                    </div>
                    <span className="toggle-label">
                        {record.attributes?.confirm === true ? (
                            <span style={{ 
                                background: '#D1FAE5', 
                                color: '#065F46', 
                                padding: '4px 10px', 
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                Asistió
                            </span>
                        ) : record.attributes?.confirm === false ? 'No asistió' : 'Pendiente'}
                    </span>
                </div>
                
            ),
        },

        {
            title: 'ACOMPAÑANTE',
            key: 'acompanante',
            width: 200,
            render: (_, record) => (
                <div 
                    className={`toggle-container ${record.attributes?.llevaAcompanante ? 'active' : ''}`}
                    onClick={() => handleAcompananteToggle(record.id, record.attributes?.llevaAcompanante)}
                >
                    <div className="toggle-switch">
                        <div className="toggle-slider"></div>
                    </div>
                    <span className="toggle-label">
                        {record.attributes?.llevaAcompanante ? (
                            <span style={{ 
                                background: '#D1FAE5', 
                                color: '#065F46', 
                                padding: '4px 10px', 
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                Sí
                            </span>
                        ) : 'No'}
                    </span>
                </div>
            ),
        },
        {
            title: 'ACCIONES',
            key: 'acciones',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <button
                    className="btn-eliminar-reserva"
                    onClick={() => handleEliminarReserva(record.id, record.attributes?.nombreUsuario)}
                    title="Eliminar reserva"
                    style={{
                        background: '#EF4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        margin: '0 auto'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#DC2626'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#EF4444'}
                >
                    <i className="bi bi-trash"></i>
                    Eliminar
                </button>
            ),
        },
    ];

    if (loadingFechas) return <LoadingSpinner message="Cargando eventos disponibles..." />;
    if (error) return <div className="mensaje-estado">Error al cargar los datos: {error}</div>;

    return (
        <div className="asistencia-container">

            {/* Selector de Mes */}
            <div className="selector-fecha-container">
                <label className="selector-fecha-label" htmlFor="mes">
                    Seleccionar mes
                </label>
                <select 
                    id="mes"
                    className="selector-fecha"
                    value={mesSeleccionado}
                    onChange={handleMesChange}
                    disabled={loadingFechas}
                >
                    <option value="">Seleccione un mes</option>
                    {obtenerMesesDisponibles().map((mes) => (
                        <option key={mes} value={mes}>
                            {nombreMes(mes)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tarjetas de fechas */}
            {mesSeleccionado && fechasFiltradas.length > 0 && (
                <div className="fechas-cards-container">
                    <h3 className="fechas-cards-titulo">Seleccione una fecha</h3>
                    <div className="fechas-cards-grid">
                        {fechasFiltradas.map((fecha) => (
                            <div
                                key={fecha.id}
                                className={`fecha-card ${Fecha === fecha.id.toString() ? 'fecha-card-selected' : ''}`}
                                onClick={() => handleCardClick(fecha.id.toString(), fecha.attributes?.fecha || "")}
                            >
                                <div className="fecha-card-icono">
                                    
                                </div>
                                <div className="fecha-card-fecha">
                                    {fecha.attributes?.fecha || `Evento ${fecha.id}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

         

            {Fecha && (
                <>
                    {/* Card con totales */}
                    <div className="totales-card">
                        <div className="totales-fecha">
                            <i className="bi bi-calendar-event"></i>
                            <span>Fecha: {fechaSeleccionada}</span>
                        </div>
                        <div className="totales-stats">
                            <div className="total-item">
                               
                                <div className="total-info">
                                    <span className="total-label">Total Colaboradores Asistencia</span>
                                    <span className="total-valor">
                                        {filteredData.filter(r => r.attributes?.confirm === true).length}
                                    </span>
                                </div>
                            </div>
                            <div className="total-item">
                                
                                <div className="total-info">
                                    <span className="total-label">Total acompañantes Asistencia</span>
                                    <span className="total-valor">
                                        {filteredData.filter(r => r.attributes?.llevaAcompanante === true && r.attributes?.confirm === true).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="filter-export-container">
                        <div className="filter-container">
                            <Input
                                placeholder="Buscar por número de documento..."
                                prefix={<SearchOutlined />}
                                value={searchDocumento}
                                onChange={(e) => setSearchDocumento(e.target.value)}
                                className="filter-input"
                                allowClear
                            />
                        </div>
                        
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={exportToExcel}
                            className="btn-export-excel"
                            disabled={filteredData.length === 0}
                        >
                            Exportar a Excel
                        </Button>
                    </div>

                    {loading ? (
                        <LoadingSpinner message="Cargando reservas del evento..." />
                    ) : (
                        <div className="tabla-container asistencia-tabla-container">
                            {filteredData.length === 0 ? (
                                <p className="mensaje-sin-datos">
                                    {searchDocumento 
                                        ? "No se encontraron resultados con ese documento" 
                                        : "No hay reservas para mostrar"}
                                </p>
                            ) : (

                                
                                <Table
                                    columns={columns}
                                    dataSource={filteredData}
                                    rowKey="id"
                                    pagination={paginationConfig}
                                    className="tabla-asistencia-ant"
                                    scroll={{ x: 'max-content' }}
                                />
                            )}
                        </div>
                    )}
                </>
            )}

            {!Fecha && !loading && mesSeleccionado && (
                <div className="mensaje-sin-datos">
                    Seleccione una fecha del mes para ver las reservas
                </div>
            )}

            {!mesSeleccionado && !loading && (
                <div className="mensaje-sin-datos">
                    Seleccione un mes para ver las fechas disponibles
                </div>
            )}

            {/* Overlay de loading */}
            {loadingToggle && (
                <div className="loading-overlay">
                    <div className="loading-container">
                        <div className="loading-text">
                            Actualizando
                            <span className="loading-dots">
                                <span className="dot dot1">.</span>
                                <span className="dot dot2">.</span>
                                <span className="dot dot3">.</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Asistencia;
