import React from 'react';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'mark';
  className?: string;
}

export default function Logo({size = 32, variant = 'mark', className}: LogoProps): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-label="Compression Research Atlas"
    >
      <defs>
        <linearGradient id="cr-square" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="cr-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>

      <rect x="22" y="22" width="20" height="20" rx="3" fill="url(#cr-square)" stroke="#0f172a" strokeWidth="1.4" />
      <rect x="26" y="26" width="12" height="2.4" fill="#94a3b8" opacity="0.75" />
      <rect x="26" y="30.4" width="9" height="2.4" fill="#94a3b8" opacity="0.55" />
      <rect x="26" y="34.8" width="11" height="2.4" fill="#94a3b8" opacity="0.4" />
      <rect x="26" y="39.2" width="6" height="2.4" fill="#94a3b8" opacity="0.25" />

      <line x1="32" y1="22" x2="32" y2="10" stroke="url(#cr-edge)" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="42" y1="32" x2="54" y2="32" stroke="url(#cr-edge)" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="32" y1="42" x2="32" y2="54" stroke="url(#cr-edge)" strokeWidth="1.6" strokeLinecap="round" />

      <circle cx="32" cy="8" r="3.2" fill="#ffffff" stroke="#2563eb" strokeWidth="1.4" />
      <circle cx="56" cy="32" r="3.2" fill="#ffffff" stroke="#14b8a6" strokeWidth="1.4" />
      <circle cx="32" cy="56" r="3.2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.4" />
    </svg>
  );
}
