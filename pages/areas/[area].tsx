import React, { useState, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Layout } from "../../components/Layout";
import { useAudits } from "../../lib/hooks/useAudits";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { AuditTable } from "../../components/AuditTable";
import { AuditTrendChart } from "../../components/AuditTrendChart";
import { calculateCompliance } from "../../lib/audit-utils";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Users, ClipboardCheck, Award } from "lucide-react";
import Link from "next/link";

// Mapa de nombres "slug" (URL) a nombre canónico del área
const AREA_SLUG_MAP: Record<string, string> = {
  "cavernas": "Cavernas",
  "salón": "Salón",
  "salon": "Salón",
  "cocina": "Cocina",
  "inventarios": "Inventarios",
  "administración": "Administración",
  "administracion": "Administración",
  "servicio al cliente": "Servicio al Cliente",
  "ventas": "Ventas",
};

function getTrendIcon(score: number, threshold: number) {
  if (score >= threshold) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (score >= threshold * 0.88) return <Minus className="w-4 h-4 text-amber-500" />;
  return <TrendingDown className="w-4 h-4 text-rose-500" />;
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 75) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function getScoreBg(score: number) {
  if (score >= 85) return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-800/50";
  if (score >= 75) return "bg-amber-50 dark:bg-amber-900/20 border-amber-200/60 dark:border-amber-800/50";
  return "bg-rose-50 dark:bg-rose-900/20 border-rose-200/60 dark:border-rose-800/50";
}

export default function AreaDetailPage() {
  const router = useRouter();
  const { area: areaSlug } = router.query;
  const { audits, loading, lastRefresh, refresh } = useAudits();

  const [selectedTipo, setSelectedTipo] = useState<string>("__all__");
  const [sortBy, setSortBy] = useState<"score" | "name" | "count">("score");

  // Resolver nombre canónico del área
  const areaName = useMemo(() => {
    if (!areaSlug) return null;
    const slug = Array.isArray(areaSlug) ? areaSlug[0] : areaSlug;
    return AREA_SLUG_MAP[slug.toLowerCase()] || slug;
  }, [areaSlug]);

  // Auditorías de esta área
  const areaAudits = useMemo(() => {
    if (!areaName) return [];
    return audits.filter((a) => a.area?.toLowerCase() === areaName.toLowerCase());
  }, [audits, areaName]);

  // Tipos de auditoría únicos dentro del área
  const auditTypes = useMemo(() => {
    const types = new Set<string>();
    areaAudits.forEach((a) => { if (a.auditType) types.add(a.auditType); });
    return Array.from(types).sort();
  }, [areaAudits]);

  // Auditorías filtradas por tipo seleccionado
  const filteredAudits = useMemo(() => {
    if (selectedTipo === "__all__") return areaAudits;
    return areaAudits.filter((a) => a.auditType === selectedTipo);
  }, [areaAudits, selectedTipo]);

  // Determinar si el área tiene datos de colaboradores individuales
  const hasEmployeeData = useMemo(() =>
    filteredAudits.some((a) => (a as any).employee_name),
  [filteredAudits]);

  // Ranking: si hay employee_name usa colaboradores, si no, usa auditor
  const auditorRanking = useMemo(() => {
    // Agrupar por el campo más específico disponible
    const grouped: Record<string, typeof filteredAudits> = {};
    filteredAudits.forEach((audit) => {
      const key = (audit as any).employee_name || audit.auditor || "Sin registrar";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(audit);
    });

    return Object.entries(grouped)
      .map(([name, records]) => ({
        name: name === "null" ? "Sin registrar" : name,
        isEmployee: hasEmployeeData && records.some((r) => (r as any).employee_name),
        count: records.length,
        avgScore: Math.round(records.reduce((a, b) => a + b.score, 0) / records.length),
        cumple: records.filter((r) => r.estado === "Cumple").length,
        alerta: records.filter((r) => r.estado === "Alerta").length,
        noCumple: records.filter((r) => r.estado === "No cumple").length,
        lastAudit: records.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0]?.timestamp,
      }))
      .sort((a, b) => {
        if (sortBy === "score") return b.avgScore - a.avgScore;
        if (sortBy === "count") return b.count - a.count;
        return a.name.localeCompare(b.name);
      });
  }, [filteredAudits, sortBy, hasEmployeeData]);

  // KPIs del área
  const kpis = useMemo(() => ({
    total: filteredAudits.length,
    cumple: filteredAudits.filter((a) => a.estado === "Cumple").length,
    alerta: filteredAudits.filter((a) => a.estado === "Alerta").length,
    noCumple: filteredAudits.filter((a) => a.estado === "No cumple").length,
    avgScore: filteredAudits.length > 0
      ? Math.round(filteredAudits.reduce((a, b) => a + b.score, 0) / filteredAudits.length)
      : 0,
    compliance: calculateCompliance(filteredAudits),
  }), [filteredAudits]);

  if (loading) {
    return (
      <Layout lastRefresh={lastRefresh}>
        <LoadingSpinner size="lg" message="Cargando datos del área..." />
      </Layout>
    );
  }

  if (!areaName) {
    return (
      <Layout lastRefresh={lastRefresh}>
        <div className="text-center py-20">
          <p className="text-slate-500 dark:text-slate-400 text-lg">Área no encontrada.</p>
          <Link href="/dashboard/macro" className="mt-4 inline-block text-brand-600 font-bold underline">
            Volver al resumen
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout lastRefresh={lastRefresh}>
      <Head>
        <title>{areaName} — Anfiteatro Dashboard</title>
      </Head>

      <div className="space-y-8 animate-fade-in pb-16">

        {/* Breadcrumb + Header */}
        <div>
          <Link
            href="/dashboard/macro"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">Área</p>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-brand-600 dark:from-white dark:to-brand-400 tracking-tight">
                {areaName}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {areaAudits.length} auditorías totales · {auditorRanking.length} auditores
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <Link
                href={`/areas/${encodeURIComponent(areaSlug as string)}/detalle`}
                className="inline-flex items-center px-4 py-2.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-bold rounded-xl hover:bg-brand-200 dark:hover:bg-brand-900/50 transition-colors text-sm"
              >
                Análisis de Preguntas
              </Link>
              <button
                onClick={refresh}
                className="inline-flex items-center px-4 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-500 hover:shadow-lg transition-all duration-200 gap-2 text-sm"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabs por Tipo de Auditoría */}
        {auditTypes.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTipo("__all__")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                selectedTipo === "__all__"
                  ? "bg-brand-600 text-white shadow-md"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-brand-400"
              }`}
            >
              Todos los tipos
            </button>
            {auditTypes.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setSelectedTipo(tipo)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  selectedTipo === tipo
                    ? "bg-brand-600 text-white shadow-md"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-brand-400"
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Score promedio — destaque */}
          <div className={`col-span-2 md:col-span-1 glass-panel rounded-2xl p-6 border-2 ${getScoreBg(kpis.avgScore)}`}>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Score Promedio</p>
            <p className={`text-5xl font-black mt-2 ${getScoreColor(kpis.avgScore)}`}>{kpis.avgScore}%</p>
            <div className="mt-2 flex items-center gap-1">
              {getTrendIcon(kpis.avgScore, 85)}
              <span className="text-xs font-semibold text-slate-500">{kpis.compliance}% cumple meta</span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Total</p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mt-2">{kpis.total}</p>
            <p className="text-xs text-slate-400 mt-1">auditorías</p>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Cumple</p>
            <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{kpis.cumple}</p>
            <p className="text-xs text-slate-400 mt-1">dentro de meta</p>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Alerta</p>
            <p className="text-4xl font-black text-amber-500 dark:text-amber-400 mt-2">{kpis.alerta}</p>
            <p className="text-xs text-slate-400 mt-1">por debajo</p>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">No Cumple</p>
            <p className="text-4xl font-black text-rose-600 dark:text-rose-400 mt-2">{kpis.noCumple}</p>
            <p className="text-xs text-slate-400 mt-1">requieren atención</p>
          </div>
        </div>

        {/* Ranking de Auditores */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-500" />
              {hasEmployeeData ? "Desempeño por Colaborador" : "Desempeño por Auditor"}
              {hasEmployeeData && (
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700">
                  Resultados Individuales
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ordenar por:</span>
              {(["score", "count", "name"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-200 ${
                    sortBy === opt
                      ? "bg-brand-600 text-white"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {opt === "score" ? "Score" : opt === "count" ? "Cantidad" : "Nombre"}
                </button>
              ))}
            </div>
          </div>

          {auditorRanking.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium">No hay auditores registrados para este período.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditorRanking.map((auditor, idx) => {
                const barWidth = `${auditor.avgScore}%`;
                const isTop = idx === 0;
                return (
                  <div
                    key={auditor.name}
                    className={`glass-panel rounded-2xl p-5 border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                      isTop ? "border-amber-300/50 dark:border-amber-700/50" : "border-transparent"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Posición + Nombre */}
                      <div className="flex items-center gap-4 flex-shrink-0 min-w-0 sm:w-64">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                          idx === 0 ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" :
                          idx === 1 ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300" :
                          idx === 2 ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" :
                          "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 dark:text-white truncate flex items-center gap-2">
                            <Link href={`/colaborador/${encodeURIComponent(auditor.name)}`} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                              {auditor.name}
                            </Link>
                            {isTop && <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {auditor.count} auditorías
                            {auditor.lastAudit && ` · Última: ${new Date(auditor.lastAudit).toLocaleDateString("es-CR", { day: "2-digit", month: "short" })}`}
                          </p>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                auditor.avgScore >= 85 ? "bg-emerald-500" :
                                auditor.avgScore >= 75 ? "bg-amber-500" : "bg-rose-500"
                              }`}
                              style={{ width: barWidth }}
                            />
                          </div>
                          <span className={`text-xl font-black flex-shrink-0 w-16 text-right ${getScoreColor(auditor.avgScore)}`}>
                            {auditor.avgScore}%
                          </span>
                        </div>
                      </div>

                      {/* Estado badges compactos */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {auditor.cumple > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                            ✓ {auditor.cumple}
                          </span>
                        )}
                        {auditor.alerta > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-black">
                            ⚠ {auditor.alerta}
                          </span>
                        )}
                        {auditor.noCumple > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-black">
                            ✗ {auditor.noCumple}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tendencia del Área */}
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-500" />
            Tendencia Histórica
          </h2>
          <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
            <AuditTrendChart audits={filteredAudits} days={60} title={`Tendencia en ${areaName}`} />
          </div>
        </div>

        {/* Tabla de Auditorías */}
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-brand-500" />
            Registro Completo
            <span className="ml-2 text-base font-semibold text-slate-400">({filteredAudits.length})</span>
          </h2>
          <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
            <AuditTable audits={filteredAudits} showAuditor={true} showArea={false} />
          </div>
        </div>

      </div>
    </Layout>
  );
}
