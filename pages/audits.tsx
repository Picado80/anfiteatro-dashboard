import React, { useState, useMemo } from "react";
import { Layout } from "../components/Layout";
import { useAudits } from "../lib/hooks/useAudits";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBanner } from "../components/ErrorBanner";
import { FilterBar } from "../components/FilterBar";
import { AuditTable } from "../components/AuditTable";
import { getAreas, getAuditors } from "../lib/audit-utils";

export default function AuditsPage() {
  const { audits, loading, error, lastRefresh } = useAudits();
  const [dismissedError, setDismissedError] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    area: "",
    auditor: "",
    startDate: "",
    endDate: "",
  });

  const areas = useMemo(() => getAreas(audits), [audits]);
  const auditors = useMemo(() => getAuditors(audits), [audits]);

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      // Search filter (matches area, auditor, or score)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          audit.area?.toLowerCase().includes(searchLower) ||
          audit.auditor?.toLowerCase().includes(searchLower) ||
          audit.score.toString().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Area filter
      if (filters.area && audit.area !== filters.area) return false;

      // Auditor filter
      if (filters.auditor && audit.auditor !== filters.auditor) return false;

      // Date range filter
      if (filters.startDate) {
        const auditDate = new Date(audit.timestamp).toISOString().split("T")[0];
        if (auditDate < filters.startDate) return false;
      }

      if (filters.endDate) {
        const auditDate = new Date(audit.timestamp).toISOString().split("T")[0];
        if (auditDate > filters.endDate) return false;
      }

      return true;
    });
  }, [audits, filters]);

  if (loading) {
    return (
      <Layout lastRefresh={lastRefresh}>
        <LoadingSpinner size="lg" message="Loading audit data..." />
      </Layout>
    );
  }

  return (
    <Layout lastRefresh={lastRefresh}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Auditorías
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Registro completo de auditorías
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total auditorías
            </p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {filteredAudits.length}
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && !dismissedError && (
          <ErrorBanner
            error={error}
            onDismiss={() => setDismissedError(true)}
          />
        )}

        {/* Filter Bar */}
        <FilterBar
          areas={areas}
          auditors={auditors}
          onFilterChange={setFilters}
        />

        {/* Audits Table */}
        <AuditTable audits={filteredAudits} showAuditor={true} showArea={true} />
      </div>
    </Layout>
  );
}
