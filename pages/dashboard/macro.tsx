import React, { useState, useMemo } from "react";
import Head from "next/head";
import { Layout } from "../../components/Layout";
import { useAudits } from "../../lib/hooks/useAudits";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorBanner } from "../../components/ErrorBanner";
import { ScoreCard } from "../../components/ScoreCard";
import { AuditTable } from "../../components/AuditTable";
import { StatusBadge } from "../../components/StatusBadge";
import { StatusDistributionChart } from "../../components/StatusDistributionChart";
import { AreaPerformanceChart } from "../../components/AreaPerformanceChart";
import { AuditTrendChart } from "../../components/AuditTrendChart";
import { AuditorPerformanceChart } from "../../components/AuditorPerformanceChart";
import { FilterBar } from "../../components/FilterBar";
import { calculateAreaSummary, getLastNDays, getAreas, getAuditors } from "../../lib/audit-utils";
import { RefreshCw, TrendingDown, AlertTriangle, Bell, CheckCircle } from "lucide-react";

const PREDEFINED_AREAS = [
  "Cavernas",
  "Salón",
  "Cocina",
  "Inventarios",
  "Administración",
  "Servicio al Cliente",
  "Ventas"
];

export default function MacroDashboard() {
  const { audits, loading, error, lastRefresh, refresh } = useAudits();
  const [dismissedError, setDismissedError] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    area: "",
    auditor: "",
    startDate: "",
    endDate: "",
  });
  const [alertStatus, setAlertStatus] = useState<"idle" | "confirming" | "loading" | "done" | "error">("idle");
  const [alertResult, setAlertResult] = useState<{ totalAlerts: number } | null>(null);

  const runAlertCheck = async () => {
    // Si está en estado "confirming" significa que ya confirmó, ejecutar
    if (alertStatus === "confirming") {
      setAlertStatus("loading");
      setAlertResult(null);
      try {
        const res = await fetch("/api/alerts/check");
        const data = await res.json();
        setAlertResult(data.summary || null);
        setAlertStatus("done");
        setTimeout(() => setAlertStatus("idle"), 6000);
      } catch {
        setAlertStatus("error");
        setTimeout(() => setAlertStatus("idle"), 4000);
      }
    } else {
      // Primer clic: pedir confirmación
      setAlertStatus("confirming");
      setTimeout(() => {
        setAlertStatus((prev) => (prev === "confirming" ? "idle" : prev));
      }, 4000); // auto-cancelar si no confirma en 4s
    }
  };

  const cancelAlert = () => setAlertStatus("idle");

  const availableAreas = useMemo(() => getAreas(audits), [audits]);
  const auditors = useMemo(() => getAuditors(audits), [audits]);

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      // Search filter
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
        <LoadingSpinner size="lg" message="Cargando motor de datos Supabase..." />
      </Layout>
    );
  }

  // Calculate summaries based on filtered data
  const areaSummary = calculateAreaSummary(filteredAudits);
  const recentAudits = getLastNDays(filteredAudits, 7);
  const alerts = filteredAudits.filter((a) => a.estado === "Alerta" || a.estado === "No cumple");

  return (
    <Layout lastRefresh={lastRefresh}>
      <Head>
        <title>Dashboard Macro - Anfiteatro</title>
      </Head>
      <div className="space-y-8 animate-fade-in pb-12">
        {/* Header Premium */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-brand-600 dark:from-white dark:to-brand-400 tracking-tight">
              Dashboard Operacional
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Visión integral de cumplimiento y calidad
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            {/* Botón Verificar Alertas — flujo 2 pasos */}
            <div className="flex flex-col items-end gap-1">
              {alertStatus === "confirming" ? (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-2">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">¿Enviar alertas a Wendy y Benito?</span>
                  <button
                    onClick={runAlertCheck}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-lg transition-colors"
                  >
                    Sí, enviar
                  </button>
                  <button
                    onClick={cancelAlert}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-black rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={runAlertCheck}
                  disabled={alertStatus === "loading"}
                  className={`inline-flex items-center px-4 py-2.5 font-bold rounded-xl transition-all duration-200 gap-2 text-sm ${
                    alertStatus === "loading"
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 cursor-wait"
                      : alertStatus === "done"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                      : alertStatus === "error"
                      ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                      : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 hover:bg-amber-100 hover:shadow-md"
                  }`}
                >
                  {alertStatus === "loading" ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Verificando...</>
                  ) : alertStatus === "done" ? (
                    <><CheckCircle className="w-4 h-4" /> {alertResult?.totalAlerts === 0 ? "Sin alertas activas" : `${alertResult?.totalAlerts} alertas enviadas`}</>
                  ) : alertStatus === "error" ? (
                    <><AlertTriangle className="w-4 h-4" /> Error — Reintentar</>
                  ) : (
                    <><Bell className="w-4 h-4" /> Verificar Alertas</>
                  )}
                </button>
              )}
              {alertStatus === "done" && alertResult && alertResult.totalAlerts > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✉ Correos enviados a Wendy y Benito
                </p>
              )}
            </div>
            {/* Botón Sincronizar */}
            <button
              onClick={refresh}
              className="inline-flex items-center px-5 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Sincronizar
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && !dismissedError && (
          <div className="animate-slide-up">
            <ErrorBanner error={error} onDismiss={() => setDismissedError(true)} />
          </div>
        )}

        {/* Filter Bar */}
        <div className="glass-panel rounded-2xl p-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <FilterBar
            areas={availableAreas}
            auditors={auditors}
            onFilterChange={setFilters}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="glass-panel p-6 rounded-2xl">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Auditorías</p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mt-2">{filteredAudits.length}</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="w-16 h-16 bg-emerald-500 rounded-full blur-2xl"></div>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cumple Meta</p>
            <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {filteredAudits.filter((a) => a.estado === "Cumple").length}
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="w-16 h-16 bg-amber-500 rounded-full blur-2xl"></div>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">En Alerta</p>
            <p className="text-4xl font-black text-amber-500 dark:text-amber-400 mt-2">
              {filteredAudits.filter((a) => a.estado === "Alerta").length}
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="w-16 h-16 bg-rose-500 rounded-full blur-2xl"></div>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">No Cumple</p>
            <p className="text-4xl font-black text-rose-600 dark:text-rose-400 mt-2">
              {filteredAudits.filter((a) => a.estado === "No cumple").length}
            </p>
          </div>
        </div>

        {/* Area Cards */}
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
            Desempeño por Área
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {PREDEFINED_AREAS.map((area) => {
              const isVentas = area === "Ventas";
              // Normalize area string to match with the mapped values in /api/audits
              // Ensure we check for the exact map keys, sometimes they have accents.
              const summaryKey = Object.keys(areaSummary).find(k => k.toLowerCase() === area.toLowerCase());
              const summary = summaryKey ? areaSummary[summaryKey] : { avgScore: 0, total: 0, cumpleCount: 0 };
              
              return (
                <ScoreCard
                  key={area}
                  area={area}
                  score={summary.avgScore}
                  count={summary.total}
                  cumpleCount={summary.cumpleCount}
                  isDisabled={isVentas}
                />
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
            <StatusDistributionChart audits={filteredAudits} />
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
            <AuditTrendChart audits={filteredAudits} days={30} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
              <AreaPerformanceChart audits={filteredAudits} />
            </div>
            <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
              <AuditorPerformanceChart audits={filteredAudits} limit={10} />
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              Alertas Activas ({alerts.length})
            </h2>
            <div className="glass-panel rounded-2xl divide-y divide-slate-200 dark:divide-slate-700/50">
              {alerts.slice(0, 8).map((alert, idx) => (
                <div key={idx} className="p-5 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Área + Tipo de Auditoría */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-base">
                        {alert.area}
                      </span>
                      {alert.auditType && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {alert.auditType}
                        </span>
                      )}
                    </div>

                    {/* Responsable del área */}
                    <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        👤 Auditor:
                      </span>
                      <span className={alert.auditor ? "text-slate-700 dark:text-slate-200" : "italic text-slate-400"}>
                        {alert.auditor || "No registrado en el formulario"}
                      </span>
                    </div>

                    {/* Puntuación y Fecha */}
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded font-mono font-semibold">
                        Puntuación: {alert.score}%
                      </span>
                      <span>
                        📅 {new Date(alert.timestamp).toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    <StatusBadge estado={alert.estado} />
                  </div>
                </div>
              ))}
            </div>
            {alerts.length > 8 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 pl-2 font-medium">
                +{alerts.length - 8} alertas adicionales. Usá los filtros para explorarlas por área o auditor.
              </p>
            )}
          </div>
        )}

        {/* Phase 4 Preparation Mockup */}
        <div className="mt-16 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-rose-500" />
            Atención Requerida (Banderas Rojas)
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Próximamente Fase 4
            </span>
          </h2>
          <div className="glass-panel rounded-2xl p-8 border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="text-center max-w-2xl mx-auto">
              <div className="mx-auto w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sistema Inteligente de Detección</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                En la Fase 4, este espacio mostrará automáticamente los equipos y líderes que han mantenido un desempeño deficiente durante más de 2 meses consecutivos, permitiendo a Wendy y Benito intervenir proactivamente mediante el sistema de comentarios.
              </p>
              <div className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 opacity-70 cursor-not-allowed">
                Módulo en Construcción
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
