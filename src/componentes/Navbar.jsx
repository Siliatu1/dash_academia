import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/Navbar.css";
import { RotateCcw } from 'lucide-react';

const Navbar = ({ onRefresh }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: "/", label: "Dashboard" },
        { path: "/asistencia-lideres", label: "Asistencia Líderes" },
        { path: "/asistencia", label: "Confirmar Asistencia" },
        { path: "/inscripcion-diplomado", label: "Inscripción Diplomado" }
    ];

    const isActive = (path) => location.pathname === path;

    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();
        } else {
            window.location.reload();
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">

                <div className="navbar-logo">
                    <img src="src/assets/logo.png" alt="Logo" height={20} align="center" />
                </div>

                <div className="navbar-menu">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            className={`navbar-link ${isActive(item.path) ? "active" : ""}`}
                            onClick={() => navigate(item.path)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="navbar-actions">
                    <button className="navbar-btn-refresh" onClick={handleRefresh}>
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;