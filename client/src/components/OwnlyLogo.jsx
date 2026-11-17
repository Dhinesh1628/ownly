import React from 'react';

export const OwnlyLogoMark = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    {/* Rounded square in teal accent (no gradients) */}
    <rect width="32" height="32" rx="8" fill="#0d9488" />
    {/* White ring */}
    <circle cx="16" cy="16" r="6.2" stroke="#ffffff" strokeWidth="2" fill="none" />
    {/* Small filled dot at the center */}
    <circle cx="16" cy="16" r="2.2" fill="#ffffff" />
  </svg>
);

export const OwnlyLogo = ({ markSize = 28, showWordmark = true, className = '' }) => (
  <div className={`inline-flex items-center gap-2 select-none ${className}`}>
    <OwnlyLogoMark size={markSize} />
    {showWordmark && (
      <span className="font-semibold text-slate-900 dark:text-slate-50 tracking-tight text-lg">
        Ownly
      </span>
    )}
  </div>
);
