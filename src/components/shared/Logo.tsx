import React from 'react';

// Vite resolves this import to a URL at build time
import logoUrl from './assets/logo.png';

interface LogoProps { variant?: 'full' | 'sub'; style?: React.CSSProperties; }

export function Logo({ variant = 'sub', style }: LogoProps) {
  const height = variant === 'full' ? 36 : 24;

  return (
    <img
      src={logoUrl}
      alt="AI+"
      style={{
        height, width: 'auto',
        objectFit: 'contain',
        zIndex: 12,
        ...style,
      }}
    />
  );
}
