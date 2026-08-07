'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { addDays, endOfToday, endOfYear, format, startOfToday, startOfYear, subDays } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
// import { useTranslation } from 'react-i18next';
const useTranslation = () => ({ t: (k: string, ..._args: any[]) => k });
import { type DateRange } from 'react-day-picker';

type DateRangeOption = {
  label: string;
  handler: () => void;
};

export const DateRangePicker = ({
  className,
  placeholder,
  range,
  setRange,
}: {
  className?: string;
  placeholder?: string;
  range: DateRange | undefined;
  setRange: (date: DateRange) => void;
}) => {
  const { t } = useTranslation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setShowCalendar(Boolean(range?.from));
  }, [range]);

  const handleLast7Days = () => {
    setRange({
      from: subDays(startOfToday(), 7),
      to: endOfToday(),
    });
  };

  const handleLast30Days = () => {
    setRange({
      from: subDays(startOfToday(), 30),
      to: endOfToday(),
    });
  };

  const handleThisYear = () => {
    setRange({
      from: startOfYear(startOfToday()),
      to: endOfYear(endOfToday()),
    });
  };

  const options: DateRangeOption[] = [
    { label: t('ui.dateRangePicker.last7Days'), handler: handleLast7Days },
    { label: t('ui.dateRangePicker.last30Days'), handler: handleLast30Days },
    { label: t('ui.dateRangePicker.thisYear'), handler: handleThisYear },
    { label: t('ui.dateRangePicker.custom'), handler: () => setShowCalendar(true) },
  ];

  // Reset focused index when popover opens
  useEffect(() => {
    if (!showCalendar) {
      setFocusedIndex(0);
    }
  }, [showCalendar]);

  // Keyboard navigation
  useEffect(() => {
    if (!showCalendar) {
      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setFocusedIndex((prev) => (prev + 1) % options.length);
            break;
          case 'ArrowUp':
            e.preventDefault();
            setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            options[focusedIndex].handler();
            break;
          case 'Escape':
            e.preventDefault();
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showCalendar, focusedIndex, options]);

  // Focus management - focus the selected item when list renders
  useEffect(() => {
    if (!showCalendar && listRef.current) {
      const focusedElement = listRef.current.querySelector(`[tabindex="0"]`);
      if (focusedElement instanceof HTMLElement) {
        focusedElement.focus();
      }
    }
  }, [showCalendar, focusedIndex]);

  return (
    <Popover onOpenChange={(open) => !open && !range?.from && setShowCalendar(false)}>
      <PopoverTrigger asChild>
        <Button
          className={cn('items-center justify-start pl-3 text-left font-normal', className)}
          id="date-range"
          size="sm"
          variant="outline"
        >
          <CalendarIcon className="h-4 w-4" />
          {range?.from && range?.to ? (
            <span>
              {format(range.from, 'LLL dd, y')} - {format(range.to, 'LLL dd, y')}
            </span>
          ) : (
            <span>{placeholder ?? t('ui.dateRangePicker.placeholder')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="h-fit w-auto p-0">
        {!showCalendar && (
          <div className="p-2">
            <ul ref={listRef} role="listbox" aria-label={t('ui.dateRangePicker.ariaLabel')}>
              {options.map((option, index) => (
                <li
                  key={option.label}
                  role="option"
                  aria-selected={focusedIndex === index}
                  tabIndex={focusedIndex === index ? 0 : -1}
                  onClick={() => {
                    option.handler();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      option.handler();
                    }
                  }}
                  onFocus={() => setFocusedIndex(index)}
                  className={cn(
                    'flex cursor-pointer items-center rounded-md px-3 py-2 text-sm hover:bg-secondary/80',
                    focusedIndex === index && 'bg-secondary/50',
                  )}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
        {showCalendar && (
          <Calendar
            captionLayout="dropdown"
            min={2}
            mode="range"
            numberOfMonths={2}
            footer={
              <Button
                variant="ghost"
                className="mt-3"
                size="sm"
                onClick={() => {
                  setRange({ from: undefined, to: undefined });
                  setShowCalendar(false);
                }}
              >
                <X className="h-4 w-4" />
                {t('ui.dateRangePicker.clear')}
              </Button>
            }
            onSelect={(range: DateRange | undefined) => {
              if (range && range.from && !range.to) {
                setRange({
                  from: range.from,
                  to: addDays(range.from, 1),
                });
                return;
              }

              if (range) {
                setRange(range);
              }
            }}
            selected={range}
          />
        )}
      </PopoverContent>
    </Popover>
  );
};
