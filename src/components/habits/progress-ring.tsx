"use client";

interface ProgressRingProps {
  percentage: number;
  valueText: string; // e.g., "۵ از ۲۱"
  size?: number; // Diameter of the ring
  strokeWidth?: number;
}

export default function ProgressRing({
  percentage,
  valueText,
  size = 60,
  strokeWidth = 5,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-slate-200 dark:text-slate-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-xs font-medium text-foreground">
        {valueText}
      </span>
    </div>
  );
}
