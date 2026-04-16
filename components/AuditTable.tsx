import React, { useState } from "react";
import { ScoredAudit } from "../lib/audit-scoring";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../lib/audit-utils";
import { ChevronUp, ChevronDown } from "lucide-react";

interface AuditTableProps {
  audits: ScoredAudit[];
  showAuditor?: boolean;
  showArea?: boolean;
}

type SortField = "timestamp" | "area" | "auditor" | "score" | "estado";
type SortOrder = "asc" | "desc";

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
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

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
        <p className="text-gray-600 dark:text-gray-400">No audits found</p>
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
            {showAuditor && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortButton field="auditor" label="Auditor" />
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <SortButton field="score" label="Score" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <SortButton field="estado" label="Estado" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedAudits.map((audit, idx) => (
            <tr
              key={idx}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                {formatDate(audit.timestamp)}
              </td>
              {showArea && (
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {audit.area || "-"}
                </td>
              )}
              {showAuditor && (
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {audit.auditor || "-"}
                </td>
              )}
              <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {audit.score}%
              </td>
              <td className="px-6 py-4 text-sm">
                <StatusBadge estado={audit.estado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
