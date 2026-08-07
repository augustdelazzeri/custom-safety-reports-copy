import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, ChevronDown } from 'lucide-react';
import { useState } from 'react';

type AsyncLocationsFilterProps = {
  selected: string[];
  onSelect: (ids: string[]) => void;
  label: string;
  placeholder: string;
};

export const AsyncLocationsFilter = ({ selected, onSelect, label, placeholder }: AsyncLocationsFilterProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="justify-start gap-2">
          <MapPin className="size-4" />
          <span>{selected.length > 0 ? `${selected.length} selected` : label}</span>
          <ChevronDown className="size-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <p className="text-xs text-muted-foreground mb-2">{placeholder}</p>
        <div className="flex flex-col gap-1">
          {['Location 1', 'Location 2', 'Location 3'].map((loc, i) => (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                const id = (i + 1).toString();
                if (selected.includes(id)) {
                  onSelect(selected.filter(s => s !== id));
                } else {
                  onSelect([...selected, id]);
                }
              }}
            >
              {loc}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
