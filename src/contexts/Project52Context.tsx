import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Catchphrase, ReadingTarget, ReadingWeek } from '../types/project52';
import { getCurrentReadingTarget, buildReadingWeeks } from '../utils/project52Schedule';
import { project52Readings } from '../data/project52Readings';
import { project52Catchphrases } from '../data/project52Catchphrases';

type Project52ContextType = {
    readingTarget: ReadingTarget;
    currentWeek: number;
    weeks: ReadingWeek[];
    activeCatchphrase: Catchphrase;
};

const Project52Context = createContext<Project52ContextType | undefined>(undefined);

export const Project52Provider = ({ children }: { children: ReactNode }) => {
    const [readingTarget, setReadingTarget] = useState(() => getCurrentReadingTarget());
    const [catchphraseIndex, setCatchphraseIndex] = useState(0);

    const currentWeek = readingTarget.week;
    const weeks = useMemo(() => buildReadingWeeks(project52Readings, currentWeek), [currentWeek]);
    const activeCatchphrase = project52Catchphrases[catchphraseIndex];

    useEffect(() => {
        let timeoutId: number;

        const refreshReadingTarget = () => {
            const nextTarget = getCurrentReadingTarget();

            setReadingTarget((currentTarget) => {
                const targetChanged =
                    currentTarget.week !== nextTarget.week ||
                    currentTarget.dayIndex !== nextTarget.dayIndex ||
                    currentTarget.isWeekendCarryover !== nextTarget.isWeekendCarryover;

                return targetChanged ? nextTarget : currentTarget;
            });
        };

        const scheduleNextRefresh = () => {
            window.clearTimeout(timeoutId);

            const now = new Date();
            const nextMidnight = new Date(now);
            nextMidnight.setHours(24, 0, 0, 0);

            timeoutId = window.setTimeout(() => {
                refreshReadingTarget();
                scheduleNextRefresh();
            }, Math.max(1000, nextMidnight.getTime() - now.getTime()));
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                refreshReadingTarget();
                scheduleNextRefresh();
            }
        };

        scheduleNextRefresh();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.clearTimeout(timeoutId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setCatchphraseIndex((current) => (current + 1) % project52Catchphrases.length);
        }, 4200);

        return () => window.clearInterval(interval);
    }, []);

    return (
        <Project52Context.Provider value={{ readingTarget, currentWeek, weeks, activeCatchphrase }}>
            {children}
        </Project52Context.Provider>
    );
};

export const useProject52 = () => {
    const context = useContext(Project52Context);
    if (context === undefined) {
        throw new Error('useProject52 must be used within a Project52Provider');
    }
    return context;
};
