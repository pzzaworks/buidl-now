"use client";

export function GeometricBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* SVG for center elements */}
      <svg
        className="w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="100%" height="100%" fill="var(--color-gray-50)" />

        {/* Center circles */}
        <circle
          cx="720"
          cy="450"
          r="320"
          fill="none"
          stroke="var(--color-gray-200)"
          strokeWidth="1"
        />
        <circle
          cx="720"
          cy="450"
          r="180"
          fill="none"
          stroke="var(--color-gray-200)"
          strokeWidth="1"
        />

        {/* Center cross lines */}
        <line
          x1="720"
          y1="0"
          x2="720"
          y2="900"
          stroke="var(--color-gray-200)"
          strokeWidth="1"
        />
        <line
          x1="0"
          y1="450"
          x2="1440"
          y2="450"
          stroke="var(--color-gray-200)"
          strokeWidth="1"
        />

        {/* Diagonal lines from corners */}
        <line
          x1="0"
          y1="0"
          x2="720"
          y2="450"
          stroke="var(--color-gray-200)"
          strokeWidth="1"
        />
        <line
          x1="1440"
          y1="0"
          x2="720"
          y2="450"
          stroke="var(--color-gray-200)"
          strokeWidth="1"
        />
        <line
          x1="0"
          y1="900"
          x2="720"
          y2="450"
          stroke="var(--color-gray-200)"
          strokeWidth="1"
        />
        <line
          x1="1440"
          y1="900"
          x2="720"
          y2="450"
          stroke="var(--color-gray-200)"
          strokeWidth="1"
        />
      </svg>

      {/* Corner marks - Top Left (rounded corner) - Desktop only */}
      <div className="hidden lg:block absolute top-6 left-6 pointer-events-none">
        <svg width="28" height="28" viewBox="0 0 28 28">
          <path d="M 1 28 L 1 12 Q 1 1 12 1 L 28 1" stroke="var(--color-gray-300)" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* Corner marks - Top Right (rounded corner) - Desktop only */}
      <div className="hidden lg:block absolute top-6 right-6 pointer-events-none">
        <svg width="28" height="28" viewBox="0 0 28 28">
          <path d="M 0 1 L 16 1 Q 27 1 27 12 L 27 28" stroke="var(--color-gray-300)" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* Corner marks - Bottom Left (rounded corner) - Desktop only */}
      <div className="hidden lg:block absolute bottom-6 left-6 pointer-events-none">
        <svg width="28" height="28" viewBox="0 0 28 28">
          <path d="M 1 0 L 1 16 Q 1 27 12 27 L 28 27" stroke="var(--color-gray-300)" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* Corner marks - Bottom Right (rounded corner) - Desktop only */}
      <div className="hidden lg:block absolute bottom-6 right-6 pointer-events-none">
        <svg width="28" height="28" viewBox="0 0 28 28">
          <path d="M 0 27 L 16 27 Q 27 27 27 16 L 27 0" stroke="var(--color-gray-300)" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* Side marks - Left (only vertical line) - Desktop only */}
      <div className="hidden lg:block absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="4" height="24" viewBox="0 0 4 24">
          <path d="M 2 0 L 2 24" stroke="var(--color-gray-300)" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* Side marks - Right (only vertical line) - Desktop only */}
      <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="4" height="24" viewBox="0 0 4 24">
          <path d="M 2 0 L 2 24" stroke="var(--color-gray-300)" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    </div>
  );
}
