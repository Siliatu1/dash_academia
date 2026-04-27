import React from "react";
import { getVisiblePageNumbers } from "../utils/pagination";

const PaginationControls = ({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    itemLabel,
    maxVisiblePages = 3,
    className = "",
}) => {
    const totalPages = Math.ceil(totalItems / pageSize);

    if (totalPages <= 1) {
        return null;
    }

    const visiblePages = getVisiblePageNumbers(currentPage, totalPages, maxVisiblePages);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className={`shared-pagination ${className}`.trim()}>
            <div className="shared-pagination-buttons">
                <button
                    className="shared-pagination-btn"
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                >
                    ←
                </button>

                {visiblePages.map((page) => (
                    <button
                        key={page}
                        className={`shared-pagination-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                <button
                    className="shared-pagination-btn"
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    →
                </button>
            </div>

            <span className="shared-pagination-info">
                Mostrando {startItem}-{endItem} de {totalItems} {itemLabel}
            </span>
        </div>
    );
};

export default PaginationControls;