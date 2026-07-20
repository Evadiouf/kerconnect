export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <svg
        className="animate-spin"
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        aria-label="Chargement..."
      >
        <circle
          cx="20"
          cy="20"
          r="16"
          stroke="#E5E7EB"
          strokeWidth="4"
        />
        <path
          d="M20 4a16 16 0 0 1 16 16"
          stroke="#E05C52"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
