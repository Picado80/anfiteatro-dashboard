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
import { groupByAuditor } from "../lib/audit-utils";

interface AuditorPerformanceChartProps {
  audits: ScoredAudit[];
  title?: string;
  limit?: number;
}

export function AuditorPerformanceChart({
  audits,
  title = "Desempeño por Auditor",
  limit = 10,
}: AuditorPerformanceChartProps) {
  const byAuditor = groupByAuditor(audits);

  const data = Object.entries(byAuditor)
    .map(([auditor, records]) => {
      const avgScore = Math.round(
        records.reduce((a, b) => a + b.score, 0) / records.length
      );
      const cumpleCount = records.filter((r) => r.estado === "Cumple").length;
      return {
        auditor,
        score: avgScore,
        cumple: cumpleCount,
        total: records.length,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

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
        {title} (Top {Math.min(limit, data.length)})
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 100, right: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="auditor" type="category" width={100} />
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
          <Bar dataKey="score" fill="#8b5cf6" name="Puntuación Promedio" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
