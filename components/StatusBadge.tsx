import React from "react";
import { getStatusColor } from "../lib/audit-utils";

interface StatusBadgeProps {
  estado: string;
  className?: string;
}

export function StatusBadge({ estado, className = "" }: StatusBadgeProps) {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  const color = getStatusColor(estado);
  const bgColor = colorMap[color] || colorMap.gray;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${className}`}
    >
      {estado}
    </span>
  );
}
