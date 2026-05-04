type ScriptureStatusProps = {
  darkMode: boolean;
  message: string;
  title: string;
  tone?: 'error' | 'neutral';
};

const ScriptureStatus = ({ darkMode, message, title, tone = 'neutral' }: ScriptureStatusProps) => {
  const isError = tone === 'error';

  return (
    <div
      className={`rounded-[2rem] border p-8 text-center shadow-sm ${
        isError
          ? darkMode
            ? 'border-red-300/20 bg-red-950/25 text-red-100'
            : 'border-red-900/15 bg-red-50 text-red-950'
          : darkMode
            ? 'border-white/10 bg-white/[0.055] text-stone-300'
            : 'border-black/10 bg-white text-zinc-600'
      }`}
      role={isError ? 'alert' : 'status'}
    >
      <p className="text-xs font-black uppercase tracking-[0.16em]">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6">{message}</p>
    </div>
  );
};

export default ScriptureStatus;
