import React, { ReactNode } from 'react';
import { useSwipe } from '../hooks/useSwipe';
import { ChevronLeft, ChevronRight, Hand } from 'lucide-react';

interface SwipeableContainerProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showMobileSwipeIndicator?: boolean;
  className?: string;
}

export const SwipeableContainer: React.FC<SwipeableContainerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  currentPage,
  totalPages,
  onPageChange,
  showMobileSwipeIndicator = false,
  className = '',
}) => {
  const { touchProps, swipingDirection } = useSwipe({
    onSwipeLeft,
    onSwipeRight,
    threshold: 45,
  });

  return (
    <div className={`relative ${className}`} {...touchProps}>
      {/* Visual cue during swipe */}
      {swipingDirection === 'left' && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-slate-900/80 text-white p-2 rounded-full shadow-lg pointer-events-none sm:hidden animate-pulse">
          <ChevronRight className="w-5 h-5" />
        </div>
      )}
      {swipingDirection === 'right' && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-slate-900/80 text-white p-2 rounded-full shadow-lg pointer-events-none sm:hidden animate-pulse">
          <ChevronLeft className="w-5 h-5" />
        </div>
      )}

      {/* Main Content Area */}
      <div className="transition-all duration-300">
        {children}
      </div>

      {/* Optional Mobile Floating Gesture Cue */}
      {showMobileSwipeIndicator && totalPages && totalPages > 1 && (
        <div className="flex sm:hidden items-center justify-between mt-3 px-2 py-1.5 bg-slate-100/90 rounded-xl text-[11px] text-slate-500">
          <div className="flex items-center space-x-1">
            <Hand className="w-3.5 h-3.5 text-slate-400" />
            <span>Swipe left / right to turn page</span>
          </div>
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => onPageChange && onPageChange(idx + 1)}
                className={`h-1.5 rounded-full transition-all ${
                  currentPage === idx + 1 ? 'w-4 bg-slate-900' : 'w-1.5 bg-slate-300'
                }`}
                aria-label={`Page ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
