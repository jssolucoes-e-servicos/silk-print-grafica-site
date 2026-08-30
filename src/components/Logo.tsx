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
  theme = 'auto',
}) => {
  // Dimensions for the CMYK cube
  const cubeDimensions = {
    sm: { width: 28, height: 28 },
    md: { width: 40, height: 40 },
    lg: { width: 54, height: 54 },
    xl: { width: 72, height: 72 },
  }[size];

  const textColorClass = 
    theme === 'light' 
      ? 'text-white' 
      : theme === 'dark' 
      ? 'text-slate-900' 
      : 'text-slate-900 dark:text-white';

  const subtitleColorClass = 
    theme === 'light' 
      ? 'text-slate-300' 
      : theme === 'dark' 
      ? 'text-slate-600' 
      : 'text-slate-600 dark:text-slate-400';

  const CubeIcon = (
    <svg
      width={cubeDimensions.width}
      height={cubeDimensions.height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 hover:scale-105"
      id="cmyk-cube-emblem"
    >
      {/* 
        Isometric 3D Cube / Hexagon representing CMYK:
        Top face: Magenta
        Left face: Cyan
        Right face: Yellow
        Black outline & dividers
      */}
      {/* Outer Hexagon border & background */}
      <polygon
        points="100,12 180,58 180,148 100,194 20,148 20,58"
        stroke="#1e293b"
        strokeWidth="14"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Top Face: Magenta (#e6007e) */}
      <polygon
        points="100,16 174,58 100,102 26,58"
        fill="#e6007e"
        stroke="#1e293b"
        strokeWidth="12"
        strokeLinejoin="round"
      />

      {/* Left Face: Cyan (#00a0e9) */}
      <polygon
        points="26,58 100,102 100,190 26,144"
        fill="#00a0e9"
        stroke="#1e293b"
        strokeWidth="12"
        strokeLinejoin="round"
      />

      {/* Right Face: Yellow (#fff100) */}
      <polygon
        points="100,102 174,58 174,144 100,190"
        fill="#fff100"
        stroke="#1e293b"
        strokeWidth="12"
        strokeLinejoin="round"
      />

      {/* Center 3D Y-Joint Lines */}
      <line x1="100" y1="102" x2="100" y2="190" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
      <line x1="100" y1="102" x2="26" y2="58" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
      <line x1="100" y1="102" x2="174" y2="58" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{CubeIcon}</div>;
  }

  const textSizes = {
    sm: { title: 'text-lg', sub: 'text-[9px] tracking-wider' },
    md: { title: 'text-2xl', sub: 'text-xs tracking-widest' },
    lg: { title: 'text-3xl', sub: 'text-sm tracking-widest' },
    xl: { title: 'text-4xl', sub: 'text-base tracking-widest' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {variant !== 'text' && CubeIcon}
      <div className="flex flex-col leading-none">
        <span 
          className={`font-black italic font-heading tracking-tight ${textSizes.title} ${textColorClass} flex items-center gap-1`}
          style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
        >
          <span>Silk</span>
          <span className="text-cyan-500">Print</span>
        </span>
        <span className={`font-semibold uppercase ${textSizes.sub} ${subtitleColorClass} flex items-center gap-1 mt-0.5`}>
          <span>GRÁFICA</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-magenta-500" style={{ backgroundColor: '#e6007e' }}></span>
          <span className="text-yellow-500 font-bold">ONLINE</span>
        </span>
      </div>
    </div>
  );
};
export default Logo;
