import React, { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BarChart3, Clock, Home } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  lastRefresh?: Date;
}

export function Layout({ children, lastRefresh }: LayoutProps) {
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  const formatRefreshTime = (date?: Date) => {
    if (!date) return "Never";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Anfiteatro Villa
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Audit Dashboard
          </p>
        </div>

        <div className="px-3 py-2 space-y-1">
          <Link
            href="/"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              isActive("/")
                ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Home className="w-4 h-4 mr-3" />
            Resumen General
          </Link>

          <div className="pt-2 pb-1">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Áreas
            </p>
          </div>

          {["Cavernas", "Salón", "Cocina", "Inventarios", "Administración"].map(
            (area) => (
              <Link
                key={area}
                href={`/areas/${area.toLowerCase()}`}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(`/areas/${area.toLowerCase()}`)
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                {area}
              </Link>
            )
          )}

          <div className="pt-2 pb-1">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Registros
            </p>
          </div>

          <Link
            href="/audits"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              isActive("/audits")
                ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-3" />
            Auditorías Completadas
          </Link>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-64">
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <Clock className="w-3 h-3 mr-2" />
            <span>Última actualización: {formatRefreshTime(lastRefresh)}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
