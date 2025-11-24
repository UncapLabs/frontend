export function VaultIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="size-full bg-[#F5F3EE]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="200" height="200" fill="#F5F3EE" />
      <defs>
        <linearGradient id="safeBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0f0f0" />
          <stop offset="100%" stopColor="#e0e0e0" />
        </linearGradient>
        <linearGradient id="coinSide" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e68400" />
          <stop offset="50%" stopColor="#ff9300" />
          <stop offset="100%" stopColor="#cc7000" />
        </linearGradient>
        <linearGradient id="coinTop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffb74d" />
          <stop offset="100%" stopColor="#ff9300" />
        </linearGradient>
      </defs>
      <g transform="translate(100, 100) scale(0.9)">
        {/* Safe Body */}
        <path
          d="M-50 -40 L50 -40 L50 40 L-50 40 Z"
          fill="url(#safeBody)"
          stroke="#d1d1d1"
          transform="translate(0, -10)"
        />
        {/* 3D depth */}
        <path d="M50 -50 L70 -30 L70 50 L50 30 Z" fill="#dcdcdc" />
        <path d="M-30 -50 L70 -30 L50 -50 Z" fill="#e6e6e6" /> {/* Top */}
        <path
          d="M-50 -40 L50 -40 L50 40 L-50 40 Z"
          fill="#001B40"
          transform="translate(0, -10)"
        />
        
        {/* Coin inside */}
        <g transform="translate(0, 0)">
           <ellipse cx="0" cy="0" rx="20" ry="20" fill="#FF9300" />
           <text x="0" y="6" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#fff" fontFamily="Sora, sans-serif">₿</text>
        </g>

        {/* Door Open */}
        <path
          d="M-50 -50 L-50 30 L-90 50 L-90 -30 Z"
          fill="#f5f5f5"
          stroke="#d1d1d1"
          strokeWidth="1"
        />
        <ellipse cx="-75" cy="10" rx="5" ry="8" fill="#d1d1d1" />

        {/* Spilling Coins */}
        <g transform="translate(30, 40)">
           {[0, 1, 2, 3].map((i) => (
             <g key={i} transform={`translate(${i * 15}, ${i * 10})`}>
                <ellipse cx="0" cy="0" rx="10" ry="5" fill="#e68400" />
                <ellipse cx="0" cy="-2" rx="10" ry="5" fill="#ff9300" />
             </g>
           ))}
        </g>
      </g>
    </svg>
  );
}

export function ScaleIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="size-full bg-[#F5F3EE]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="200" height="200" fill="#F5F3EE" />
      <g transform="translate(100, 120)">
        {/* Base */}
        <path d="M-20 20 L20 20 L0 -20 Z" fill="#d1d1d1" />
        
        {/* Beam */}
        <rect x="-80" y="-22" width="160" height="4" rx="2" fill="#001B40" transform="rotate(-5)" />
        
        {/* Left Pan (Bitcoin) */}
        <g transform="translate(-70, -15)">
           <line x1="0" y1="0" x2="0" y2="30" stroke="#d1d1d1" />
           <path d="M-20 30 Q0 40 20 30" fill="none" stroke="#001B40" strokeWidth="2" />
           {/* Coin Stack */}
           <g transform="translate(0, 25)">
             <ellipse cx="0" cy="0" rx="12" ry="5" fill="#e68400" />
             <ellipse cx="0" cy="-3" rx="12" ry="5" fill="#ff9300" />
             <ellipse cx="0" cy="-6" rx="12" ry="5" fill="#e68400" />
             <ellipse cx="0" cy="-9" rx="12" ry="5" fill="#ff9300" />
             <text x="0" y="-6" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff" fontFamily="Sora, sans-serif">₿</text>
           </g>
        </g>

        {/* Right Pan (USDU) */}
        <g transform="translate(70, -25)">
           <line x1="0" y1="0" x2="0" y2="30" stroke="#d1d1d1" />
           <path d="M-20 30 Q0 40 20 30" fill="none" stroke="#001B40" strokeWidth="2" />
           {/* USDU Stack */}
           <g transform="translate(0, 25)">
             <ellipse cx="0" cy="0" rx="12" ry="5" fill="#1E50BC" />
             <ellipse cx="0" cy="-3" rx="12" ry="5" fill="#3b82f6" />
             <ellipse cx="0" cy="-6" rx="12" ry="5" fill="#1E50BC" />
             <ellipse cx="0" cy="-9" rx="12" ry="5" fill="#3b82f6" />
             <text x="0" y="-6" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff" fontFamily="Sora, sans-serif">U</text>
           </g>
        </g>
      </g>
    </svg>
  );
}

export function ShieldIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="size-full bg-[#F5F3EE]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="200" height="200" fill="#F5F3EE" />
      <g transform="translate(100, 100)">
        {/* Hands */}
        <path 
          d="M-40 40 Q-20 60 0 50 Q20 60 40 40" 
          fill="#f0f0f0" 
          stroke="#d1d1d1" 
          strokeWidth="2" 
        />
        <circle cx="-40" cy="40" r="8" fill="#f0f0f0" />
        <circle cx="40" cy="40" r="8" fill="#f0f0f0" />

        {/* Shield */}
        <path
          d="M0 -40 C 30 -40 40 -20 40 0 C 40 30 0 50 0 50 C 0 50 -40 30 -40 0 C -40 -20 -30 -40 0 -40 Z"
          fill="#1E50BC"
          stroke="#001B40"
          strokeWidth="2"
        />
        {/* Keyhole */}
        <circle cx="0" cy="-10" r="6" fill="#fff" opacity="0.3" />
        <path d="M-2 -10 L2 -10 L4 10 L-4 10 Z" fill="#fff" opacity="0.3" />
        
        {/* Floating Bitcoin Protected */}
        <circle cx="0" cy="15" r="15" fill="#FF9300" stroke="#fff" strokeWidth="2" />
        <text x="0" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff" fontFamily="Sora, sans-serif">₿</text>
      </g>
    </svg>
  );
}

export function SmartContractIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="size-full bg-[#F5F3EE]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="200" height="200" fill="#F5F3EE" />
      <defs>
        <filter id="glass">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
        <linearGradient id="paperGrad" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stopColor="#fff" />
           <stop offset="100%" stopColor="#f5f5f5" />
        </linearGradient>
      </defs>
      <g transform="translate(100, 100)">
        {/* Scroll Paper */}
        <path
          d="M-30 -50 C-30 -55 -20 -55 0 -50 L40 -40 L40 60 C20 65 -30 65 -30 60 Z"
          fill="url(#paperGrad)"
          stroke="#d1d1d1"
          strokeWidth="1"
          transform="rotate(-10)"
        />
        {/* Lines */}
        <g transform="rotate(-10) translate(-20, -30)">
           <line x1="0" y1="0" x2="30" y2="0" stroke="#d1d1d1" strokeWidth="2" />
           <line x1="0" y1="10" x2="40" y2="10" stroke="#d1d1d1" strokeWidth="2" />
           <line x1="0" y1="20" x2="35" y2="20" stroke="#d1d1d1" strokeWidth="2" />
           <line x1="0" y1="30" x2="25" y2="30" stroke="#d1d1d1" strokeWidth="2" />
        </g>

        {/* Seal */}
        <circle cx="20" cy="40" r="12" fill="#1E50BC" stroke="#0051BF" strokeWidth="2" />
        <path d="M15 40 L20 45 L28 35" stroke="#fff" strokeWidth="2" fill="none" />
        
        {/* Transparent Layer */}
        <rect
          x="-40"
          y="-20"
          width="60"
          height="80"
          rx="4"
          fill="rgba(255,255,255,0.3)"
          stroke="rgba(30, 80, 188, 0.2)"
          strokeWidth="1"
          transform="rotate(5)"
        />
      </g>
    </svg>
  );
}
