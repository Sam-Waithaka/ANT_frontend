type ScriptureSelectOption = {
  id: string;
  label: string;
};

type ScriptureSelectProps = {
  disabled?: boolean;
  label: string;
  options: ScriptureSelectOption[];
  value: string;
  onChange: (value: string) => void;
};

const ScriptureSelect = ({ disabled, label, options, value, onChange }: ScriptureSelectProps) => (
  <label className="grid gap-1.5">
    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled || options.length === 0}
      className="h-10 w-full rounded-full border border-black/10 bg-white px-3 text-xs font-bold text-zinc-950 shadow-sm outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-800/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-stone-100 dark:focus:border-red-300 sm:text-sm"
    >
      {options.length === 0 ? (
        <option value="">No options available</option>
      ) : (
        options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))
      )}
    </select>
  </label>
);

export default ScriptureSelect;
