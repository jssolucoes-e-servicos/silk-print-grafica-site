import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  theme = 'dark',
}) => {
  const cubeDimensions = {
    sm: { width: 30, height: 30 },
    md: { width: 44, height: 44 },
    lg: { width: 56, height: 56 },
    xl: { width: 76, height: 76 },
  }[size];

  const textColorClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subtitleColorClass = theme === 'dark' ? 'text-[#00a8e8]' : 'text-slate-800';

  const CubeIcon = (
    <svg
      width={cubeDimensions.width}
      height={cubeDimensions.height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 hover:scale-105"
      id="silkprint-brand-emblem"
    >
      {/* Top-Left Face: Vivid Magenta / Crimson (#b8004f) */}
      <polygon points="95,16 28,55 95,94" fill="#b8004f" />
      {/* Top-Right Face: Deep Burgundy / Dark Wine (#7b0032) */}
      <polygon points="105,16 105,94 172,55" fill="#7b0032" />
      {/* Bottom-Left Face: Process Cyan (#0082c8) */}
      <polygon points="22,65 91,104 91,184 22,145" fill="#0082c8" />
      {/* Bottom-Right Face: Process Yellow (#f5c200) */}
      <polygon points="109,104 178,65 178,145 109,184" fill="#f5c200" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{CubeIcon}</div>;
  }

  const textSizes = {
    sm: { title: 'text-xl', sub: 'text-[9px] tracking-[0.38em]' },
    md: { title: 'text-2xl sm:text-3xl', sub: 'text-[10px] sm:text-[11px] tracking-[0.42em]' },
    lg: { title: 'text-3xl sm:text-4xl', sub: 'text-xs sm:text-sm tracking-[0.44em]' },
    xl: { title: 'text-4xl sm:text-5xl', sub: 'text-sm sm:text-base tracking-[0.46em]' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`} id="brand-logo-container">
      {variant !== 'text' && CubeIcon}
      <div className="flex flex-col leading-none justify-center">
        <span 
          className={`font-black tracking-tight ${textSizes.title} ${textColorClass}`}
          style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          SilkPrint
        </span>
        <span 
          className={`font-extrabold uppercase ${textSizes.sub} ${subtitleColorClass} mt-1.5 pl-0.5`}
          style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          G R Á F I C A
        </span>
      </div>
    </div>
  );
};

export default Logo;
