import type React from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      offset={{ bottom: 'var(--toaster-offset-bottom, 0px)' }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--slate-12)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
