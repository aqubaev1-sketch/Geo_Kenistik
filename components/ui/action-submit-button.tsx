'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { useFormStatus } from 'react-dom';

type ActionSubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  successLabel?: string;
  className?: string;
  disabled?: boolean;
  describedBy?: string;
  icon?: ReactNode;
  formAction?: (formData: FormData) => void | Promise<void>;
};

export function ActionSubmitButton({
  label,
  pendingLabel = 'Сақталуда...',
  successLabel = 'Сақталды',
  className = '',
  disabled = false,
  describedBy,
  icon,
  formAction,
}: ActionSubmitButtonProps) {
  const { pending, action } = useFormStatus();
  const isPending = pending && (!formAction || action === formAction);
  const [confirmed, setConfirmed] = useState(false);
  const submitted = useRef(false);

  useEffect(() => {
    if (isPending) {
      submitted.current = true;
      setConfirmed(false);
      return;
    }
    if (!submitted.current) return;
    submitted.current = false;
    setConfirmed(true);
    const timer = window.setTimeout(() => setConfirmed(false), 2200);
    return () => window.clearTimeout(timer);
  }, [isPending]);

  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={disabled || pending}
      aria-busy={isPending}
      aria-describedby={describedBy}
      className={`${className} transition-[background-color,color,transform,opacity] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${confirmed ? '!bg-emerald-600 !text-white' : ''}`}
    >
      {isPending ? <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" /> : null}
      {confirmed ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      {!isPending && !confirmed ? icon : null}
      <span aria-live="polite">{isPending ? pendingLabel : confirmed ? successLabel : label}</span>
    </button>
  );
}
