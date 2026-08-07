'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addYears, subYears } from 'date-fns';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { ComponentProps, useEffect, useRef } from 'react';
import { DayButtonProps, DayPicker, DayPickerProps, getDefaultClassNames } from 'react-day-picker';

function Calendar({
  buttonVariant = 'ghost',
  captionLayout = 'label',
  className,
  classNames,
  components,
  formatters,
  showOutsideDays = true,
  endMonth,
  startMonth,
  ...props
}: DayPickerProps & {
  buttonVariant?: ComponentProps<typeof Button>['variant'];
}) {
  const defaultClassNames = getDefaultClassNames();
  const resolvedEndMonth = endMonth ?? addYears(new Date(), 5);
  const resolvedStartMonth = startMonth ?? subYears(new Date(), 5);

  return (
    <DayPicker
      endMonth={resolvedEndMonth}
      startMonth={resolvedStartMonth}
      reverseYears
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      // for the root component
      className={cn(
        'group/calendar bg-background p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      classNames={{
        root: cn(defaultClassNames.root, 'w-fit'),
        months: cn(defaultClassNames.months, 'relative flex flex-col gap-4 md:flex-row'),
        month: cn(defaultClassNames.month, 'flex w-full flex-col gap-4'),
        nav: cn(defaultClassNames.nav, 'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1'),
        button_previous: cn(
          defaultClassNames.button_previous,
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) p-0 select-none aria-disabled:opacity-50',
        ),
        button_next: cn(
          defaultClassNames.button_next,
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) p-0 select-none aria-disabled:opacity-50',
        ),
        month_caption: cn(
          defaultClassNames.month_caption,
          'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)',
        ),
        dropdowns: cn(
          defaultClassNames.dropdowns,
          'flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium',
        ),
        dropdown_root: cn(
          defaultClassNames.dropdown_root,
          'relative rounded-md border border-input shadow-xs has-focus:border-ring has-focus:ring-[3px] has-focus:ring-ring/50',
        ),
        dropdown: cn(defaultClassNames.dropdown, 'absolute inset-0 bg-popover opacity-0'),
        caption_label: cn(
          defaultClassNames.caption_label,
          'font-medium select-none',
          captionLayout === 'label'
            ? 'text-sm'
            : 'flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground',
        ),
        table: 'w-full border-collapse',
        weekdays: cn(defaultClassNames.weekdays, 'flex'),
        weekday: cn(
          defaultClassNames.weekday,
          'flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none',
        ),
        week: cn(defaultClassNames.week, 'mt-2 flex w-full'),
        week_number_header: cn(defaultClassNames.week_number_header, 'w-(--cell-size) select-none'),
        week_number: cn(defaultClassNames.week_number, 'text-[0.8rem] text-muted-foreground select-none'),
        day: cn(defaultClassNames.day, 'group/day relative aspect-square h-full w-full p-0 text-center select-none'),
        range_start: cn(defaultClassNames.range_start, 'bg-accent'),
        range_middle: cn(defaultClassNames.range_middle, 'rounded-none'),
        range_end: cn(defaultClassNames.range_end, 'bg-accent'),
        today: cn(
          defaultClassNames.today,
          'rounded-md bg-accent text-accent-foreground data-[selected=true]:rounded-none',
        ),
        outside: cn(defaultClassNames.outside, 'text-muted-foreground aria-selected:text-muted-foreground'),
        disabled: cn(defaultClassNames.disabled, 'text-muted-foreground opacity-50'),
        hidden: cn(defaultClassNames.hidden, 'invisible'),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className={cn('size-4', className)} {...props} />;
          }

          if (orientation === 'right') {
            return <ChevronRightIcon className={cn('size-4', className)} {...props} />;
          }

          return <ChevronDownIcon className={cn('size-4', className)} {...props} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">{children}</div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

/**
 * Render a button for a specific day in the calendar.
 * @see https://daypicker.dev/guides/custom-components
 */
function CalendarDayButton({ className, day, modifiers, ...props }: DayButtonProps) {
  const defaultClassNames = getDefaultClassNames();

  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        defaultClassNames.day,
        // misc
        'flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal',
        'dark:hover:text-accent-foreground [&>span]:text-xs [&>span]:opacity-70',
        // focused
        'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50',
        // range-start
        'data-[range-start=true]:rounded-none data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground',
        // range-middle
        'data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground',
        // range-end
        'data-[range-end=true]:rounded-none data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground',
        // select-single
        'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
