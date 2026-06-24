import { HandHeart, MessageSquareQuote, Target } from 'lucide-react';
import type { PastoralBlockData, PastoralBlockKind } from './pastoralTypes';

const blockConfig = {
  reflection: { accent: 'border-red-800/70', icon: MessageSquareQuote, label: 'Reflection', surface: 'bg-[#fffaf0] dark:bg-zinc-950', title: 'text-red-800 dark:text-red-200' },
  prayer: { accent: 'border-lime-800/60 dark:border-lime-300/40', icon: HandHeart, label: 'Prayer', surface: 'bg-[#fbfaf5] dark:bg-zinc-950', title: 'text-lime-800 dark:text-lime-200' },
  application: { accent: 'border-amber-700/70 dark:border-amber-300/50', icon: Target, label: 'Application', surface: 'bg-[#fffaf5] dark:bg-zinc-950', title: 'text-amber-700 dark:text-amber-200' },
} as const;

const PastoralBlockView = ({ data, kind }: { data: PastoralBlockData; kind: PastoralBlockKind }) => {
  const config = blockConfig[kind];
  const Icon = config.icon;
  const contentClass = kind === 'prayer' ? 'italic' : '';

  return <section aria-label={`${config.label}${data.title ? `: ${data.title}` : ''}`} className={'my-8 rounded-2xl border border-black/10 px-6 py-6 shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:shadow-black/25 sm:px-8 ' + config.surface}><div className={'border-l-2 pl-5 ' + config.accent}><p className={'flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] ' + config.title}><Icon size={15} /> {config.label}</p>{kind === 'application' && data.title ? <p className={'mt-5 text-xs font-black uppercase tracking-[0.16em] ' + config.title}>{data.title}</p> : null}<p className={'mt-5 whitespace-pre-line font-serif text-2xl leading-10 sm:text-3xl ' + contentClass}>{data.content}</p>{kind !== 'application' && data.authorVoice ? <p className="mt-5 text-sm text-zinc-600 dark:text-stone-300">- {data.authorVoice}</p> : null}</div></section>;
};

export default PastoralBlockView;
