import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ErrorBannerProps {
  error: string | null;
  onDismiss?: () => void;
}

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          Error loading audit data
        </p>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
