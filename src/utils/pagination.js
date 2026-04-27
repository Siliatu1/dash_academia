import { createElement } from 'react';

export const getVisiblePageNumbers = (currentPage, totalPages, maxVisiblePages = 3) => {
    const safeMaxVisiblePages = Math.max(1, maxVisiblePages);
    let startPage = Math.max(1, currentPage - Math.floor(safeMaxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + safeMaxVisiblePages - 1);

    if (endPage - startPage < safeMaxVisiblePages - 1) {
        startPage = Math.max(1, endPage - safeMaxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let page = startPage; page <= endPage; page += 1) {
        pageNumbers.push(page);
    }

    return pageNumbers;
};

export const renderPaginationArrow = (direction) => {
    const symbol = direction === 'prev' ? '←' : '→';
    return createElement('button', { className: 'pagination-btn-custom' }, symbol);
};

export const createTablePagination = ({
    currentPage,
    pageSize,
    totalItems,
    onChange,
    itemLabel,
    maxVisiblePages = 3,
}) => ({
    current: currentPage,
    pageSize,
    showSizeChanger: false,
    onChange,
    itemRender: (page, type, originalElement) => {
        if (type === 'prev') {
            return renderPaginationArrow('prev');
        }

        if (type === 'next') {
            return renderPaginationArrow('next');
        }

        if (type === 'page') {
            const totalPages = Math.ceil(totalItems / pageSize);
            const visiblePages = getVisiblePageNumbers(currentPage, totalPages, maxVisiblePages);
            return visiblePages.includes(page) ? originalElement : null;
        }

        if (type === 'jump-prev' || type === 'jump-next') {
            return null;
        }

        return originalElement;
    },
    showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} ${itemLabel}`,
});