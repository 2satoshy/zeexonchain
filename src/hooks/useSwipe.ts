import { useState, useRef, useEffect, TouchEvent } from 'react';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // minimum distance in px to trigger swipe (default 50)
  maxPerpendicularDistance?: number; // max vertical deviation (default 100)
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  maxPerpendicularDistance = 100,
}: UseSwipeOptions) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipingDirection, setSwipingDirection] = useState<'left' | 'right' | null>(null);

  const handleTouchStart = (e: TouchEvent<HTMLElement>) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      setSwipingDirection(null);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Check if primarily horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 20) {
        setSwipingDirection('right');
      } else if (diffX < -20) {
        setSwipingDirection('left');
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - touchStartY.current;

    if (Math.abs(diffY) <= maxPerpendicularDistance) {
      if (diffX > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (diffX < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setSwipingDirection(null);
  };

  return {
    touchProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    swipingDirection,
  };
}
