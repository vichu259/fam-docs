export default function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Family Docs"
    >
      <rect width="32" height="32" rx="8" fill="#7C3AED" />
      <rect x="11" y="5" width="12" height="15" rx="2" fill="white" fillOpacity="0.22" />
      <rect x="7" y="9" width="13" height="17" rx="2.5" fill="white" />
      <path d="M16.5 9 L20 12.5 L16.5 12.5 Z" fill="#7C3AED" fillOpacity="0.15" />
      <path d="M16.5 9 L20 12.5" stroke="#7C3AED" strokeOpacity="0.2" strokeWidth="0.75" />
      <rect x="10" y="15.5" width="7"   height="1.5" rx="0.75" fill="#7C3AED" fillOpacity="0.35" />
      <rect x="10" y="19"   width="5.5" height="1.5" rx="0.75" fill="#7C3AED" fillOpacity="0.35" />
      <rect x="10" y="22.5" width="3.5" height="1.5" rx="0.75" fill="#7C3AED" fillOpacity="0.25" />
    </svg>
  );
}
