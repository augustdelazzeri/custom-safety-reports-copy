'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDate, formatTime } from '@shared/date-utils';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import React from 'react';
// import { useTranslation } from 'react-i18next';
const useTranslation = () => ({ t: (k: string, ..._args: any[]) => k });

export function DateTimePicker({
  selected,
  onSelect,
  className,
  onFocus,
  onlyDate,
  onlyTime,
  placeholder,
  endMonth,
  startMonth,
  disabled,
  id,
  'aria-required': ariaRequired,
  ...props
}: {
  selected?: Date | null;
  onSelect?: (date: Date) => void;
  className?: string;
  onFocus?: () => void;
  onlyDate?: boolean;
  onlyTime?: boolean;
  placeholder?: string;
  endMonth?: Date;
  startMonth?: Date;
  disabled?: boolean | { after?: Date; before?: Date };
  id?: string;
  'aria-required'?: boolean | 'true' | 'false';
} & React.ComponentProps<typeof Calendar>) {
  const { t } = useTranslation();
  // Check if fully disabled (boolean true) vs date restriction (object)
  const isFullyDisabled = disabled === true;

  const triggerLabel = selected
    ? onlyTime
      ? formatTime(selected)
      : formatDate(selected, onlyDate)
    : (placeholder ?? (onlyTime ? t('common.pickATime') : t('common.pickADate')));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          data-empty={!selected}
          className={cn(
            'w-full items-center justify-start pl-3 text-left font-normal data-[empty=true]:text-muted-foreground',
            !selected && 'text-muted-foreground',
            className,
          )}
          disabled={isFullyDisabled}
          onFocus={onFocus}
          aria-required={ariaRequired}
        >
          {selected ? triggerLabel : <span>{triggerLabel}</span>}
          {onlyTime ? (
            <Clock className="ml-auto h-4 w-4 text-muted-foreground" />
          ) : (
            <CalendarIcon className="ml-auto h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {!onlyTime && (
          <Calendar
            {...props}
            disabled={disabled}
            mode="single"
            captionLayout="dropdown"
            selected={selected ?? undefined}
            onSelect={onSelect}
            required
            endMonth={endMonth}
            startMonth={startMonth}
          />
        )}
        {!onlyDate && (
          <div className={cn('p-3', !onlyTime && 'border-t border-border')}>
            <Input
              type="time"
              min="00:00"
              max="23:59"
              value={selected ? formatTime(selected, true) : ''}
              disabled={isFullyDisabled}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const base = selected ? new Date(selected) : new Date(0);
                base.setHours(parseInt(hours), parseInt(minutes));
                onSelect?.(base);
              }}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
