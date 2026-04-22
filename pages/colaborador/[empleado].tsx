/**
 * Página de Dashboard simplificado para cada colaborador
 * Ruta: /colaborador/[empleado]
 */

import React, { useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "../../components/Layout";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ScoreCard } from "../../components/ScoreCard";
import { AuditTable } from "../../components/AuditTable";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useAudits } from "../../lib/hooks/useAudits";
import { calculateCompliance } from "../../lib/audit-utils";

// Mapa de Líderes a Áreas (donde el área completa es su evaluación)
const LEADER_AREA_MAP: Record<string, string> = {
  "chef": "Inventarios",
  "yeiruska": "Administración",
  "stephanie": "Administración",
  "mariela": "Servicio al Cliente",
};

export default function ColaboradorDashboard() {
  const router = useRouter();
  const { empleado } = router.query; // slug
  const { audits, loading, error, lastRefresh, refresh } = useAudits();

  // Filtrar auditorías del colaborador
  const employeeAudits = useMemo(() => {
    if (!empleado) return [];
    const name = Array.isArray(empleado) ? empleado[0] : empleado;
    const lowerName = name.toLowerCase();
    
    // Si es un líder, su evaluación es toda el área
    const leaderArea = LEADER_AREA_MAP[lowerName];
    if (leaderArea) {
      return audits.filter(a => a.area?.toLowerCase() === leaderArea.toLowerCase());
    }

    // Si es un colaborador normal, buscar por employee_name
    return audits.filter((a) => (a as any).employee_name?.toLowerCase() === lowerName);
  }, [audits, empleado]);

  const summary = useMemo(() => {
    if (employeeAudits.length === 0) return null;
    const avgScore = Math.round(
      employeeAudits.reduce((sum, a) => sum + a.score, 0) / employeeAudits.length
    );
    const compliance = calculateCompliance(employeeAudits);
    const total = employeeAudits.length;
    const alerts = employeeAudits.filter((a) => a.estado !== "Cumple").length;
    return { avgScore, compliance, total, alerts };
  }, [employeeAudits]);

  if (loading) {
    return (
      <Layout lastRefresh={lastRefresh}>
        <LoadingSpinner size="lg" message="Cargando datos del colaborador..." />
      </Layout>
    );
  }

  if (!empleado) {
    return (
      <Layout lastRefresh={lastRefresh}>
        <p className="text-center py-20 text-slate-500 dark:text-slate-400">
          No se especificó un colaborador.
        </p>
      </Layout>
    );
  }

  const displayName = Array.isArray(empleado) ? empleado[0] : empleado;

  return (
    <Layout lastRefresh={lastRefresh}>
      <Head>
        <title>{displayName} — Anfiteatro Dashboard</title>
      </Head>

      <div className="space-y-8 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">Colaborador</p>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-brand-600 dark:from-white dark:to-brand-400 tracking-tight">
              {displayName}
            </h1>
            {summary && (
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {summary.total} auditorías · Cumplimiento {summary.compliance}%
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Link
              href={`/colaborador/${encodeURIComponent(displayName)}/detalle`}
              className="inline-flex items-center px-4 py-2.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-bold rounded-xl hover:bg-brand-200 dark:hover:bg-brand-900/50 transition-colors"
            >
              Ver detalle por pregunta
            </Link>
            <button
              onClick={refresh}
              className="inline-flex items-center px-4 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-500 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Actualizar
            </button>
            <Link href="/dashboard/macro" className="inline-flex items-center px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel rounded-2xl p-6 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Score Promedio</p>
              <p className={`text-5xl font-black mt-2 ${summary.avgScore >= 85 ? "text-emerald-600" : summary.avgScore >= 75 ? "text-amber-600" : "text-rose-600"}`}>{summary.avgScore}%</p>
            </div>
            <div className="glass-panel rounded-2xl p-6 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Cumplimiento</p>
              <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{summary.compliance}%</p>
            </div>
            <div className="glass-panel rounded-2xl p-6 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Alertas</p>
              <p className="text-4xl font-black text-rose-600 dark:text-rose-400 mt-2">{summary.alerts}</p>
            </div>
            <div className="glass-panel rounded-2xl p-6 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Auditorías</p>
              <p className="text-4xl font-black text-slate-800 dark:text-white mt-2">{summary.total}</p>
            </div>
          </div>
        )}

        {/* Lista de auditorías */}
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            Registro de Auditorías ({employeeAudits.length})
          </h2>
          <AuditTable audits={employeeAudits} showAuditor={false} showArea={true} />
        </div>
      </div>
    </Layout>
  );
}
