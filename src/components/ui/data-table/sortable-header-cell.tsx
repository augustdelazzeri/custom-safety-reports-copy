import { Button } from '@/components/ui/button';
import { TableHead } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS as DndCSS } from '@dnd-kit/utilities';
import { flexRender, type Header } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
const useTranslation = () => ({ t: (k: string, ..._args: any[]) => k });

import { getPinnedStyles } from './pinned-styles';

type SortableHeaderCellProps<TData> = {
  header: Header<TData, unknown>;
};

type SortableHookResult = ReturnType<typeof useSortable>;

type HeaderSortButtonProps<TData> = {
  header: Header<TData, unknown>;
  sorted: false | 'asc' | 'desc';
  sortLabel: string;
};

const HeaderSortButton = <TData,>({ header, sorted, sortLabel }: HeaderSortButtonProps<TData>) => {
  const { t } = useTranslation();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-8 cursor-pointer justify-start gap-1 px-1"
          onClick={header.column.getToggleSortingHandler()}
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          {sorted === 'asc' && <ArrowUp className="h-3 w-3 shrink-0" />}
          {sorted === 'desc' && <ArrowDown className="h-3 w-3 shrink-0" />}
          {!sorted && <ArrowUpDown className="h-3 w-3 shrink-0 opacity-40" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('ui.dataTable.sortBy', { sortLabel })}</TooltipContent>
    </Tooltip>
  );
};

type HeaderPinButtonsProps<TData> = {
  header: Header<TData, unknown>;
  pinned: false | 'left' | 'right';
  columnLabel: string;
};

const HeaderPinButtons = <TData,>({ header, pinned, columnLabel }: HeaderPinButtonsProps<TData>) => {
  const { t } = useTranslation();
  const leftPinLabel =
    pinned === 'left' ? t('ui.dataTable.unpinFromLeft', { columnLabel }) : t('ui.dataTable.pinToLeft', { columnLabel });
  const rightPinLabel =
    pinned === 'right'
      ? t('ui.dataTable.unpinFromRight', { columnLabel })
      : t('ui.dataTable.pinToRight', { columnLabel });

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={pinned === 'left' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            onClick={(event) => {
              event.stopPropagation();
              header.column.pin(pinned === 'left' ? false : 'left');
            }}
          >
            <span className="text-[10px] font-semibold">{t('ui.dataTable.pinLeftShort')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{leftPinLabel}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={pinned === 'right' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            onClick={(event) => {
              event.stopPropagation();
              header.column.pin(pinned === 'right' ? false : 'right');
            }}
          >
            <span className="text-[10px] font-semibold">{t('ui.dataTable.pinRightShort')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{rightPinLabel}</TooltipContent>
      </Tooltip>
    </>
  );
};

type HeaderDragHandleProps = {
  attributes: SortableHookResult['attributes'];
  listeners: SortableHookResult['listeners'];
};

const HeaderDragHandle = ({ attributes, listeners }: HeaderDragHandleProps) => {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
      onClick={(event) => event.stopPropagation()}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-3.5 w-3.5" />
      <span className="sr-only">{t('ui.dataTable.reorderColumn')}</span>
    </Button>
  );
};

type HeaderResizeHandleProps<TData> = {
  header: Header<TData, unknown>;
};

const HeaderResizeHandle = <TData,>({ header }: HeaderResizeHandleProps<TData>) => {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'absolute top-0 right-0 z-30 h-full w-2 cursor-col-resize rounded-none p-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
        header.column.getIsResizing() && 'bg-primary/30 opacity-100 hover:bg-primary/30',
      )}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => {
        event.stopPropagation();
        header.column.resetSize();
      }}
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
    >
      <span className="sr-only">{t('ui.dataTable.resizeColumn')}</span>
    </Button>
  );
};

const humanizeColumnId = (columnId: string) =>
  columnId
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

export const SortableHeaderCell = <TData,>({ header }: SortableHeaderCellProps<TData>) => {
  const canSort = header.column.getCanSort();
  const canPin = header.column.getCanPin();
  const canResize = header.column.getCanResize();
  const canReorder = (header.column.columnDef.meta as any)?.disableColumnOrdering !== true;
  const sorted = header.column.getIsSorted();
  const pinned = header.column.getIsPinned();
  const columnLabel =
    (typeof header.column.columnDef.header === 'string' && header.column.columnDef.header.trim()) ||
    (header.column.columnDef.meta as any)?.sortLabel ||
    humanizeColumnId(header.column.id);
  const sortLabel = (header.column.columnDef.meta as any)?.sortLabel ?? columnLabel;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: header.column.id,
    disabled: !canReorder || header.isPlaceholder,
  });

  const dragTransform = transform ? { ...transform, scaleX: 1, scaleY: 1 } : null;

  const dragStyle = canReorder
    ? {
        // Prevent text distortion when dragging across columns with different widths.
        transform: DndCSS.Transform.toString(dragTransform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }
    : undefined;

  return (
    <TableHead
      style={{ width: header.getSize(), ...getPinnedStyles(header.column, 'header') }}
      data-column-id={header.column.id}
      aria-sort={canSort ? (sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none') : undefined}
      className={cn(
        'group relative whitespace-nowrap text-foreground',
        pinned && 'bg-background',
        (header.column.columnDef.meta as any)?.headerClassName,
      )}
    >
      {header.isPlaceholder ? null : (
        <div ref={setNodeRef} style={dragStyle} className="flex items-center gap-1">
          {canSort ? (
            <HeaderSortButton header={header} sorted={sorted} sortLabel={sortLabel} />
          ) : (
            <div className="px-1">{flexRender(header.column.columnDef.header, header.getContext())}</div>
          )}

          <div className="ml-auto flex items-center gap-0.5">
            {canPin ? <HeaderPinButtons header={header} pinned={pinned} columnLabel={columnLabel} /> : null}
            {canReorder ? <HeaderDragHandle attributes={attributes} listeners={listeners} /> : null}
          </div>
        </div>
      )}

      {canResize ? <HeaderResizeHandle header={header} /> : null}
    </TableHead>
  );
};
