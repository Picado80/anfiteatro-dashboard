import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ScoredAudit } from "../lib/audit-scoring";

interface StatusDistributionChartProps {
  audits: ScoredAudit[];
  title?: string;
}

// Label custom renderizada DENTRO de cada slice
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
  if (percent < 0.05) return null; // No mostrar si es muy pequeño
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x} y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontWeight="800"
      fontSize={14}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function StatusDistributionChart({
  audits,
  title = "Distribución de Estado",
}: StatusDistributionChartProps) {
  const cumple = audits.filter((a) => a.estado === "Cumple").length;
  const alerta = audits.filter((a) => a.estado === "Alerta").length;
  const noCumple = audits.filter((a) => a.estado === "No cumple").length;
  const total = audits.length;

  const data = [
    { name: "Cumple", value: cumple, fill: "#10b981", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
    { name: "En Alerta", value: alerta, fill: "#f59e0b", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
    { name: "No Cumple", value: noCumple, fill: "#ef4444", bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">Sin datos disponibles</p>
      </div>
    );
  }

  // Porcentaje de cumplimiento global para el centro del donut
  const complianceRate = total > 0 ? Math.round((cumple / total) * 100) : 0;

  return (
    <div className="p-8">
      {/* Título */}
      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-8 tracking-tight">
        {title}
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Donut GRUESO con total en el centro */}
        <div className="relative w-64 h-64 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={75}    // Donut más grande
                outerRadius={115}   // Grosor = 40 (mucho más relleno)
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [value, name]}
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  color: "#f1f5f9",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Texto central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-black text-slate-800 dark:text-white">{complianceRate}%</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Cumple</span>
          </div>
        </div>

        {/* Leyenda premium a la derecha */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          {data.map((item) => (
            <div key={item.name} className={`flex items-center justify-between p-4 rounded-2xl ${item.bg}`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${item.dot} flex-shrink-0`} />
                <span className={`text-base font-bold ${item.text}`}>{item.name}</span>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-black ${item.text}`}>{item.value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : "0%"} del total
                </p>
              </div>
            </div>
          ))}

          {/* Total global */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-slate-400 dark:bg-slate-500 flex-shrink-0" />
              <span className="text-base font-bold text-slate-600 dark:text-slate-300">Total General</span>
            </div>
            <p className="text-3xl font-black text-slate-800 dark:text-white">{total}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
