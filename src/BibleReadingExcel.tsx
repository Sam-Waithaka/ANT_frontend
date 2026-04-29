import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookMarked,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Download,
  Moon,
  Search,
  Sparkles,
  Sun,
} from 'lucide-react';

type TestamentFilter = 'both' | 'old' | 'new';

type ReadingItem = {
  day: string;
  dayIndex: number;
  oldTestament: string;
  newTestament: string;
  searchable: string;
};

const readingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const getWeekOfYear = (date = new Date()) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;
  return Math.min(52, Math.max(1, Math.ceil((dayOfYear + startOfYear.getDay()) / 7)));
};

const getCurrentReadingTarget = (date = new Date()) => {
  const calendarWeek = getWeekOfYear(date);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayIndex = isWeekend ? 4 : Math.max(0, dayOfWeek - 1);

  return {
    week: isWeekend ? Math.max(1, calendarWeek - 1) : calendarWeek,
    dayIndex,
    day: readingDays[dayIndex],
    isWeekendCarryover: isWeekend,
  };
};

const splitReading = (reading: string): Omit<ReadingItem, 'day' | 'dayIndex' | 'searchable'> => {
  const [oldTestament = '', newTestament = ''] = reading.split('|').map((part) => part.trim());
  return { oldTestament, newTestament };
};

const readings: Record<number, string[]> = {
  1: ['Gen 1-3 | Matt 1', 'Gen 4-8 | Matt 2', 'Gen 9-12 | Matt 3', 'Gen 13-16 | Matt 4', 'Gen 17-19 | Matt 5'],
  2: ['Gen 20-23 | Matt 6', 'Gen 24-25 | Matt 7', 'Gen 26-27 | Matt 8', 'Gen 28-30 | Matt 9', 'Gen 31-33 | Matt 10'],
  3: ['Gen 34-36 | Matt 11', 'Gen 37-39 | Matt 12', 'Gen 40-41 | Matt 13', 'Gen 42-44 | Matt 14', 'Gen 45-47 | Matt 15'],
  4: ['Gen 48-50 | Matt 16', 'Exod 1-4 | Matt 17', 'Exod 5-7 | Matt 18', 'Exod 8-10 | Matt 19', 'Exod 11-12 | Matt 20'],
  5: ['Exod 13-15 | Matt 21', 'Exod 16-19 | Matt 22', 'Exod 20-22 | Matt 23', 'Exod 23-25 | Matt 24', 'Exod 26-28 | Matt 25'],
  6: ['Exod 29-30 | Matt 26', 'Exod 31-33 | Matt 27', 'Exod 34-35 | Matt 28', 'Exod 36-38 | Mark 1', 'Exod 39-40; Lev 1-2 | Mark 2'],
  7: ['Lev 3-5 | Mark 3', 'Lev 6-7 | Mark 4', 'Lev 8-10 | Mark 5', 'Lev 11-13 | Mark 6', 'Lev 14 | Mark 7'],
  8: ['Lev 15-17 | Mark 8', 'Lev 18-20 | Mark 9', 'Lev 21-23 | Mark 10', 'Lev 24-25 | Mark 11', 'Lev 26-27 | Mark 12'],
  9: ['Num 1-2 | Mark 13', 'Num 3-4 | Mark 14', 'Num 5-6 | Mark 15', 'Num 7-9 | Mark 16', 'Num 10-12 | Luke 1'],
  10: ['Num 13-14 | Luke 2', 'Num 15-17 | Luke 3', 'Num 18-20 | Luke 4', 'Num 21-22 | Luke 5', 'Num 23-25 | Luke 6'],
  11: ['Num 26-28 | Luke 7', 'Num 29-31 | Luke 8', 'Num 32-33 | Luke 9', 'Num 34-36 | Luke 10', 'Deut 1-2 | Luke 11'],
  12: ['Deut 3-4 | Luke 12', 'Deut 5-7 | Luke 13', 'Deut 8-10 | Luke 14', 'Deut 11-13 | Luke 15', 'Deut 14-16 | Luke 16'],
  13: ['Deut 17-20 | Luke 17', 'Deut 21-23 | Luke 18', 'Deut 24-27 | Luke 19', 'Deut 28 | Luke 20', 'Deut 29-31 | Luke 21'],
  14: ['Deut 32-33 | Luke 22', 'Deut 34; Josh 1-3 | Luke 23', 'Josh 4-6 | Luke 24', 'Josh 7-9 | John 1', 'Josh 10-11 | John 2'],
  15: ['Josh 12-15 | John 3', 'Josh 16-18 | John 4', 'Josh 19-21 | John 5', 'Josh 22-24 | John 6', 'Judg 1-3 | John 7'],
  16: ['Judg 4-5 | John 8', 'Judg 6-8 | John 9', 'Judg 9-10 | John 10', 'Judg 11-13 | John 11', 'Judg 14-16 | John 12'],
  17: ['Judg 17-19 | John 13', 'Judg 20-21 | John 14', 'Ruth 1-3 | John 15', 'Ruth 4; 1 Sam 1-2 | John 16', '1 Sam 3-6 | John 17'],
  18: ['1 Sam 7-9 | John 18', '1 Sam 10-13 | John 19', '1 Sam 14-15 | John 20', '1 Sam 16-17 | John 21', '1 Sam 18-19 | Acts 1'],
  19: ['1 Sam 20-22 | Acts 2', '1 Sam 23-25 | Acts 3', '1 Sam 26-28 | Acts 4', '1 Sam 29-31; 2 Sam 1 | Acts 5', '2 Sam 2-3 | Acts 6'],
  20: ['2 Sam 4-7 | Acts 7', '2 Sam 8-11 | Acts 8', '2 Sam 12-13 | Acts 9', '2 Sam 14-15 | Acts 10', '2 Sam 16-18 | Acts 11'],
  21: ['2 Sam 19-20 | Acts 12', '2 Sam 21-22 | Acts 13', '2 Sam 23-24; 1 Kgs 1 | Acts 14', '1 Kgs 2 | Acts 15', '1 Kgs 3-6 | Acts 16'],
  22: ['1 Kgs 7 | Acts 17', '1 Kgs 8-9 | Acts 18', '1 Kgs 10-11 | Acts 19', '1 Kgs 12-13 | Acts 20', '1 Kgs 14-16 | Acts 21'],
  23: ['1 Kgs 17-18 | Acts 22', '1 Kgs 19-20 | Acts 23', '1 Kgs 21-22 | Acts 24', '2 Kgs 1-3 | Acts 25', '2 Kgs 4-5 | Acts 26'],
  24: ['2 Kgs 6-8 | Acts 27', '2 Kgs 9-10 | Acts 28', '2 Kgs 11-13 | Rom 1', '2 Kgs 14-15 | Rom 2', '2 Kgs 16-17 | Rom 3'],
  25: ['2 Kgs 18-20 | Rom 4', '2 Kgs 21-22 | Rom 5', '2 Kgs 23-25 | Rom 6', '1 Chr 1-3 | Rom 7', '1 Chr 4-6 | Rom 8'],
  26: ['1 Chr 7-9 | Rom 9', '1 Chr 10-12 | Rom 10', '1 Chr 13-16 | Rom 11', '1 Chr 17-20 | Rom 12', '1 Chr 21-23 | Rom 13'],
  27: ['1 Chr 24-27 | Rom 14', '1 Chr 28-29; 2 Chr 1 | Rom 15', '2 Chr 2-5 | Rom 16', '2 Chr 6-7 | 1 Cor 1', '2 Chr 8-11 | 1 Cor 2'],
  28: ['2 Chr 12-16 | 1 Cor 3', '2 Chr 17-19 | 1 Cor 4', '2 Chr 20-23 | 1 Cor 5', '2 Chr 24-25 | 1 Cor 6', '2 Chr 26-28 | 1 Cor 7'],
  29: ['2 Chr 29-31 | 1 Cor 8', '2 Chr 32-33 | 1 Cor 9', '2 Chr 34-36 | 1 Cor 10', 'Ezra 1-4 | 1 Cor 11', 'Ezra 5-7 | 1 Cor 12'],
  30: ['Ezra 8-10 | 1 Cor 13', 'Neh 1-3 | 1 Cor 14', 'Neh 4-6 | 1 Cor 15', 'Neh 7-9 | 1 Cor 16', 'Neh 10-11 | 2 Cor 1'],
  31: ['Neh 12-13; Est 1 | 2 Cor 2', 'Est 2-5 | 2 Cor 3', 'Est 6-9 | 2 Cor 4', 'Est 10; Job 1-5 | 2 Cor 5', 'Job 6-10 | 2 Cor 6'],
  32: ['Job 11-16 | 2 Cor 7', 'Job 17-21 | 2 Cor 8', 'Job 22-28 | 2 Cor 9', 'Job 29-32 | 2 Cor 10', 'Job 33-37 | 2 Cor 11'],
  33: ['Job 38-42; Ps 1 | 2 Cor 12', 'Ps 2-11 | 2 Cor 13', 'Ps 12-20 | Gal 1', 'Ps 21-29 | Gal 2', 'Ps 30-35 | Gal 3'],
  34: ['Ps 36-42 | Gal 4', 'Ps 43-50 | Gal 5', 'Ps 51-59 | Gal 6', 'Ps 60-68 | Eph 1', 'Ps 69-73 | Eph 2'],
  35: ['Ps 74-79 | Eph 3', 'Ps 80-88 | Eph 4', 'Ps 89-95 | Eph 5', 'Ps 96-104 | Eph 6', 'Ps 105-108 | Phil 1'],
  36: ['Ps 109-118 | Phil 2', 'Ps 119 | Phil 3', 'Ps 120-136 | Phil 4', 'Ps 137-146 | Col 1', 'Ps 147-150; Prov 1-3 | Col 2'],
  37: ['Prov 4-9 | Col 3', 'Prov 10-14 | Col 4', 'Prov 15-18 | 1 Thess 1', 'Prov 19-23 | 1 Thess 2', 'Prov 24-28 | 1 Thess 3'],
  38: ['Prov 29-31; Ecc 1 | 1 Thess 4', 'Ecc 2-6 | 1 Thess 5', 'Ecc 7-11 | 2 Thess 1', 'Ecc 12; Song 1-6 | 2 Thess 2', 'Song 7-8; Isa 1-3 | 2 Thess 3'],
  39: ['Isa 4-7 | 1 Tim 1', 'Isa 8-11 | 1 Tim 2', 'Isa 12-16 | 1 Tim 3', 'Isa 17-21 | 1 Tim 4', 'Isa 22-26 | 1 Tim 5'],
  40: ['Isa 27-29 | 1 Tim 6', 'Isa 30-34 | 2 Tim 1', 'Isa 35-37 | 2 Tim 2', 'Isa 38-41 | 2 Tim 3', 'Isa 42-44 | 2 Tim 4'],
  41: ['Isa 45-48 | Titus 1', 'Isa 49-52 | Titus 2', 'Isa 53-57 | Titus 3', 'Isa 58-62 | Philemon', 'Isa 63-66 | Heb 1'],
  42: ['Jer 1-3 | Heb 2', 'Jer 4-5 | Heb 3', 'Jer 6-8 | Heb 4', 'Jer 9-11 | Heb 5', 'Jer 12-15 | Heb 6'],
  43: ['Jer 16-18 | Heb 7', 'Jer 19-22 | Heb 8', 'Jer 23-25 | Heb 9', 'Jer 26-27 | Heb 10', 'Jer 28-30 | Heb 11'],
  44: ['Jer 31-32 | Heb 12', 'Jer 33-35 | Heb 13', 'Jer 36-37 | James 1', 'Jer 38-41 | James 2', 'Jer 42-44 | James 3'],
  45: ['Jer 45-48 | James 4', 'Jer 49-50 | James 5', 'Jer 51 | 1 Pet 1', 'Jer 52; Lam 1 | 1 Pet 2', 'Lam 2-5 | 1 Pet 3'],
  46: ['Ezek 1-3 | 1 Pet 4', 'Ezek 4-7 | 1 Pet 5', 'Ezek 8-11 | 2 Pet 1', 'Ezek 12-14 | 2 Pet 2', 'Ezek 15-16 | 2 Pet 3'],
  47: ['Ezek 17-19 | 1 John 1', 'Ezek 20-21 | 1 John 2', 'Ezek 22-24 | 1 John 3', 'Ezek 25-27 | 1 John 4', 'Ezek 28-30 | 1 John 5'],
  48: ['Ezek 31-32 | 2 John', 'Ezek 33-35 | 3 John', 'Ezek 36-38 | Jude', 'Ezek 39-40 | Rev 1', 'Ezek 41-43 | Rev 2'],
  49: ['Ezek 44-45 | Rev 3', 'Ezek 46-48 | Rev 4', 'Dan 1-2 | Rev 5', 'Dan 3-4 | Rev 6', 'Dan 5-6 | Rev 7'],
  50: ['Dan 7-9 | Rev 8', 'Dan 10-11 | Rev 9', 'Dan 12; Hos 1-4 | Rev 10', 'Hos 5-10 | Rev 11', 'Hos 11-14; Joel 1-2 | Rev 12'],
  51: ['Joel 3; Amos 1-4 | Rev 13', 'Amos 5-8 | Rev 14', 'Amos 9; Obad; Jonah 1-4 | Rev 15', 'Micah 1-6 | Rev 16', 'Micah 7; Nah 1-3; Hab 1 | Rev 17'],
  52: ['Hab 2-3; Zeph 1-3 | Rev 18', 'Hag 1-2; Zech 1-2 | Rev 19', 'Zech 3-8 | Rev 20', 'Zech 9-13 | Rev 21', 'Zech 14; Mal 1-4 | Rev 22'],
};

const BibleReadingExcel = () => {
  const [status, setStatus] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('aic-theme') === 'dark');
  const readingTarget = useMemo(() => getCurrentReadingTarget(), []);
  const [activeWeek, setActiveWeek] = useState(() => readingTarget.week);
  const [activeFilter, setActiveFilter] = useState<TestamentFilter>('both');
  const [searchTerm, setSearchTerm] = useState('');
  const currentWeek = readingTarget.week;
  const currentWeekRef = useRef<HTMLElement | null>(null);

  const weeks = useMemo(
    () =>
      Object.entries(readings).map(([weekKey, weekReadings]) => {
        const week = Number(weekKey);
        const items = weekReadings.map((reading, index) => {
          const parts = splitReading(reading);
          return {
            day: readingDays[index],
            dayIndex: index,
            ...parts,
            searchable: `${parts.oldTestament} ${parts.newTestament}`.toLowerCase(),
          };
        });

        return {
          week,
          label: `Week ${week}`,
          isCurrent: week === currentWeek,
          items,
        };
      }),
    [currentWeek],
  );

  const filteredWeeks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return weeks
      .map((week) => {
        const items = week.items.filter((item) => {
          const matchesSearch = !query || item.searchable.includes(query);
          const matchesFilter =
            activeFilter === 'both' ||
            (activeFilter === 'old' && item.oldTestament) ||
            (activeFilter === 'new' && item.newTestament);

          return matchesSearch && matchesFilter;
        });

        return { ...week, items };
      })
      .filter((week) => week.items.length > 0);
  }, [activeFilter, searchTerm, weeks]);

  const yearProgress = Math.round((currentWeek / 52) * 100);

  useEffect(() => {
    localStorage.setItem('aic-theme', darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      currentWeekRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      currentWeekRef.current?.focus({ preventScroll: true });
    }, 450);

    return () => window.clearTimeout(timer);
  }, []);

  const jumpToCurrentWeek = () => {
    setActiveWeek(currentWeek);
    window.setTimeout(() => {
      currentWeekRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      currentWeekRef.current?.focus({ preventScroll: true });
    }, 50);
  };

  const changeFilter = (filter: TestamentFilter) => {
    setActiveFilter(filter);
    setActiveWeek(currentWeek);
    window.setTimeout(() => {
      currentWeekRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      currentWeekRef.current?.focus({ preventScroll: true });
    }, 50);
  };

  const generateExcel = () => {
    setStatus('Generating CSV file...');

    try {
      const bom = '\uFEFF';
      let csvContent = `${bom}Week,Monday,Tuesday,Wednesday,Thursday,Friday\n`;

      for (let week = 1; week <= 52; week++) {
        const row = [`Week ${week}`, ...readings[week]];
        const escapedRow = row.map((cell) => {
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        });
        csvContent += `${escapedRow.join(',')}\n`;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', 'AIC-Njoro-Town-52-Week-Bible-Reading-Plan.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus('CSV file downloaded successfully.');
      window.setTimeout(() => setStatus(''), 4000);
    } catch (error) {
      setStatus('Error generating file. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <header className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors duration-300 ${darkMode ? 'border-white/10 bg-black/75' : 'border-black/10 bg-[#f8f5ef]/85'}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`grid size-12 shrink-0 place-items-center rounded-2xl border text-xs font-black tracking-[0.18em] shadow-sm ${darkMode ? 'border-red-400/30 bg-white/5 text-red-200' : 'border-red-900/15 bg-white text-red-900'}`} aria-label="AIC Njoro Town logo placeholder">
              AIC
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold uppercase tracking-[0.16em]">AIC Njoro Town</p>
              <p className={`truncate text-xs ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>Logo placeholder</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode((current) => !current)}
            className={`grid size-11 shrink-0 place-items-center rounded-full border transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${darkMode ? 'border-white/10 bg-white/10 text-amber-200 focus:ring-offset-black' : 'border-black/10 bg-white text-zinc-900 shadow-sm focus:ring-offset-[#f8f5ef]'}`}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main>
        <section className="relative px-4 pb-10 pt-8 sm:px-6 sm:pb-14 lg:pt-12">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className={`h-full ${darkMode ? 'bg-[radial-gradient(circle_at_top_left,rgba(185,28,28,0.30),transparent_34%),linear-gradient(135deg,#080808,#171717_55%,#260b0b)]' : 'bg-[radial-gradient(circle_at_top_left,rgba(153,27,27,0.16),transparent_35%),linear-gradient(135deg,#fffaf0,#f8f5ef_50%,#ece7de)]'}`} />
          </div>

          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="pt-4 sm:pt-8">
              <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] ${darkMode ? 'border-red-300/20 bg-red-950/30 text-red-100' : 'border-red-900/15 bg-white/70 text-red-950'}`}>
                <Sparkles size={14} />
                AIC Njoro Town
              </div>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-normal sm:text-6xl lg:text-7xl">Project 52</h1>
              <p className={`mt-5 max-w-2xl text-lg leading-8 sm:text-xl ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>Read through the Bible week by week with our church community across 52 intentional weeks.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button onClick={jumpToCurrentWeek} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-800 px-6 py-3 font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2">
                  <CalendarDays size={19} />
                  Today / Current Week
                </button>
                <button onClick={generateExcel} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-6 py-3 font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${darkMode ? 'border-white/15 bg-white/10 text-white hover:bg-white/15 focus:ring-offset-black' : 'border-black/10 bg-white text-zinc-950 shadow-sm hover:bg-zinc-50 focus:ring-offset-[#f8f5ef]'}`}>
                  <Download size={19} />
                  Download plan
                </button>
              </div>
              {status && (
                <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${darkMode ? 'border-emerald-300/20 bg-emerald-950/30 text-emerald-100' : 'border-emerald-700/20 bg-emerald-50 text-emerald-900'}`} role="status">
                  {status}
                </p>
              )}
            </div>

            <aside className={`rounded-[2rem] border p-5 shadow-2xl sm:p-6 ${darkMode ? 'border-white/10 bg-zinc-950/70 shadow-black/40' : 'border-white bg-white/85 shadow-zinc-900/10'}`} aria-label="Reading plan progress">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className={`text-sm font-bold uppercase tracking-[0.16em] ${darkMode ? 'text-red-200' : 'text-red-900'}`}>Active Bible tool</p>
                  <h2 className="mt-2 text-2xl font-black">52-Week Reading Plan</h2>
                </div>
                <BookMarked className={darkMode ? 'text-red-200' : 'text-red-800'} size={34} />
              </div>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm font-semibold">
                  <span>Week {currentWeek} of 52</span>
                  <span>{yearProgress}%</span>
                </div>
                <div className={`h-3 overflow-hidden rounded-full ${darkMode ? 'bg-white/10' : 'bg-zinc-200'}`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-red-900 via-red-700 to-black transition-all duration-700" style={{ width: `${yearProgress}%` }} />
                </div>
              </div>
              <div className={`mt-6 grid gap-3 text-sm ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
                <div className="flex items-center gap-2"><CheckCircle2 size={18} className={darkMode ? 'text-red-200' : 'text-red-800'} />5 readings each week</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={18} className={darkMode ? 'text-red-200' : 'text-red-800'} />Old and New Testament side by side</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={18} className={darkMode ? 'text-red-200' : 'text-red-800'} />Current reading opens automatically</div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className={darkMode ? 'text-red-200' : 'text-red-800'} />
                  {readingTarget.isWeekendCarryover ? 'Weekend shows previous Friday' : `${readingTarget.day} is highlighted`}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6 sm:py-12" aria-labelledby="reading-plan-heading">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={`text-sm font-bold uppercase tracking-[0.16em] ${darkMode ? 'text-red-200' : 'text-red-900'}`}>Bible reading plan</p>
                <h2 id="reading-plan-heading" className="mt-2 text-3xl font-black sm:text-4xl">Weekly readings</h2>
                <p className={`mt-2 text-sm ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                  Scroll inside the plan to browse all 52 weeks.
                </p>
              </div>
              <div className={`relative rounded-full border ${darkMode ? 'border-white/10 bg-white/10' : 'border-black/10 bg-white shadow-sm'}`}>
                <Search className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`} size={18} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by book"
                  className={`h-12 w-full rounded-full bg-transparent pl-11 pr-4 text-base outline-none placeholder:text-sm sm:w-72 ${darkMode ? 'text-white placeholder:text-stone-500' : 'text-zinc-950 placeholder:text-zinc-500'}`}
                  type="search"
                />
              </div>
            </div>

            <div className={`sticky top-[73px] z-20 mb-6 grid grid-cols-3 gap-1 rounded-full border p-1 shadow-sm backdrop-blur-xl ${darkMode ? 'border-white/10 bg-black/75' : 'border-black/10 bg-[#f8f5ef]/90'}`} role="tablist" aria-label="Filter readings by testament">
              {[
                ['both', 'Both'],
                ['old', 'Old Testament'],
                ['new', 'New Testament'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => changeFilter(value as TestamentFilter)}
                  className={`min-h-11 rounded-full px-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-red-700 ${activeFilter === value ? 'bg-red-800 text-white shadow-md shadow-red-950/20' : darkMode ? 'text-stone-300 hover:bg-white/10' : 'text-zinc-700 hover:bg-white'}`}
                  role="tab"
                  aria-selected={activeFilter === value}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className={`max-h-[72vh] overflow-y-auto rounded-[2rem] border p-2 pr-1 shadow-inner sm:max-h-[680px] sm:p-3 ${darkMode ? 'border-white/10 bg-black/20' : 'border-black/10 bg-white/45'}`}>
              <div className="grid gap-4 pr-1">
              {filteredWeeks.length === 0 ? (
                <div className={`rounded-3xl border p-8 text-center ${darkMode ? 'border-white/10 bg-white/5 text-stone-300' : 'border-black/10 bg-white text-zinc-600'}`}>
                  No readings match that search. Try a book name like John, Psalms, or Romans.
                </div>
              ) : (
                filteredWeeks.map((week) => {
                  const isActive = activeWeek === week.week;

                  return (
                    <article
                      key={week.week}
                      ref={week.isCurrent ? currentWeekRef : null}
                      tabIndex={week.isCurrent ? -1 : undefined}
                      className={`scroll-mt-32 rounded-[1.75rem] border p-4 shadow-sm transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-700 sm:p-5 ${week.isCurrent ? darkMode ? 'border-red-300/45 bg-red-950/25 shadow-red-950/20' : 'border-red-800/30 bg-red-50 shadow-red-950/10' : darkMode ? 'border-white/10 bg-white/[0.055] hover:bg-white/[0.075]' : 'border-black/10 bg-white hover:shadow-lg'}`}
                    >
                      <button onClick={() => setActiveWeek(isActive ? 0 : week.week)} className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={isActive}>
                        <span>
                          <span className={`text-xs font-black uppercase tracking-[0.16em] ${week.isCurrent ? darkMode ? 'text-red-200' : 'text-red-700' : darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>
                            {week.isCurrent ? 'Current week' : 'Reading week'}
                          </span>
                          <span className="mt-1 block text-2xl font-black">{week.label}</span>
                        </span>
                        <ChevronRight className={`shrink-0 transition ${isActive ? 'rotate-90' : ''}`} size={22} />
                      </button>

                      {isActive && (
                        <div className="mt-5 grid gap-3">
                          {week.items.map((item) => {
                            const isCurrentReading = week.isCurrent && item.dayIndex === readingTarget.dayIndex;

                            return (
                            <div key={`${week.week}-${item.day}`} className={`grid gap-3 rounded-3xl sm:grid-cols-2 ${isCurrentReading ? 'ring-2 ring-red-700/70 ring-offset-2 ring-offset-transparent' : ''}`}>
                              {(activeFilter === 'both' || activeFilter === 'old') && (
                                <div className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${isCurrentReading ? darkMode ? 'border-red-200/60 bg-red-950/45 shadow-lg shadow-red-950/25' : 'border-red-800/35 bg-white shadow-lg shadow-red-950/10' : darkMode ? 'border-red-300/20 bg-black/30' : 'border-red-900/15 bg-[#fffaf4]'}`}>
                                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${isCurrentReading ? 'bg-red-800 text-white' : darkMode ? 'bg-red-300/10 text-red-100' : 'bg-red-900/10 text-red-950'}`}>OT / {item.day}</span>
                                  <p className="mt-3 text-lg font-extrabold leading-snug">{item.oldTestament}</p>
                                </div>
                              )}
                              {(activeFilter === 'both' || activeFilter === 'new') && (
                                <div className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${isCurrentReading ? darkMode ? 'border-red-200/60 bg-white/15 shadow-lg shadow-red-950/25' : 'border-red-800/35 bg-zinc-950 text-white shadow-lg shadow-red-950/10' : darkMode ? 'border-white/15 bg-white/10' : 'border-zinc-900/10 bg-zinc-50'}`}>
                                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${isCurrentReading ? darkMode ? 'bg-red-800 text-white' : 'bg-white text-red-900' : darkMode ? 'bg-white/10 text-stone-100' : 'bg-zinc-950 text-white'}`}>NT / {item.day}</span>
                                  <p className="mt-3 text-lg font-extrabold leading-snug">{item.newTestament}</p>
                                </div>
                              )}
                            </div>
                            );
                          })}
                        </div>
                      )}
                    </article>
                  );
                })
              )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={`border-t px-4 py-8 text-center text-sm sm:px-6 ${darkMode ? 'border-white/10 text-stone-400' : 'border-black/10 text-zinc-600'}`}>
        <p>© 2026 AIC Njoro Town. All rights reserved.</p>
        <p className="mt-1">Website launching soon.</p>
      </footer>
    </div>
  );
};

export default BibleReadingExcel;
