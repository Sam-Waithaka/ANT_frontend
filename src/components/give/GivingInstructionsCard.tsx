import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard } from '../../utils/copyToClipboard';

type GivingInstructionsCardProps = {
  darkMode: boolean;
};

const businessNumber = '4017369';
const businessName = 'AFRICA INLAND CHURCH NJORO';
const accountReasons = ['Tithe', 'Thanksgiving', 'Missions', 'Mercy Ministry', 'Other'];

const GivingInstructionsCard = ({ darkMode }: GivingInstructionsCardProps) => {
  const [copiedValue, setCopiedValue] = useState('');

  const handleCopy = async (value: string) => {
    const copied = await copyToClipboard(value);

    if (copied) {
      setCopiedValue(value);
      window.setTimeout(() => setCopiedValue(''), 1800);
    }
  };

  return (
    <section id="mpesa-paybill" className="px-4 pb-10 sm:px-6 sm:pb-14">
      <div className="mx-auto max-w-5xl">
        <div
          className={`overflow-hidden rounded-4xl border shadow-2xl backdrop-blur-xl ${
            darkMode
              ? 'border-white/10 bg-zinc-950/90 shadow-black/30'
              : 'border-white/50 bg-[#fffaf0]/95 shadow-red-950/15'
          }`}
        >
          <div className={`border-b p-6 sm:p-8 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-[#138a3d] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white">
                  M-PESA Available
                </span>
                <h2 className="mt-4 text-2xl font-extrabold tracking-normal sm:text-3xl">
                  Give through M-PESA Paybill
                </h2>
              </div>
              <p className={`max-w-sm text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                Please confirm the business name reads {businessName} before completing your transaction.
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_0.85fr]">
            <div className={`rounded-3xl border p-5 ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white/80'}`}>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">
                M-PESA Paybill
              </p>

              <div className="mt-6 grid gap-5">
                <div>
                  <p className={`text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                    Business Number
                  </p>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-4xl font-black leading-none tracking-normal sm:text-5xl">{businessNumber}</p>
                    <button
                      type="button"
                      onClick={() => handleCopy(businessNumber)}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${
                        darkMode
                          ? 'border-white/10 bg-white/10 text-stone-100 focus:ring-offset-zinc-950 hover:bg-white/15'
                          : 'border-black/10 bg-white text-zinc-900 shadow-sm focus:ring-offset-white hover:bg-[#fffaf0]'
                      }`}
                    >
                      {copiedValue === businessNumber ? <Check size={16} /> : <Copy size={16} />}
                      {copiedValue === businessNumber ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div>
                  <p className={`text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                    Business Name
                  </p>
                  <p className="mt-2 text-lg font-black leading-snug">{businessName}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-3xl border p-5 ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white/70'}`}>
              <p className="text-sm font-black text-red-800 dark:text-red-200">Account Number</p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-normal">Reason for giving</h3>
              <p className={`mt-3 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                Example: Tithe, Thanksgiving, Missions, Mercy Ministry
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {accountReasons.map((reason) => (
                  <span
                    key={reason}
                    className={`rounded-full border px-3 py-2 text-sm font-bold ${
                      darkMode
                        ? 'border-white/10 bg-zinc-900 text-stone-300'
                        : 'border-black/10 bg-[#f8f5ef] text-zinc-700'
                    }`}
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GivingInstructionsCard;
