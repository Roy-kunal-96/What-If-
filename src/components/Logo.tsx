import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }[size];

  const textSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  const subTextSize = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Mark */}
      <div
        className={`${iconDimensions} relative rounded-lg bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 dark:from-indigo-500 dark:via-indigo-600 dark:to-slate-950 p-1 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 border border-indigo-400/30 overflow-hidden group`}
      >
        {/* Ambient glow backdrop */}
        <div className="absolute inset-0 bg-radial from-indigo-400/30 to-transparent pointer-events-none" />

        {/* Crisp vector icon: Compounding branching timeline + What-if query mark */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-xs"
        >
          {/* Baseline path */}
          <path
            d="M5 24C11 24 13 18 19 18C23 18 25 15 27 12"
            stroke="white"
            strokeOpacity="0.45"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="2 2"
          />
          {/* Branching / What-if trajectory curve */}
          <path
            d="M13 21C16 17 19 9 27 6"
            stroke="url(#whatif-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Target star / Future node */}
          <circle cx="27" cy="6" r="2.5" fill="#38BDF8" />
          <circle cx="27" cy="6" r="4.5" stroke="#38BDF8" strokeOpacity="0.5" strokeWidth="1" />
          {/* Central What-if glyph */}
          <path
            d="M10 9.5C10 7.8 11.3 6.5 13 6.5C14.7 6.5 16 7.8 16 9.5C16 11.2 14.5 12 13 13V14"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="13" cy="17" r="1" fill="white" />

          <defs>
            <linearGradient id="whatif-gradient" x1="13" y1="21" x2="27" y2="6" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818CF8" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight text-slate-900 dark:text-white ${textSize} uppercase`}
            >
              WHAT IF<span className="text-indigo-600 dark:text-indigo-400">?</span>
            </span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-[9px] tracking-wider uppercase border border-indigo-200/60 dark:border-indigo-800/80">
              SIM
            </span>
          </div>
          <p className={`font-medium text-slate-400 dark:text-slate-500 tracking-tight leading-tight mt-0.5 ${subTextSize}`}>
            Decision Intelligence
          </p>
        </div>
      )}
    </div>
  );
};
