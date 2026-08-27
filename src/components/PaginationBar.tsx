import React from 'react';
import { ChevronLeft, ChevronRight, Hand } from 'lucide-react';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  className?: string;
  showSwipeHint?: boolean;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemName = 'items',
  className = '',
  showSwipeHint = true,
}) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
      {/* Left: Summary and Mobile swipe hint */}
      <div className="flex items-center space-x-3 text-xs text-slate-500">
        {totalItems && startItem && endItem ? (
          <span>
            Showing <strong className="text-slate-900 font-semibold">{startItem}–{endItem}</strong> of <strong className="text-slate-900 font-semibold">{totalItems}</strong> {itemName}
          </span>
        ) : (
          <span>
            Page <strong className="text-slate-900 font-semibold">{currentPage}</strong> of <strong className="text-slate-900 font-semibold">{totalPages}</strong>
          </span>
        )}

        {showSwipeHint && (
          <span className="hidden sm:inline-flex items-center text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
            Swipe ‹ › on mobile
          </span>
        )}
      </div>

      {/* Center/Right: Page Dots/Buttons and Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentPage === 1
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* Numbered Pill Buttons / Dots */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, idx) => {
            if (typeof page === 'string') {
              return (
                <span key={`dots-${idx}`} className="px-1.5 text-xs text-slate-400">
                  …
                </span>
              );
            }
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-label={`Go to page ${page}`}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                  currentPage === page
                    ? 'bg-slate-900 text-white shadow-xs scale-105'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentPage === totalPages
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95 shadow-xs'
          }`}
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
