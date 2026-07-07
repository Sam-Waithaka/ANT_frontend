import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type PortalSelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

type PortalSelectProps = {
  ariaLabel?: string;
  className?: string;
  darkMode: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: PortalSelectOption[];
  placeholder?: string;
  value: string;
};

const sameValue = (left: string, right: string) => String(left) === String(right);

const PortalSelect = ({
  ariaLabel,
  className = '',
  darkMode,
  disabled = false,
  onChange,
  options,
  placeholder = 'Choose option',
  value,
}: PortalSelectProps) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => sameValue(option.value, value));

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      left: Math.max(12, rect.left),
      top: rect.bottom + 8,
      width: rect.width,
    });
  };

  const toggleOpen = () => {
    if (disabled) return;
    updatePosition();
    setOpen((current) => !current);
  };

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const reposition = () => updatePosition();

    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);

    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open]);

  const triggerClass = darkMode
    ? 'border-white/10 bg-[#141414] text-stone-100 hover:bg-white/10 focus:ring-red-800/30 disabled:text-stone-500'
    : 'border-[#eaded0] bg-white text-zinc-950 hover:bg-[#fffaf0] focus:ring-red-800/20 disabled:text-[#8a7d70]';
  const menuClass = darkMode
    ? 'border-white/10 bg-[#171717] text-stone-100 shadow-black/40'
    : 'border-[#eaded0] bg-white text-zinc-950 shadow-zinc-900/15';

  const menu = open && typeof document !== 'undefined' ? createPortal(
    <div
      className={`fixed z-50 max-h-72 overflow-y-auto rounded-2xl border p-1.5 shadow-xl ${menuClass}`}
      ref={menuRef}
      role="listbox"
      style={{ left: position.left, minWidth: position.width, top: position.top, width: position.width }}
    >
      {options.length ? options.map((option) => {
        const selected = sameValue(option.value, value);
        return (
          <button
            aria-selected={selected}
            className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${selected ? 'bg-red-800 text-white' : darkMode ? 'text-stone-200 hover:bg-white/10' : 'text-zinc-700 hover:bg-red-950/5'}`}
            disabled={option.disabled}
            key={option.value}
            onClick={() => {
              onChange(option.value);
              setOpen(false);
              triggerRef.current?.focus();
            }}
            role="option"
            type="button"
          >
            {option.label}
          </button>
        );
      }) : (
        <p className={darkMode ? 'px-3 py-2.5 text-sm font-bold text-stone-500' : 'px-3 py-2.5 text-sm font-bold text-[#786f66]'}>
          No options available
        </p>
      )}
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={`inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${triggerClass} ${className}`}
        disabled={disabled}
        onClick={toggleOpen}
        ref={triggerRef}
        type="button"
      >
        <span className={selectedOption ? 'truncate' : darkMode ? 'truncate text-stone-500' : 'truncate text-[#8a7d70]'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown aria-hidden="true" className={`size-4 shrink-0 text-red-800 transition dark:text-red-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {menu}
    </>
  );
};

export default PortalSelect;
