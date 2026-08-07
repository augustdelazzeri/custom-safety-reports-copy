// import { WritingAssistantModal } from '@/components/composite/writing-assistant-confirmation-modal';
const WritingAssistantModal = (_props: any) => null;
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
// import { WRITING_TONES, WritingTone } from '@shared/types/ai.types';
const WRITING_TONES = [] as any[];
type WritingTone = string;
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import { ChangeEvent, ChangeEventHandler, FocusEventHandler, useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
const useTranslation = () => ({ t: (k: string, ..._args: any[]) => k });
import { toast } from 'sonner';

export const WritingAssistant = ({
  placeholder,
  context,
  className,
  disabled = false,
  value,
  onChange,
  onFocus,
  ref,
  ...props
}: {
  placeholder?: string;
  context: string;
  className?: string;
  disabled?: boolean;
  value?: string | null;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  onFocus?: FocusEventHandler<HTMLTextAreaElement>;
  ref?: React.RefCallback<HTMLTextAreaElement>;
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState<WritingTone>('professional');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  useEffect(() => {
    if (disabled) setIsPopoverOpen(false);
  }, [disabled]);

  const handleImprove = () => {
    if (disabled || !value?.trim()) {
      toast.error(t('composite.writingAssistant.toast.noText'), {
        description: t('composite.writingAssistant.toast.noTextDescription'),
      });
      return;
    }
    setIsPopoverOpen(false);
    setIsModalOpen(true);
  };

  const hasText = !!value?.trim();

  return (
    <>
      <div className="relative">
        <Textarea
          placeholder={placeholder}
          className={cn('min-h-24 resize-y', className)}
          value={value ?? ''}
          disabled={disabled}
          onChange={onChange}
          onFocus={onFocus}
          ref={ref}
          {...props}
        />
        <div className="absolute right-2 bottom-2">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || !hasText}
                className={cn('h-8 gap-1 border-gray-300 bg-white/90 px-2 text-xs shadow-sm hover:bg-white')}
              >
                <Sparkles className="h-3 w-3" />
                <span className="text-xs">{t('composite.writingAssistant.writingAssist')}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" side="top" className="w-72 p-0">
              <div className="px-3 py-2">
                <Label className="text-xs text-muted-foreground">{t('composite.writingAssistant.writingTone')}</Label>
              </div>
              <Separator />
              <div className="max-h-60 overflow-y-auto py-1">
                {WRITING_TONES.map((tone) => (
                  <Button
                    key={tone.value}
                    type="button"
                    variant="ghost"
                    disabled={disabled}
                    onClick={() => setSelectedTone(tone.value)}
                    className={cn(
                      'flex h-auto w-full items-start justify-start gap-2 rounded-none px-3 py-2',
                      selectedTone === tone.value && 'bg-accent/50',
                    )}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center pt-0.5">
                      {selectedTone === tone.value && <Check className="h-3.5 w-3.5 text-primary" />}
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block text-sm font-medium">
                        {t(`enums.writingTone.${tone.value}`, { defaultValue: tone.value?.replaceAll('_', ' ') ?? '' })}
                      </span>
                    </span>
                  </Button>
                ))}
              </div>
              <Separator />
              <div className="px-3 py-2">
                <Label htmlFor="writing-assist-instructions" className="mb-1.5 text-xs text-muted-foreground">
                  {t('composite.writingAssistant.additionalInstructions')}
                </Label>
                <Textarea
                  id="writing-assist-instructions"
                  value={additionalInstructions}
                  disabled={disabled}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder={t('composite.writingAssistant.instructionsPlaceholder')}
                  className="h-8 text-xs"
                  maxLength={500}
                />
              </div>
              <Separator />
              <div className="px-3 py-2">
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  onClick={handleImprove}
                  disabled={disabled || !hasText}
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  {t('composite.writingAssistant.improveText')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <WritingAssistantModal
        text={value ?? ''}
        context={context}
        tone={selectedTone}
        additionalInstructions={additionalInstructions || undefined}
         onReplace={(improvedText: any) => onChange({ target: { value: improvedText } } as ChangeEvent<HTMLTextAreaElement>)}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};
