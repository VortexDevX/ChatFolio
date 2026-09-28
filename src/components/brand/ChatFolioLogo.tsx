import React from 'react';

interface ChatFolioLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
}

export const ChatFolioLogo: React.FC<ChatFolioLogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  }[size];

  const textStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric Folio Leaf Emblem */}
      <div
        className={`${iconDimensions} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 shadow-md shadow-blue-500/25 p-1.5 transition-transform duration-300 hover:scale-105 shrink-0`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Back Paper Leaf */}
          <path
            d="M8 5C8 3.89543 8.89543 3 10 3H22C23.1046 3 24 3.89543 24 5V21C24 22.1046 23.1046 23 22 23H10C8.89543 23 8 22.1046 8 21V5Z"
            fill="white"
            fillOpacity="0.25"
          />
          {/* Front Angle-Folded Folio Leaf */}
          <path
            d="M5 9C5 7.89543 5.89543 7 7 7H19C20.1046 7 21 7.89543 21 9V26C21 27.1046 20.1046 28 19 28H7C5.89543 28 5 27.1046 5 26V9Z"
            fill="url(#folio-gradient-front)"
          />
          {/* Spine Crease / Ribbon Accent */}
          <path
            d="M21 16L27 20L21 24V16Z"
            fill="url(#folio-accent-spark)"
          />
          {/* Stylized Text Lines on Front Leaf */}
          <rect x="8" y="11" width="8" height="1.5" rx="0.75" fill="white" fillOpacity="0.9" />
          <rect x="8" y="15" width="10" height="1.5" rx="0.75" fill="white" fillOpacity="0.7" />
          <rect x="8" y="19" width="6" height="1.5" rx="0.75" fill="white" fillOpacity="0.5" />

          <defs>
            <linearGradient id="folio-gradient-front" x1="5" y1="7" x2="21" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.6" stopColor="#f3f4f6" />
              <stop offset="1" stopColor="#e5e7eb" />
            </linearGradient>
            <linearGradient id="folio-accent-spark" x1="21" y1="16" x2="27" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Wordmark */}
      {showWordmark && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-slate-900 dark:text-white ${textStyles}`}>
            Chat<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">Folio</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
            Studio
          </span>
        </div>
      )}
    </div>
  );
};
