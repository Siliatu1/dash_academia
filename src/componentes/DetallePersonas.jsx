import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Table, Tag, Space } from 'antd';
import "bootstrap-icons/font/bootstrap-icons.css";
import LoadingSpinner from "./LoadingSpinner";
import "./styles/DetallePersonas.css";
import { useAppData } from "../context/AppDataContext";
import { buildDetalleDepartamentoStats } from "../utils/dashboardStats";
import { createTablePagination } from "../utils/pagination";

const DetallePersonas = ({ departamento: departamentoProp, onVolver }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const departamento = departamentoProp || location.state?.departamento;
    const { empleados, reservas, detalleStatsIndex, loading, error } = useAppData();
    
    const handleVolver = () => {
        if (onVolver) {
            onVolver();
        } else {
            navigate(-1);
        }
    };
    const [vistaActual, setVistaActual] = useState('inscritos'); 
    const [currentPage, setCurrentPage] = useState(1);

    const detalleDepartamento = useMemo(() => {
        if (empleados.length > 0 && reservas.length > 0) {
            return buildDetalleDepartamentoStats(departamento, empleados, reservas);
        }

        return detalleStatsIndex[departamento] || {
            personasFaltantes: [],
            personasInscritas: [],
            totales: {
                totalPersonas: 0,
                conReserva: 0,
                sinReserva: 0,
                totalAsistentes: 0,
                participacion: 0,
            },
        };
    }, [departamento, detalleStatsIndex, empleados, reservas]);

    const { personasFaltantes, personasInscritas, totales } = detalleDepartamento;
    const hasDetalleSnapshot = Boolean(detalleStatsIndex[departamento]);

    useEffect(() => {
        setCurrentPage(1);
    }, [departamento, vistaActual]);

    if (loading && !hasDetalleSnapshot) {
        return <LoadingSpinner message="Cargando detalles del departamento..." />;
    }

    if (error) {
        return (
            <div className="detalle-container">
                <div className="error-box">
                    <i className="bi bi-exclamation-triangle"></i>
                    <p>Error al cargar los datos: {error}</p>
                    <button onClick={handleVolver} className="btn-volver">
                        Volver al dashboard
                    </button>
                </div>
            </div>
        );
    }

    const personasAMostrar = vistaActual === 'inscritos' ? personasInscritas : personasFaltantes;
    
    const pageSize = 8;

   
    const paginationConfig = createTablePagination({
        currentPage,
        pageSize,
        totalItems: personasAMostrar.length,
        onChange: (page) => setCurrentPage(page),
        itemLabel: 'personas',
    });
    

    const columnasInscritos = [
        {
            title: 'Foto',
            key: 'foto',
            width: '10%',
            render: (_, record) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {record.foto ? (
                        <img 
                            src={record.foto} 
                            alt="Foto empleado" 
                            style={{ 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                border: '2px solid #d1d5db'
                            }} 
                        />
                    ) : (
                        <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '50%', 
                            backgroundColor: '#e5e7eb', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '24px',
                            color: '#9ca3af'
                        }}>
                            <i className="bi bi-person-circle"></i>
                        </div>
                    )}
                </div>
            ),
        },
        
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
            width: '25%',
            sorter: (a, b) => a.nombre.localeCompare(b.nombre),
        },
        {
            title: 'Cédula',
            dataIndex: 'document_number',
            key: 'document_number',
            width: '15%',
        },
        {
            title: 'Cargo',
            dataIndex: 'cargo',
            key: 'cargo',
            width: '20%',
        },
        {
            title: 'Área',
            dataIndex: 'departamento',
            key: 'departamento',
            width: '20%',
        },
        {
            title: 'Estado',
            key: 'confirm',
            width: '20%',
            render: (_, record) => (
                <Space size="middle">
                    {record.confirm === true ? (
                        <Tag color="success" style={{fontSize: '12px', padding: '4px 8px'}}>
                            <i className="bi bi-check-circle-fill"></i> Asistió
                        </Tag>
                    ) : record.confirm === false ? (
                        <Tag color="error" style={{fontSize: '12px', padding: '4px 8px'}}>
                            <i className="bi bi-x-circle-fill"></i> No Asistió
                        </Tag>
                    ) : (
                        <Tag color="warning" style={{fontSize: '12px', padding: '4px 8px'}}>
                            <i className="bi bi-clock-fill"></i> Pendiente
                        </Tag>
                    )}
                </Space>
            ),
        },
    ];

    const columnasNoInscritos = [
        {
            title: 'Foto',
            key: 'foto',
            width: '10%',
            render: (_, record) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {record.foto ? (
                        <img 
                            src={record.foto} 
                            alt="Foto empleado" 
                            style={{ 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                border: '2px solid #d1d5db'
                            }} 
                        />
                    ) : (
                        <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '50%', 
                            backgroundColor: '#e5e7eb', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '24px',
                            color: '#9ca3af'
                        }}>
                            <i className="bi bi-person-circle"></i>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
            width: '30%',
            sorter: (a, b) => a.nombre.localeCompare(b.nombre),
        },
        {
            title: 'Cédula',
            dataIndex: 'document_number',
            key: 'document_number',
            width: '20%',
        },
        {
            title: 'Cargo',
            dataIndex: 'cargo',
            key: 'cargo',
            width: '25%',
        },
        {
            title: 'Área',
            dataIndex: 'departamento',
            key: 'departamento',
            width: '25%',
        },
    ];

    return (
        <div className="detalle-container">
            <div className="detalle-header">
                <button onClick={handleVolver} className="btn-volver">
                    <i className="bi bi-arrow-left"></i> Volver
                </button>
                <div className="filtros-botones">
                    <button 
                        className={`btn-filtro ${vistaActual === 'inscritos' ? 'activo inscritos' : ''}`}
                        onClick={() => setVistaActual('inscritos')}
                    >
                        <i className="bi bi-person-check-fill"></i> Inscritos ({totales.conReserva})
                    </button>
                    <button 
                        className={`btn-filtro ${vistaActual === 'no-inscritos' ? 'activo no-inscritos' : ''}`}
                        onClick={() => setVistaActual('no-inscritos')}
                    >
                        <i className="bi bi-person-x-fill"></i> No Inscritos ({totales.sinReserva})
                    </button>
                </div>
            </div>

            <div className="detalle-title-section">
                <h1 className="detalle-title">
                    {vistaActual === 'inscritos' ? (
                        <><i className="bi bi-person-check-fill" style={{color: '#10b981'}}></i>
                        Personas Inscritas - {departamento}</>
                    ) : (
                        <><i className="bi bi-person-x-fill"></i>
                        Personas No Inscritas - {departamento}</>
                    )}
                </h1>
            </div>

            {/* Tabla de personas */}
            <div className="personas-tabla-container detalle-tabla-container">
                <Table 
                    columns={vistaActual === 'inscritos' ? columnasInscritos : columnasNoInscritos}
                    dataSource={personasAMostrar.map((persona, index) => ({
                        ...persona,
                        key: index
                    }))}
                    pagination={paginationConfig}
                    locale={{
                        emptyText: vistaActual === 'inscritos' 
                            ? 'No hay personas inscritas'
                            : '¡Excelente! Todas las personas tienen reserva'
                    }}
                    size="middle"
                    bordered
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '16px'
                    }}
                />
            </div>

          
        </div>
    );
};

export default DetallePersonas;
