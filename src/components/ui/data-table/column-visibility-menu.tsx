import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type VisibilityState } from '@tanstack/react-table';
import { SlidersHorizontal } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
const useTranslation = () => ({ t: (k: string, ..._args: any[]) => k });

export type ColumnVisibilityItem = {
  id: string;
  label: string;
  canHide: boolean;
};

type ColumnVisibilityMenuProps = {
  items: ColumnVisibilityItem[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (visibility: VisibilityState) => void;
  /** Default hides below md; on desktop-table pages pass `inline-flex` and gate render with `!isMobile`. */
  className?: string;
};

export const ColumnVisibilityMenu = ({
  items,
  columnVisibility,
  onColumnVisibilityChange,
  className = 'hidden md:inline-flex',
}: ColumnVisibilityMenuProps) => {
  const { t } = useTranslation();

  const hideableItems = items.filter((item) => item.canHide);
  const hiddenCount = hideableItems.filter((item) => columnVisibility[item.id] === false).length;

  const handleToggle = (id: string, checked: boolean) => {
    const next = { ...columnVisibility };
    if (checked) {
      delete next[id];
    } else {
      next[id] = false;
    }
    onColumnVisibilityChange(next);
  };

  const handleReset = () => {
    onColumnVisibilityChange({});
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-2', className)}>
          <SlidersHorizontal className="h-4 w-4" />
          {t('common.dataTable.columns')}
          {hiddenCount > 0 ? (
            <Badge variant="secondary" className="px-1.5 py-0 text-xs font-normal">
              {t('common.dataTable.columnsHidden', { count: hiddenCount })}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('common.dataTable.columns')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideableItems.map((item) => {
          const isVisible = columnVisibility[item.id] !== false;
          return (
            <DropdownMenuCheckboxItem
              key={item.id}
              checked={isVisible}
              onCheckedChange={(checked) => handleToggle(item.id, checked === true)}
              onSelect={(event) => event.preventDefault()}
            >
              {item.label}
            </DropdownMenuCheckboxItem>
          );
        })}
        {hiddenCount > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleReset}>{t('common.dataTable.resetColumns')}</DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
