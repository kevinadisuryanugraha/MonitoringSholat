import React from 'react';

export const Mosque: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Minaret Crescent */}
    <path d="M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="currentColor" opacity="0.3" />
    <path d="M12 6v3" />
    {/* Main Dome */}
    <path d="M6 13a6 6 0 0 1 12 0v8H6v-8z" />
    {/* Door Arc */}
    <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
    {/* Side Minarets */}
    <path d="M3 13v8h3M18 21h3v-8" />
    <path d="M3 13l1.5-3L6 13M18 13l1.5-3L21 13" />
  </svg>
);
