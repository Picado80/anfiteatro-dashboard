import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ScoredAudit } from "../lib/audit-scoring";
import { format } from "date-fns";

interface AuditTrendChartProps {
  audits: ScoredAudit[];
  days?: number;
  title?: string;
}

export function AuditTrendChart({
  audits,
  days = 30,
  title = "Tendencia de Auditorías",
}: AuditTrendChartProps) {
  // Group audits by date and calculate daily stats
  const dateMap: Record<
    string,
    { cumple: number; alerta: number; noCumple: number; total: number }
  > = {};

  audits.forEach((audit) => {
    const dateKey = format(new Date(audit.timestamp), "yyyy-MM-dd");
    if (!dateMap[dateKey]) {
      dateMap[dateKey] = { cumple: 0, alerta: 0, noCumple: 0, total: 0 };
    }

    if (audit.estado === "Cumple") dateMap[dateKey].cumple++;
    else if (audit.estado === "Alerta") dateMap[dateKey].alerta++;
    else dateMap[dateKey].noCumple++;

    dateMap[dateKey].total++;
  });

  // Convert to array and sort by date
  const data = Object.entries(dateMap)
    .map(([date, stats]) => ({
      date: format(new Date(date), "MMM dd"),
      ...stats,
      complianceRate: Math.round((stats.cumple / stats.total) * 100),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-days);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          Sin datos disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title} (Últimos {days} días)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="cumple"
            stroke="#10b981"
            strokeWidth={2}
            name="Cumple"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="alerta"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Alerta"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="noCumple"
            stroke="#ef4444"
            strokeWidth={2}
            name="No Cumple"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="complianceRate"
            stroke="#3b82f6"
            strokeWidth={2}
            name="% Cumplimiento"
            yAxisId="right"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
