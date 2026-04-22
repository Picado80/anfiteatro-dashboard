import React, { useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "../../components/Layout";
import { useAudits } from "../../lib/hooks/useAudits";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorBanner } from "../../components/ErrorBanner";
import { AuditTable } from "../../components/AuditTable";
import {
  filterByAreaAndTipo,
  calculateAreaSummary,
  getLastNDays,
} from "../../lib/audit-utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { RefreshCw } from "lucide-react";

export default function AreaPage() {
  const router = useRouter();
  const { area } = router.query;
  const { audits, loading, error, lastRefresh, refresh } = useAudits();
  const [dismissedError, setDismissedError] = useState(false);

  if (loading || !area) {
    return (
      <Layout lastRefresh={lastRefresh}>
        <LoadingSpinner size="lg" message="Loading area data..." />
      </Layout>
    );
  }

  const areaStr = typeof area === "string" ? area : area[0];
  const areaLabel = areaStr
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const areaAudits = filterByAreaAndTipo(audits, areaLabel);
  const areaSummary = calculateAreaSummary(areaAudits)[areaLabel] || {
    avgScore: 0,
    cumpleCount: 0,
    alertaCount: 0,
    total: 0,
  };

  // Prepare data for charts
  const last30Days = getLastNDays(areaAudits, 30);

  // Score trend data (by week)
  const weeklyData: Record<number, { scores: number[]; week: number }> = {};
  last30Days.forEach((audit) => {
    const date = new Date(audit.timestamp);
    const week = Math.floor(date.getDate() / 7);
    if (!weeklyData[week]) weeklyData[week] = { scores: [], week };
    weeklyData[week].scores.push(audit.score);
  });

  const trendData = Object.values(weeklyData).map((data) => ({
    week: `W${data.week}`,
    avgScore:
      data.scores.length > 0
        ? Math.round(
            data.scores.reduce((a, b) => a + b, 0) / data.scores.length
          )
        : 0,
  }));

  // Status distribution
  const statusData = [
    {
      name: "Cumple",
      value: areaSummary.cumpleCount,
      color: "#10b981",
    },
    {
      name: "Alerta",
      value: areaSummary.alertaCount,
      color: "#f59e0b",
    },
    {
      name: "No cumple",
      value: areaAudits.filter((a) => a.estado === "No cumple").length,
      color: "#ef4444",
    },
  ];

  return (
    <Layout lastRefresh={lastRefresh}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {areaLabel}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Detailed audit metrics and analytics
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

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Promedio Score
            </p>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {areaSummary.avgScore}%
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Auditorías
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
              {areaSummary.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cumplimiento
            </p>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {Math.round(
                (areaSummary.cumpleCount / areaSummary.total) * 100 || 0
              )}
              %
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              En Alerta
            </p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">
              {areaSummary.alertaCount}
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          {trendData.length > 0 && (
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Score Trend (últimos 30 días)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#3b82f6"
                    name="Avg Score"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribución
            </h3>
            {statusData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400">
                No data available
              </p>
            )}
          </div>
        </div>

        {/* Recent Audits Table */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Auditorías Recientes
          </h2>
          <AuditTable
            audits={areaAudits.slice(0, 20)}
            showAuditor={true}
            showArea={false}
          />
        </div>
      </div>
    </Layout>
  );
}
