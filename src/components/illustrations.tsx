export function PeelMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="32" fill="#F3E2B8" />
      <path
        d="M18 38c6-16 22-18 28-6 2 4-4 8-8 6-6-2-8 4-14 8-6 3-10-2-6-8z"
        fill="#E2B03A"
      />
      <path d="M22 22c8-4 16 2 14 10" stroke="#7A5A1E" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function BinMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="32" fill="#D7E6D2" />
      <rect x="18" y="22" width="28" height="28" rx="4" fill="#3F6B4A" />
      <rect x="16" y="18" width="32" height="8" rx="3" fill="#2C4E36" />
      <path d="M24 30v14M32 30v14M40 30v14" stroke="#D7E6D2" strokeWidth="2" />
    </svg>
  );
}

export function ScaleMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="32" fill="#F6D7C4" />
      <rect x="22" y="38" width="20" height="8" rx="2" fill="#C45C26" />
      <circle cx="32" cy="26" r="12" fill="#F4EFE6" stroke="#C45C26" strokeWidth="3" />
      <path d="M32 26l7-4" stroke="#C45C26" strokeWidth="2" />
    </svg>
  );
}

export function CompostMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="32" fill="#E8D5B5" />
      <ellipse cx="32" cy="42" rx="18" ry="8" fill="#6B4226" />
      <path d="M16 42c4-14 28-14 32 0" fill="#8B5A2B" />
      <path d="M26 22c0-6 4-8 6-2M34 20c2-6 8-4 6 2" stroke="#C45C26" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function GardenMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="32" fill="#DCECC8" />
      <path d="M32 44V22" stroke="#3F6B4A" strokeWidth="3" />
      <path d="M32 28c-10-8-14 4-8 8 8 4 8-8 8-8z" fill="#5C8A4D" />
      <path d="M32 30c10-8 14 4 8 8-8 4-8-8-8-8z" fill="#3F6B4A" />
      <ellipse cx="32" cy="46" rx="14" ry="4" fill="#8B5A2B" />
    </svg>
  );
}

export function HeroLoopScene() {
  return (
    <svg viewBox="0 0 360 200" className="w-full" role="img" aria-label="Food scraps becoming compost in a neighbourhood garden">
      <rect width="360" height="200" rx="28" fill="#1F3A2C" />
      <circle cx="290" cy="36" r="22" fill="#F3E2B8" opacity="0.9" />
      <path d="M0 150h360v50H0z" fill="#2C4E36" />
      <path d="M0 150c40-24 80 8 120-6s80-20 120 2 80 4 120-10v64H0z" fill="#3F6B4A" />
      <rect x="28" y="92" width="54" height="62" rx="8" fill="#C45C26" />
      <rect x="22" y="82" width="66" height="16" rx="6" fill="#8B5A2B" />
      <path d="M40 108v30M55 108v30M70 108v30" stroke="#F4EFE6" strokeWidth="3" />
      <ellipse cx="180" cy="148" rx="46" ry="16" fill="#6B4226" />
      <path d="M140 148c10-32 70-32 80 0" fill="#8B5A2B" />
      <path d="M168 108c-2-18 10-22 16-6M196 104c4-16 18-10 12 4" stroke="#E8C9A0" strokeWidth="3" fill="none" />
      <path d="M250 150v-58" stroke="#8B5A2B" strokeWidth="6" />
      <path d="M250 112c-24-18-30 12-14 20 18 10 16-18 14-20z" fill="#7CB068" />
      <path d="M250 118c24-20 32 10 16 20-20 10-16-18-16-20z" fill="#4F8A4A" />
      <circle cx="262" cy="96" r="5" fill="#C45C26" />
      <circle cx="238" cy="102" r="4" fill="#E2B03A" />
      <text x="28" y="36" fill="#F4EFE6" fontSize="13" fontFamily="Georgia, serif">
        Kitchen scraps become soil
      </text>
    </svg>
  );
}

export function DropoffScene() {
  return (
    <svg viewBox="0 0 320 140" className="w-full" role="img" aria-label="Block bin room with a food-waste caddy">
      <rect width="320" height="140" rx="22" fill="#EFE6D6" />
      <rect x="18" y="28" width="284" height="96" rx="12" fill="#D8CBB5" />
      <rect x="40" y="48" width="70" height="62" rx="6" fill="#9AA195" />
      <rect x="128" y="48" width="70" height="62" rx="6" fill="#9AA195" />
      <rect x="216" y="44" width="64" height="66" rx="8" fill="#3F6B4A" />
      <rect x="210" y="36" width="76" height="14" rx="5" fill="#2C4E36" />
      <text x="228" y="82" fill="#F4EFE6" fontSize="11">FOOD</text>
      <circle cx="70" cy="22" r="8" fill="#F3E2B8" />
    </svg>
  );
}

export function GardenScene() {
  return (
    <svg viewBox="0 0 320 140" className="w-full" role="img" aria-label="Herb beds grown with compost">
      <rect width="320" height="140" rx="22" fill="#E7F0D8" />
      <rect x="20" y="86" width="280" height="36" rx="8" fill="#8B5A2B" />
      <rect x="32" y="74" width="76" height="18" rx="4" fill="#5C8A4D" />
      <rect x="122" y="70" width="76" height="22" rx="4" fill="#3F6B4A" />
      <rect x="212" y="76" width="76" height="16" rx="4" fill="#7CB068" />
      <path d="M70 74v-28M70 52c-12-10-16 6-6 10M70 52c12-10 16 6 6 10" fill="#4F8A4A" stroke="#2C4E36" />
      <path d="M160 70v-32M160 48c-14-12-18 8-6 12M160 48c14-12 18 8 6 12" fill="#3F6B4A" />
      <circle cx="250" cy="64" r="7" fill="#C45C26" />
      <circle cx="268" cy="70" r="5" fill="#E2B03A" />
    </svg>
  );
}
