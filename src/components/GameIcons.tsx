export const DiamondIcon = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
    <path d="m6 3 4 6 4-6" fill="rgba(255,255,255,0.3)" />
    <path d="m14 9 4-6 4 6" fill="rgba(255,255,255,0.2)" />
  </svg>
);

export const GoldIcon = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" fill="rgba(255,255,255,0.3)" />
    <text x="12" y="16" textAnchor="middle" fontSize="8" fill="rgba(0,0,0,0.7)" fontWeight="bold">$</text>
  </svg>
);

export const PortalIcon = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    className={className}
  >
    <rect x="3" y="4" width="18" height="16" rx="2" fill="rgba(139,69,193,0.3)" />
    <path d="M8 4v16" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    <path d="M16 4v16" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    <ellipse cx="12" cy="12" rx="3" ry="6" fill="rgba(139,69,193,0.8)" />
    <ellipse cx="12" cy="12" rx="1" ry="3" fill="rgba(255,255,255,0.9)" />
  </svg>
);

export const PlayerIcon = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <circle cx="12" cy="8" r="3" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M8 6l2-2 2 2" fill="rgba(255,255,255,0.5)" />
  </svg>
);