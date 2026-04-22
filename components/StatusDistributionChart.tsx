import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ScoredAudit } from "../lib/audit-scoring";

interface StatusDistributionChartProps {
  audits: ScoredAudit[];
  title?: string;
}

export function StatusDistributionChart({
  audits,
  title = "Distribución de Estado",
}: StatusDistributionChartProps) {
  const cumple = audits.filter((a) => a.estado === "Cumple").length;
  const alerta = audits.filter((a) => a.estado === "Alerta").length;
  const noCumple = audits.filter((a) => a.estado === "No cumple").length;

  const data = [
    { name: "Cumple", value: cumple, fill: "#10b981" },
    { name: "Alerta", value: alerta, fill: "#f59e0b" },
    { name: "No Cumple", value: noCumple, fill: "#ef4444" },
  ].filter((item) => item.value > 0);

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
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) =>
              `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value, "Cantidad"]}
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Cumple</p>
          <p className="text-2xl font-bold text-green-600">{cumple}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Alerta</p>
          <p className="text-2xl font-bold text-yellow-600">{alerta}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">No Cumple</p>
          <p className="text-2xl font-bold text-red-600">{noCumple}</p>
        </div>
      </div>
    </div>
  );
}
