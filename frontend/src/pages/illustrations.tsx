// Generic flat illustrations for the home page sections. Plain inline SVG so
// there are no external image assets to manage.

export function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 320" role="presentation" aria-hidden="true">
      <rect x="20" y="30" width="380" height="260" rx="24" fill="#dbeafe" />
      <rect x="60" y="150" width="60" height="100" rx="6" fill="#93c5fd" />
      <rect x="140" y="110" width="60" height="140" rx="6" fill="#60a5fa" />
      <rect x="220" y="80" width="60" height="170" rx="6" fill="#2563eb" />
      <path
        d="M60 130 L140 90 L220 60 L300 40"
        fill="none"
        stroke="#1e3a8a"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="300" cy="40" r="10" fill="#1e3a8a" />
      <rect x="230" y="180" width="130" height="80" rx="12" fill="#ffffff" stroke="#2563eb" strokeWidth="4" />
      <rect x="248" y="200" width="94" height="10" rx="5" fill="#93c5fd" />
      <rect x="248" y="222" width="60" height="10" rx="5" fill="#bfdbfe" />
      <circle cx="325" cy="227" r="12" fill="#2563eb" />
    </svg>
  )
}

export function SecurityIllustration() {
  return (
    <svg viewBox="0 0 200 200" role="presentation" aria-hidden="true">
      <path
        d="M100 15 L170 40 V95 C170 140 140 170 100 185 C60 170 30 140 30 95 V40 Z"
        fill="#dbeafe"
        stroke="#2563eb"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M70 100 L92 122 L134 78"
        fill="none"
        stroke="#2563eb"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AccountsIllustration() {
  return (
    <svg viewBox="0 0 220 200" role="presentation" aria-hidden="true">
      <rect x="10" y="10" width="200" height="180" rx="16" fill="#dbeafe" />
      <rect x="30" y="100" width="24" height="60" rx="4" fill="#93c5fd" />
      <rect x="66" y="80" width="24" height="80" rx="4" fill="#60a5fa" />
      <rect x="102" y="60" width="24" height="100" rx="4" fill="#2563eb" />
      <circle cx="168" cy="60" r="32" fill="#ffffff" stroke="#2563eb" strokeWidth="6" />
      <path d="M168 60 L168 30 A30 30 0 0 1 194 75 Z" fill="#2563eb" />
    </svg>
  )
}
