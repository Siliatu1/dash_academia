import React from 'react';
import './styles/LoadingSpinner.css';

const LoadingSpinner = ({ message = "Cargando datos..." }) => {
    return (
        
            <div className="loading-spinner-content">
                <div className="spinner-wrapper">
                    <div className="spinner"></div>
                    <div className="spinner-inner"></div>
                </div>
                <p className="loading-message">{message}</p>
            </div>

    );
};

export default LoadingSpinner;