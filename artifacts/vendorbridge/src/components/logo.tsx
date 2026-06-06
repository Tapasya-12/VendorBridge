import React from 'react';

export function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* V shape with upward arrow */}
      <path d="M15 30 L40 90 L60 30 L50 30 L38 65 L25 30 Z" fill="#235A7B" />
      <path d="M60 30 L50 40 L65 40 Z" fill="#235A7B" />
      
      {/* Abstract Handshake inside the B shape */}
      <path d="M50 35 Q85 35 85 55 Q85 65 70 70 Q90 75 90 90 L50 90 L50 80 Q75 80 75 70 Q75 55 50 55 Z" fill="#79AE61" />
      
      {/* Handshake line abstraction */}
      <path d="M50 55 L65 65 L70 60" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
