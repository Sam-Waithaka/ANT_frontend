export const portalSurface = {
  page: (darkMode: boolean) => darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f1e7] text-zinc-950',
  nav: (darkMode: boolean) => darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25' : 'border-[#eaded0] bg-[#fffaf0] shadow-zinc-900/5',
  panel: (darkMode: boolean) => darkMode ? 'border-white/10 bg-zinc-950 text-stone-100 shadow-black/25' : 'border-[#eaded0] bg-[#fffaf0] text-zinc-950 shadow-zinc-900/5',
  card: (darkMode: boolean) => darkMode ? 'border-white/10 bg-[#171717] text-stone-100 shadow-black/25 hover:bg-white/[0.04]' : 'border-[#eaded0] bg-white text-zinc-950 shadow-zinc-900/5 hover:bg-[#fffaf0]',
  input: (darkMode: boolean) => darkMode ? 'border-white/10 bg-[#171717] text-stone-100 placeholder:text-stone-500' : 'border-[#eaded0] bg-white text-zinc-950 placeholder:text-[#8a7d70]',
  toolbar: (darkMode: boolean) => darkMode ? 'border-white/10 bg-[#171717] text-stone-100' : 'border-[#eaded0] bg-[#fcfaf6] text-zinc-950',
  mutedSurface: (darkMode: boolean) => darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-[#eaded0] bg-[#fffaf0]',
  iconBadge: (darkMode: boolean) => darkMode ? 'bg-white/10 text-red-100' : 'bg-[#fffaf0] text-red-800 ring-1 ring-red-900/10',
  mutedText: (darkMode: boolean) => darkMode ? 'text-stone-300' : 'text-[#5f574f]',
  softMutedText: (darkMode: boolean) => darkMode ? 'text-stone-400' : 'text-[#786f66]',
};
