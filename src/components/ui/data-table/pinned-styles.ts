import type React from 'react';

import type { Column } from '@tanstack/react-table';

const HEADER_BASE_Z_INDEX = 30;
const CELL_BASE_Z_INDEX = 20;

export const getPinnedStyles = <TData>(
  column: Column<TData>,
  layer: 'header' | 'cell' = 'cell',
): React.CSSProperties => {
  const pinned = column.getIsPinned();
  if (!pinned) return {};

  // Keep pinned columns above table content but below global overlays (dialogs/dropdowns use z-50).
  // Use a shared layer for all pinned columns so adjacent pinned cells can't mask each other.
  const baseZIndex = layer === 'header' ? HEADER_BASE_Z_INDEX : CELL_BASE_Z_INDEX;
  const zIndex = baseZIndex;

  if (pinned === 'left') {
    return {
      position: 'sticky',
      left: column.getStart('left'),
      zIndex,
      backgroundColor: 'var(--background)',
    };
  }

  return {
    position: 'sticky',
    right: column.getAfter('right'),
    zIndex,
    backgroundColor: 'var(--background)',
  };
};
