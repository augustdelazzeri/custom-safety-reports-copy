import { cn } from '@/lib/utils';
import type React from 'react';
import { ReactNode, useCallback } from 'react';

export const ClickableRow = ({
  children,
  onClick,
  className,
  disabled = false,
  ...props
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
} & React.ComponentProps<'div'>) => {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !onClick) return;

      // Only trigger if the click is not on an interactive element
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest('button') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('[data-interactive]');

      if (isInteractive) return;

      onClick();
    },
    [disabled, onClick],
  );

  return (
    <div
      className={cn('cursor-pointer transition-colors', disabled && 'cursor-default opacity-50', className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};
