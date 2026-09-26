export function SoundIcon({ playing }: { playing?: boolean }) {
  if (playing)
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
        <rect x="2.5" y="2" width="3" height="10" rx="1" fill="currentColor" />
        <rect x="8.5" y="2" width="3" height="10" rx="1" fill="currentColor" />
      </svg>
    );
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 7h2.5L9 4v10l-3.5-3H3z" fill="currentColor" />
      <path d="M12 6.2a4 4 0 0 1 0 5.6M14 4.2a7 7 0 0 1 0 9.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
