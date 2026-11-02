import { useEffect, useRef } from 'react';

type ResizableDividerProps = {
  side: 'left' | 'right';
  width: number;
  min: number;
  max: number;
  ariaLabel: string;
  onChange: (width: number) => void;
};

export const ResizableDivider = ({
  side,
  width,
  min,
  max,
  ariaLabel,
  onChange,
}: ResizableDividerProps) => {
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(
    () => () => {
      document.body.classList.remove('dx-panel-resizing');
    },
    []
  );

  const finishDragging = (target: HTMLElement, pointerId: number) => {
    dragRef.current = null;
    document.body.classList.remove('dx-panel-resizing');
    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
  };

  return (
    <div
      className={`dx-divider dx-divider--${side}`}
      role="separator"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={(event) => {
        event.preventDefault();
        dragRef.current = { startX: event.clientX, startWidth: width };
        document.body.classList.add('dx-panel-resizing');
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag) {
          return;
        }
        const delta = event.clientX - drag.startX;
        onChange(drag.startWidth + (side === 'left' ? delta : -delta));
      }}
      onPointerUp={(event) => finishDragging(event.currentTarget, event.pointerId)}
      onPointerCancel={(event) => finishDragging(event.currentTarget, event.pointerId)}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 32 : 12;
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          onChange(width + (side === 'left' ? -step : step));
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          onChange(width + (side === 'left' ? step : -step));
        }
      }}
    />
  );
};
