"use client"

export function PulseLine({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 100"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.72 0.18 165)" stopOpacity="0.1" />
          <stop offset="40%" stopColor="oklch(0.72 0.18 165)" stopOpacity="0.8" />
          <stop offset="50%" stopColor="oklch(0.72 0.18 165)" stopOpacity="1" />
          <stop offset="60%" stopColor="oklch(0.72 0.18 165)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="oklch(0.72 0.18 165)" stopOpacity="0.1" />
        </linearGradient>
        <clipPath id="pulseClip">
          <rect x="0" y="0" width="800" height="100">
            <animate
              attributeName="x"
              from="-800"
              to="800"
              dur="3s"
              repeatCount="indefinite"
            />
          </rect>
        </clipPath>
      </defs>
      
      {/* Static background trace */}
      <path
        d="M0,50 L200,50 L220,50 L240,20 L260,80 L280,10 L300,90 L320,50 L340,50 L800,50"
        fill="none"
        stroke="oklch(0.72 0.18 165)"
        strokeWidth="1"
        strokeOpacity="0.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Animated pulse line */}
      <path
        d="M0,50 L200,50 L220,50 L240,20 L260,80 L280,10 L300,90 L320,50 L340,50 L800,50"
        fill="none"
        stroke="url(#pulseGradient)"
        strokeWidth="2"
        filter="url(#glow)"
        strokeLinecap="round"
        strokeLinejoin="round"
        clipPath="url(#pulseClip)"
      />
      
      {/* Moving glow dot */}
      <circle r="6" fill="oklch(0.72 0.18 165)" filter="url(#glow)">
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path="M0,50 L200,50 L220,50 L240,20 L260,80 L280,10 L300,90 L320,50 L340,50 L800,50"
        />
        <animate
          attributeName="opacity"
          values="1;0.6;1"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  )
}
