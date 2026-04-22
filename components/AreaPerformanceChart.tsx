import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ScoredAudit } from "../lib/audit-scoring";
import { calculateAreaSummary } from "../lib/audit-utils";

interface AreaPerformanceChartProps {
  audits: ScoredAudit[];
  title?: string;
}

export function AreaPerformanceChart({
  audits,
  title = "Desempeño por Área",
}: AreaPerformanceChartProps) {
  const areaSummary = calculateAreaSummary(audits);
  const areas = Object.keys(areaSummary)
    .sort()
    .map((area) => ({
      area,
      score: areaSummary[area].avgScore,
      cumple: areaSummary[area].cumpleCount,
      total: areaSummary[area].total,
    }));

  if (areas.length === 0) {
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
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={areas} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="area" type="category" width={150} />
          <Tooltip
            formatter={(value: any) => [
              typeof value === "number" ? `${value}%` : value,
            ]}
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Legend />
          <Bar dataKey="score" fill="#3b82f6" name="Puntuación Promedio" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-6 grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
        {areas.map((area) => (
          <div key={area.area} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {area.area}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {area.cumple}/{area.total} cumple
              </span>
              <span className="text-lg font-bold text-blue-600">
                {area.score}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
