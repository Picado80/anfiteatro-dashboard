import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { useAudits } from "../lib/hooks/useAudits";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBanner } from "../components/ErrorBanner";
import { ScoreCard } from "../components/ScoreCard";
import { AuditTable } from "../components/AuditTable";
import { StatusBadge } from "../components/StatusBadge";
import {
  calculateAreaSummary,
  getLastNDays,
  filterByAreaAndTipo,
} from "../lib/audit-utils";
import { RefreshCw } from "lucide-react";

export default function Home() {
  const { audits, loading, error, lastRefresh, refresh } = useAudits();
  const [dismissedError, setDismissedError] = useState(false);

  if (loading) {
    return (
      <Layout lastRefresh={lastRefresh}>
        <LoadingSpinner size="lg" message="Loading audit data..." />
      </Layout>
    );
  }

  const areaSummary = calculateAreaSummary(audits);
  const areas = Object.keys(areaSummary).sort();

  // Get recent audits (last 7 days)
  const recentAudits = getLastNDays(audits, 7);

  // Get alerts (Alerta or No cumple)
  const alerts = audits.filter(
    (a) => a.estado === "Alerta" || a.estado === "No cumple"
  );

  return (
    <Layout lastRefresh={lastRefresh}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Resumen General
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Overview de auditorías por área
            </p>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Error Banner */}
        {error && !dismissedError && (
          <ErrorBanner
            error={error}
            onDismiss={() => setDismissedError(true)}
          />
        )}

        {/* Area Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Áreas de Auditoría
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {areas.map((area) => {
              const summary = areaSummary[area];
              return (
                <ScoreCard
                  key={area}
                  area={area}
                  score={summary.avgScore}
                  count={summary.total}
                  cumpleCount={summary.cumpleCount}
                />
              );
            })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Auditorías
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {audits.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cumple
            </p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {audits.filter((a) => a.estado === "Cumple").length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              En Alerta
            </p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {audits.filter((a) => a.estado === "Alerta").length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No Cumple
            </p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {audits.filter((a) => a.estado === "No cumple").length}
            </p>
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Alertas Activas ({alerts.length})
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              {alerts.slice(0, 5).map((alert, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {alert.area} - {alert.auditor}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Puntuación: {alert.score}%
                    </p>
                  </div>
                  <StatusBadge estado={alert.estado} />
                </div>
              ))}
            </div>
            {alerts.length > 5 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                +{alerts.length - 5} más alertas
              </p>
            )}
          </div>
        )}

        {/* Recent Audits */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Auditorías Recientes (últimos 7 días)
          </h2>
          <AuditTable
            audits={recentAudits.slice(0, 10)}
            showAuditor={true}
            showArea={true}
          />
        </div>
      </div>
    </Layout>
  );
}
