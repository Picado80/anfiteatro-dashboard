import React from "react";
import Link from "next/link";

interface ScoreCardProps {
  area: string;
  score: number;
  count: number;
  cumpleCount: number;
}

export function ScoreCard({ area, score, count, cumpleCount }: ScoreCardProps) {
  const getColor = (score: number) => {
    if (score >= 85) return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
    if (score >= 75) return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" };
    return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
  };

  const colors = getColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Link href={`/areas/${area.toLowerCase()}`}>
      <a
        className={`block p-6 rounded-lg border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-shadow`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {area}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {cumpleCount} de {count} cumple
            </p>
          </div>

          {/* Circular Progress */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-gray-300 dark:text-gray-600"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={colors.text}
              />
            </svg>
            <div className="absolute text-center">
              <div className={`text-3xl font-bold ${colors.text}`}>
                {score}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Score
              </div>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
