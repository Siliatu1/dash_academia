import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import LoadingSpinner from "./LoadingSpinner";
import "./styles/InscripcionDiplomado.css";
import { createTablePagination } from "../utils/pagination";

const InscripcionDiplomado = () => {
    const navigate = useNavigate();
    const [inscripciones, setInscripciones] = useState([]);
    const [empleadosMap, setEmpleadosMap] = useState(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchEmpleados();
        fetchInscripciones();
    }, []);

    const fetchEmpleados = async () => {
        try {
            const response = await fetch('https://apialohav2.crepesywaffles.com/buk/empleados3');
            const data = await response.json();
            
            const empleadosArray = data.data || [];
            const empleadosMapTemp = new Map();
            
            empleadosArray.forEach(empleado => {
                const documento = empleado.document_number?.toString().trim().replace(/,/g, '');
                if (documento) {
                    empleadosMapTemp.set(documento, {
                        foto: empleado.foto || null,
                        nombre: empleado.nombre || "N/A",
                        celular: empleado.Celular || "N/A",
                        correo: empleado.correo || "N/A"
                    });
                }
            });
            
            setEmpleadosMap(empleadosMapTemp);
        } catch (err) {
            console.error("Error al cargar empleados:", err);
        }
    };

    const fetchInscripciones = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://macfer.crepesywaffles.com//api/sintonizarte-diplomado-res?populate=*');
            const data = await response.json();
            
            setInscripciones(data.data || []);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar las inscripciones: ' + err.message);
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar esta inscripción?')) {
            return;
        }

        try {
            const response = await fetch(`https://macfer.crepesywaffles.com//api/sintonizarte-diplomado-res/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setInscripciones(prev => prev.filter(item => item.id !== id));
            } else {
                alert('Error al eliminar la inscripción');
            }
        } catch (err) {
            alert('Error al eliminar: ' + err.message);
        }
    };

    const exportarAExcel = () => {
        // Preparar datos para exportar
        const dataToExport = inscripciones.map(inscripcion => {
            const documento = inscripcion.attributes?.Documento?.toString().trim().replace(/,/g, '');
            const empleado = empleadosMap.get(documento);
            
            return {
                'Nombre': inscripcion.attributes?.Nombre || 'N/A',
                'Documento': inscripcion.attributes?.Documento || 'N/A',
                'Cargo': inscripcion.attributes?.Cargo || 'N/A',
                'Departamento': inscripcion.attributes?.Departamento || 'N/A',
                'Correo': inscripcion.attributes?.Correo || 'N/A',
                'Celular': empleado?.celular || 'N/A',
                'Diplomado': inscripcion.attributes?.sintonizarte_diplomado?.data?.attributes?.Nombre || 'N/A'
            };
        });

        // Crear hoja de Excel
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        
        // Ajustar ancho de columnas automáticamente
        const colWidths = [
            { wch: 30 },  // Nombre
            { wch: 15 },  // Documento
            { wch: 35 },  // Cargo
            { wch: 25 },  // Departamento
            { wch: 30 },  // Correo
            { wch: 15 },  // Celular
            { wch: 30 }   // Diplomado
        ];
        ws['!cols'] = colWidths;

        // Crear libro de Excel
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inscripciones Diplomado");
        
        // Descargar archivo
        const fecha = new Date().toLocaleDateString('es-CO').replace(/\//g, '-');
        const fileName = `Inscripciones_Diplomado_${fecha}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const pageSize = 8;

    const paginationConfig = createTablePagination({
        currentPage,
        pageSize,
        totalItems: inscripciones.length,
        onChange: (page) => setCurrentPage(page),
        itemLabel: 'inscripciones',
    });

    const columns = [
        {
            title: 'FOTO',
            key: 'foto',
            width: 90,
            render: (_, record) => {
                const documento = record.attributes?.Documento?.toString().trim().replace(/,/g, '');
                const empleado = empleadosMap.get(documento);
                const nombre = record.attributes?.Nombre || "";
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
            title: 'NOMBRE',
            dataIndex: ['attributes', 'Nombre'],
            key: 'nombre',
            width: 200,
        },
        {
            title: 'DOCUMENTO',
            dataIndex: ['attributes', 'Documento'],
            key: 'documento',
            width: 150,
        },
        {
            title: 'CARGO',
            dataIndex: ['attributes', 'Cargo'],
            key: 'cargo',
            width: 180,
        },
        {
            title: 'DEPARTAMENTO',
            dataIndex: ['attributes', 'Departamento'],
            key: 'departamento',
            width: 150,
        },
        {
            title: 'CORREO',
            dataIndex: ['attributes', 'Correo'],
            key: 'correo',
            width: 200,
        },
        {
            title: 'CELULAR',
            key: 'celular',
            width: 130,
            render: (_, record) => {
                const documento = record.attributes?.Documento?.toString().trim().replace(/,/g, '');
                const empleado = empleadosMap.get(documento);
                return empleado?.celular || 'N/A';
            },
        },
        {
            title: 'DIPLOMADO',
            key: 'diplomado',
            width: 180,
            render: (_, record) => {
                return record.attributes?.sintonizarte_diplomado?.data?.attributes?.Nombre || "N/A";
            },
        },
        {
            title: 'ACCIONES',
            key: 'acciones',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <button
                    className="btn-eliminar"
                    onClick={() => handleEliminar(record.id)}
                    title="Eliminar inscripción"
                >
                    <i className="bi bi-x-circle-fill"></i>
                </button>
            ),
        },
    ];

    if (loading) {
        return <LoadingSpinner message="Cargando inscripciones del diplomado..." />;
    }

    if (error) {
        return (
            <div className="inscripcion-diplomado-container">
                <div className="error-message">
                    <i className="bi bi-exclamation-triangle"></i>
                    <p>{error}</p>
                    <button className="btn-retry" onClick={fetchInscripciones}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="inscripcion-diplomado-container">
            <div className="inscripcion-header">
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={exportarAExcel}
                    className="btn-export-excel"
                    disabled={inscripciones.length === 0}
                >
                    Exportar a Excel
                </Button>
            </div>

            <div className="tabla-container inscripcion-tabla-container">
                {inscripciones.length === 0 ? (
                    <p className="mensaje-sin-datos">
                        No hay inscripciones para mostrar
                    </p>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={inscripciones}
                        rowKey="id"
                        pagination={paginationConfig}
                        className="tabla-inscripcion-ant"
                        scroll={{ x: 'max-content' }}
                    />
                )}
            </div>
        </div>
    );
};

export default InscripcionDiplomado;
