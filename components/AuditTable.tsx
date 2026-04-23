import React, { useState } from "react";
import { ScoredAudit } from "../lib/audit-scoring";
import { formatDate } from "../lib/audit-utils";
import { ChevronUp, ChevronDown } from "lucide-react";

interface AuditTableProps {
  audits: ScoredAudit[];
  showAuditor?: boolean;
  showArea?: boolean;
}

type SortField = "timestamp" | "area" | "auditor" | "score" | "auditType";
type SortOrder = "asc" | "desc";

function getScoreColor(score: number, estado: string) {
  if (estado === "Cumple") return { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" };
  if (estado === "Alerta") return { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" };
  return { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-300" };
}

export function AuditTable({ audits, showAuditor = true, showArea = true }: AuditTableProps) {
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedAudits = [...audits].sort((a, b) => {
    let aVal: any = sortField === "auditType" ? (a as any).auditType : (a as any)[sortField];
    let bVal: any = sortField === "auditType" ? (b as any).auditType : (b as any)[sortField];

    if (sortField === "timestamp") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
    >
      {label}
      {renderSortIcon(field)}
    </button>
  );

  if (audits.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">No hay auditorías registradas</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
      <table className="w-full">
        <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <SortButton field="timestamp" label="Fecha" />
            </th>
            {showArea && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortButton field="area" label="Área" />
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <SortButton field="auditType" label="Auditoría" />
            </th>
            {showAuditor && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortButton field="auditor" label="Auditor" />
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <SortButton field="score" label="Score" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedAudits.map((audit, idx) => {
            const colors = getScoreColor(audit.score, audit.estado);
            return (
              <tr
                key={idx}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {formatDate(audit.timestamp)}
                </td>
                {showArea && (
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {audit.area || "-"}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {(audit as any).auditType || "-"}
                </td>
                {showAuditor && (
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {audit.auditor || "-"}
                  </td>
                )}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                    {audit.score}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}