import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
      >
        {/* Outer Gold Ring */}
        <circle cx="50" cy="50" r="47" fill="#1e293b" stroke="#f59e0b" strokeWidth="4" />
        <circle cx="50" cy="50" r="41" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 2" />

        {/* Center Navy Field */}
        <polygon points="50,12 85,30 85,70 50,88 15,70 15,30" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="2" />

        {/* Open Book Emblem */}
        <path
          d="M 28 58 Q 39 52 50 56 Q 61 52 72 58 L 72 40 Q 61 34 50 38 Q 39 34 28 40 Z"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="1.5"
        />
        <path d="M 50 38 L 50 56" stroke="#1e293b" strokeWidth="1.5" />

        {/* Flaming Torch of Education */}
        <path d="M 50 34 L 47 42 L 53 42 Z" fill="#d97706" />
        <path d="M 50 22 C 45 28 47 32 50 34 C 53 32 55 28 50 22 Z" fill="#ef4444" />
        <path d="M 50 25 C 48 29 49 31 50 32 C 51 31 52 29 50 25 Z" fill="#f59e0b" />

        {/* Ocean Waves (Muara Badak Coastal motif) */}
        <path
          d="M 24 66 Q 30 63 36 66 T 48 66 T 60 66 T 72 66 T 76 66"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Number 7 Star Badge */}
        <circle cx="50" cy="76" r="7" fill="#f59e0b" />
        <text
          x="50"
          y="80"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="#0f172a"
          fontFamily="sans-serif"
        >
          7
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-slate-900 leading-none">
            SMP NEGERI 7
          </span>
          <span className="text-xs font-medium text-blue-700 tracking-wider">
            MUARA BADAK
          </span>
        </div>
      )}
    </div>
  );
};
