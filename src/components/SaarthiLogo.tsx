import React from 'react';

export const SaarthiLogo: React.FC<{ size?: number; className?: string }> = ({ size = 100, className = "" }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`} style={{ width: size, height: 'auto' }}>
      <svg
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
            <stop offset="100%" stopColor="#10b981" /> {/* Emerald */}
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* The 'S' Shape */}
        <path
          d="M130 40C130 40 100 20 80 40C60 60 70 90 90 100C110 110 130 130 110 160C90 190 50 180 50 180"
          stroke="url(#logo-gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Leaf portion at the top */}
        <path
          d="M130 40C145 25 160 30 160 50C160 70 140 85 130 80"
          fill="url(#logo-gradient)"
          filter="url(#glow)"
        />

        {/* Network nodes and lines in the bottom curve */}
        <circle cx="65" cy="165" r="3" fill="#fff" />
        <circle cx="85" cy="175" r="3" fill="#fff" />
        <circle cx="105" cy="165" r="3" fill="#fff" />
        <path d="M65 165L85 175L105 165" stroke="#fff" strokeWidth="1" opacity="0.5" />
      </svg>
      
      {/* Internal text removed to prevent overlapping in header */}
    </div>
  );
};
