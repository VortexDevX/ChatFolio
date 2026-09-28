import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  cardBg?: string;
  cardBorder?: string;
  textColor?: string;
  mutedColor?: string;
  accentBg?: string;
  accentText?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  cardBg = 'rgba(15, 23, 42, 0.7)',
  cardBorder = 'rgba(148, 163, 184, 0.1)',
  textColor = '#f1f5f9',
  mutedColor = '#94a3b8',
  accentBg = '#10b981',
  accentText = '#090d16',
}) => {
  const isAll = pageSize >= totalItems && totalItems > 0;
  const totalPages = isAll ? 1 : Math.ceil(totalItems / pageSize);

  if (totalItems <= 15) return null; // No need for pagination on tiny conversations

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handlePageClick = (p: number) => {
    onPageChange(p);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  return (
    <div
      className="no-print rounded-2xl border p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 select-none transition-colors"
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
    >
      {/* Items Count Summary */}
      <div className="text-xs font-medium" style={{ color: mutedColor }}>
        {isAll ? (
          <span>Showing all <strong>{totalItems}</strong> messages</span>
        ) : (
          <span>
            Showing messages <strong>{startItem}–{endItem}</strong> of <strong>{totalItems}</strong>
          </span>
        )}
      </div>

      {/* Page Navigation Controls with Lucide Chevron Icons */}
      {!isAll && totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            title="Previous Page"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            style={{
              backgroundColor: cardBg,
              borderColor: cardBorder,
              color: textColor,
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          {/* Page Number Pills */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-xs"
                    style={{ color: mutedColor }}
                  >
                    ...
                  </span>
                );
              }

              const pageNum = Number(p);
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageClick(pageNum)}
                  className="w-8 h-8 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center"
                  style={{
                    backgroundColor: isActive ? (accentBg || textColor) : cardBg,
                    borderColor: isActive ? (accentBg || textColor) : cardBorder,
                    color: isActive ? (accentText || cardBg) : textColor,
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            title="Next Page"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            style={{
              backgroundColor: cardBg,
              borderColor: cardBorder,
              color: textColor,
            }}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Size Selector */}
      <div className="flex items-center gap-1.5 text-xs" style={{ color: mutedColor }}>
        <span>Per page:</span>
        {[15, 30, 50].map((size) => (
          <button
            key={size}
            onClick={() => onPageSizeChange(size)}
            className="px-2 py-1 rounded-lg border font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: pageSize === size && !isAll ? (accentBg || textColor) : cardBg,
              borderColor: pageSize === size && !isAll ? (accentBg || textColor) : cardBorder,
              color: pageSize === size && !isAll ? (accentText || cardBg) : textColor,
            }}
          >
            {size}
          </button>
        ))}
        <button
          onClick={() => onPageSizeChange(totalItems)}
          className="px-2 py-1 rounded-lg border font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor: isAll ? (accentBg || textColor) : cardBg,
            borderColor: isAll ? (accentBg || textColor) : cardBorder,
            color: isAll ? (accentText || cardBg) : textColor,
          }}
        >
          All
        </button>
      </div>
    </div>
  );
};
