type Project52ProgressBarProps = {
    currentWeek: number;
    darkMode: boolean;
    yearProgress?: number;
    className?: string;
};

const Project52ProgressBar = ({ currentWeek, darkMode, yearProgress, className = '' }: Project52ProgressBarProps) => {
    const progress = yearProgress ?? Math.round((currentWeek / 52) * 100);

    return (
        <div className={className}>
            <div className="mb-2 flex justify-between text-sm font-semibold">
                <span>Week {currentWeek} of 52</span>
                <span>{progress}%</span>
            </div>
            <div className={`h-3 overflow-hidden rounded-full ${darkMode ? 'bg-white/10' : 'bg-zinc-200'}`}>
                <div
                    className="h-full rounded-full bg-gradient-to-r from-red-900 via-red-700 to-black transition-all duration-700"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default Project52ProgressBar;
