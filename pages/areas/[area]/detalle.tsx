/**
 * Página de detalle de respuestas por pregunta para toda un área
 * Ruta: /areas/[area]/detalle
 */

import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "../../../components/Layout";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { ArrowLeft, RefreshCw, BarChart2, Calendar, Filter, CalendarDays, MessageSquare } from "lucide-react";
import { useAudits } from "../../../lib/hooks/useAudits";

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

/**
 * Determina si una respuesta se considera positiva.
 */
function isPositive(value: any): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();
    return lower === "sí" || lower === "si" || lower === "yes" || lower === "true" || lower === "1";
  }
  return false;
}

export default function AreaDetallePreguntas() {
  const router = useRouter();
  const { area: areaSlug } = router.query;
  const { audits, loading, lastRefresh, refresh } = useAudits();

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

  // Filtros
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");

  // Tipos de servicio fijos del formulario
  const SERVICE_TYPES = ["Restaurante", "Tour", "Sala Romántica", "Evento", "Giras Educativas", "Otro"];

  // Auditorías filtradas para el análisis de preguntas
  const filteredAudits = useMemo(() => {
    return areaAudits.filter((audit) => {
      const d = new Date(audit.timestamp);
      
      // Rango de fechas
      if (startDate && new Date(startDate) > d) return false;
      if (endDate && new Date(endDate) < d) return false;
      
      // Mes / Año
      if (selectedMonth && (d.getMonth() + 1).toString() !== selectedMonth) return false;
      if (selectedYear && d.getFullYear().toString() !== selectedYear) return false;

      // Tipo de servicio
      if (selectedServiceType) {
        const resp = (audit as any).responses || {};
        const serviceTypeValue = Object.entries(resp).find(([q]) =>
          q.toLowerCase().includes("tipo de servicio")
        )?.[1];
        if (!serviceTypeValue || String(serviceTypeValue).trim() !== selectedServiceType) return false;
      }
      
      return true;
    });
  }, [areaAudits, startDate, endDate, selectedMonth, selectedYear, selectedServiceType]);

  // Historial de desempeño agrupado por año y mes
  const historyData = useMemo(() => {
    const years: Record<string, Record<string, number[]>> = {};
    
    areaAudits.forEach(audit => {
      if (audit.raw_score === undefined || audit.raw_score === null) return;
      const d = new Date(audit.timestamp);
      const y = d.getFullYear().toString();
      const m = (d.getMonth() + 1).toString();
      
      if (!years[y]) years[y] = {};
      if (!years[y][m]) years[y][m] = [];
      years[y][m].push(audit.raw_score);
    });

    return Object.entries(years).map(([year, months]) => {
      const monthAvgs: Record<string, number | null> = {};
      let totalSum = 0;
      let totalCount = 0;
      
      for (let i = 1; i <= 12; i++) {
        const m = i.toString();
        if (months[m] && months[m].length > 0) {
          const avg = Math.round(months[m].reduce((a,b)=>a+b,0) / months[m].length);
          monthAvgs[m] = avg;
          totalSum += months[m].reduce((a,b)=>a+b,0);
          totalCount += months[m].length;
        } else {
          monthAvgs[m] = null;
        }
      }
      
      return {
        year,
        months: monthAvgs,
        annualAvg: totalCount > 0 ? Math.round(totalSum / totalCount) : null
      };
    }).sort((a,b) => b.year.localeCompare(a.year)); // Descendente
  }, [areaAudits]);

  // Extraer años únicos para el selector
  const availableYears = useMemo(() => {
    const y = new Set<string>();
    areaAudits.forEach(a => y.add(new Date(a.timestamp).getFullYear().toString()));
    return Array.from(y).sort((a,b) => b.localeCompare(a));
  }, [areaAudits]);

  // Calcular métricas por pregunta
  const questionStats = useMemo(() => {
    const stats: Record<
      string,
      { total: number; positive: number; negative: number; types: Set<string> }
    > = {};
    
    const METADATA_FIELDS = [
      "marca temporal",
      "quién realiza",
      "quien realiza",
      "quién audita",
      "quien audita",
      "qué tipo",
      "que tipo",
      "nombre",
      "auditado",
      "auditor",
      "firma",
      "observacion",
      "observación",
      "detalle",
      "incidencia",
      "asistente",
      "fecha del evento",
      "problemas detectados",
      "nota",
      "satisfaccion general",
      "satisfacción general",
      "atencion a detalles",
      "atención a detalles",
      "tipo de servicio"
    ];

    filteredAudits.forEach((audit) => {
      const resp = (audit as any).responses || {};
      const type = audit.auditType || "General";
      
      Object.entries(resp).forEach(([question, answer]) => {
        const lowerQ = question.toLowerCase();
        
        // Ignorar preguntas que son claramente metadatos y no evaluables
        if (METADATA_FIELDS.some(meta => lowerQ.includes(meta))) {
          return;
        }

        if (!stats[question]) {
          stats[question] = { total: 0, positive: 0, negative: 0, types: new Set() };
        }
        
        const pos = isPositive(answer);
        stats[question].total += 1;
        stats[question].types.add(type);
        if (pos) stats[question].positive += 1;
        else stats[question].negative += 1;
      });
    });
    
    // Convertir a array ordenado (primero las de mayor % negativo para visibilidad)
    return Object.entries(stats)
      .map(([question, data]) => ({ 
        question, 
        ...data, 
        typesArray: Array.from(data.types),
        negativeRate: data.negative / data.total 
      }))
      .sort((a, b) => b.negativeRate - a.negativeRate); // Ordenar por tasa de falla (descendente)
  }, [filteredAudits]);

  // Extraer respuestas de texto/informativas para mostrarlas aparte
  const textInsights = useMemo(() => {
    const insights: Array<{ date: string; type: string; auditor: string; question: string; answer: string }> = [];
    
    const INSIGHT_KEYWORDS = [
      "observacion",
      "observación",
      "detalle",
      "incidencia",
      "problemas detectados",
      "nota"
    ];

    filteredAudits.forEach((audit) => {
      const resp = (audit as any).responses || {};
      const type = audit.auditType || "General";
      const auditor = audit.auditor || "Desconocido";
      const timestampStr = audit.timestamp ? new Date(audit.timestamp).toLocaleDateString("es-CR") : "Fecha desconocida";

      Object.entries(resp).forEach(([question, answer]) => {
        if (!answer || String(answer).trim() === "") return;
        
        const lowerQ = question.toLowerCase();
        const strAnswer = String(answer).trim();
        const lowerA = strAnswer.toLowerCase();
        
        // Excluir respuestas que son solo "Sí", "No", "N/A" o muy cortas
        if (lowerA === "sí" || lowerA === "si" || lowerA === "no" || lowerA === "n/a" || lowerA === "na") {
          return;
        }

        // Excluir preguntas específicas que son de Sí/No aunque contengan la palabra "incidencia"
        if (lowerQ.includes("se documentó incidencia") || lowerQ.includes("se documento incidencia")) {
          return;
        }
        
        // Excluir métricas de escala
        if (lowerQ.includes("atención a detalles") || lowerQ.includes("atencion a detalles") || lowerQ.includes("satisfacción general") || lowerQ.includes("satisfaccion general")) {
           return;
        }

        // Si la pregunta contiene palabras clave de insights, la guardamos
        if (INSIGHT_KEYWORDS.some(kw => lowerQ.includes(kw))) {
           insights.push({ date: timestampStr, type, auditor, question, answer: strAnswer });
        }
      });
    });

    return insights;
  }, [filteredAudits]);

  // Calcular promedios de escalas 1 a 5
  const scaleMetrics = useMemo(() => {
    let atencionSum = 0;
    let atencionCount = 0;
    let satisfaccionSum = 0;
    let satisfaccionCount = 0;

    filteredAudits.forEach(audit => {
      const resp = (audit as any).responses || {};
      Object.entries(resp).forEach(([question, answer]) => {
        const lowerQ = question.toLowerCase();
        const val = Number(answer);
        if (!isNaN(val) && val > 0) {
           if (lowerQ.includes("atención a detalles") || lowerQ.includes("atencion a detalles")) {
              atencionSum += val;
              atencionCount++;
           }
           if (lowerQ.includes("satisfacción general") || lowerQ.includes("satisfaccion general")) {
              satisfaccionSum += val;
              satisfaccionCount++;
           }
        }
      });
    });

    return {
       atencion: atencionCount > 0 ? (atencionSum / atencionCount).toFixed(1) : null,
       satisfaccion: satisfaccionCount > 0 ? (satisfaccionSum / satisfaccionCount).toFixed(1) : null
    };
  }, [filteredAudits]);

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
        <p className="text-center py-20 text-slate-500 dark:text-slate-400">
          Área no encontrada.
        </p>
      </Layout>
    );
  }

  return (
    <Layout lastRefresh={lastRefresh}>
      <Head>
        <title>{areaName} — Análisis de Preguntas</title>
      </Head>

      <div className="space-y-8 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
              Equipo: {areaName}
            </p>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-brand-600 dark:from-white dark:to-brand-400 tracking-tight flex items-center gap-3">
              <BarChart2 className="w-8 h-8 text-brand-500" />
              Análisis por Pregunta
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Basado en {areaAudits.length} auditorías totales
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={refresh}
              className="inline-flex items-center px-4 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-500 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Actualizar
            </button>
            <Link
              href={`/areas/${encodeURIComponent(areaSlug as string)}`}
              className="inline-flex items-center px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver al Área
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Filtros del Análisis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-700 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-700 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Mes</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-700 dark:text-slate-200"
              >
                <option value="">Todos los meses</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Año</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-700 dark:text-slate-200"
              >
                <option value="">Todos los años</option>
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Tipo de Servicio</label>
                <select
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-700 dark:text-slate-200"
                >
                  <option value="">Todos los tipos</option>
                  {SERVICE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
          </div>
          {(startDate || endDate || selectedMonth || selectedYear || selectedServiceType) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSelectedMonth("");
                  setSelectedYear("");
                  setSelectedServiceType("");
                }}
                className="text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors"
              >
                Borrar Filtros
              </button>
            </div>
          )}
        </div>

        {/* Métricas de Satisfacción (Escala 1-5) */}
        {(scaleMetrics.atencion || scaleMetrics.satisfaccion) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scaleMetrics.atencion && (
               <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-2xl">
                     {scaleMetrics.atencion}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Atención a Detalles</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Promedio sobre 5 puntos</p>
                  </div>
               </div>
            )}
            {scaleMetrics.satisfaccion && (
               <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-2xl">
                     {scaleMetrics.satisfaccion}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Satisfacción General</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Promedio sobre 5 puntos</p>
                  </div>
               </div>
            )}
          </div>
        )}

        {/* Tabla de preguntas */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="text-lg font-black text-slate-800 dark:text-white">
              Desglose de cumplimiento (Ordenado por mayor % de fallos)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white dark:bg-slate-800">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">Pregunta / Criterio</th>
                  <th className="px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">% Cumple</th>
                  <th className="px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">% Falla</th>
                  <th className="px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">Respuestas</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800/80 divide-y divide-slate-100 dark:divide-slate-700/50">
                {questionStats.map((q) => {
                  const posPct = Math.round((q.positive / q.total) * 100);
                  const negPct = Math.round((q.negative / q.total) * 100);
                  
                  // Resaltar si tiene más del 30% de fallos
                  const isWarning = negPct >= 30;
                  const isCritical = negPct >= 50;

                  return (
                    <tr key={q.question} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className={`text-sm font-semibold ${isCritical ? "text-rose-700 dark:text-rose-400" : "text-slate-800 dark:text-slate-200"}`}>
                          {q.question}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {q.typesArray.map(t => (
                            <span key={t} className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${posPct}%` }} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-9 text-right">{posPct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div className={`h-full ${isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-slate-400"}`} style={{ width: `${negPct}%` }} />
                          </div>
                          <span className={`text-sm font-bold w-9 text-right ${isCritical ? "text-rose-600" : isWarning ? "text-amber-600" : "text-slate-500"}`}>
                            {negPct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-black text-slate-600 dark:text-slate-300">
                          {q.total}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {questionStats.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                      No hay respuestas detalladas disponibles para esta área todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Historial de Desempeño */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-sm mt-8">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-black text-slate-800 dark:text-white">
              Historial de Resultados Generales
            </h2>
          </div>
          <div className="p-6 overflow-x-auto">
            {historyData.length > 0 ? (
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-4 px-2 text-left text-xs font-black uppercase tracking-widest text-slate-500">AÑO</th>
                    {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map(m => (
                      <th key={m} className="py-4 px-2 text-center text-xs font-black uppercase tracking-widest text-slate-500">{m}</th>
                    ))}
                    <th className="py-4 px-4 text-center text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Promedio<br/>Anual</th>
                    <th className="py-4 px-2 text-center text-xs font-black uppercase tracking-widest text-slate-500">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {historyData.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-2 text-lg font-black text-slate-900 dark:text-white">
                        {row.year}
                      </td>
                      {Array.from({length: 12}).map((_, i) => {
                        const m = (i + 1).toString();
                        const val = row.months[m];
                        return (
                          <td key={m} className="py-4 px-2 text-center">
                            {val !== null ? (
                              <div className="flex flex-col items-center gap-1">
                                <div className={`w-6 h-1.5 rounded-full ${val >= 85 ? "bg-emerald-500" : val >= 75 ? "bg-amber-500" : "bg-rose-500"}`} />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{val}</span>
                              </div>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-4 px-4 text-center">
                        <span className={`text-xl font-black ${
                          row.annualAvg && row.annualAvg >= 85 ? "text-emerald-600 dark:text-emerald-400" : 
                          row.annualAvg && row.annualAvg >= 75 ? "text-amber-600 dark:text-amber-400" : 
                          "text-rose-600 dark:text-rose-400"
                        }`}>
                          {row.annualAvg || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        {row.annualAvg ? (
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                            row.annualAvg >= 85 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                            row.annualAvg >= 75 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                            "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                          }`}>
                            {row.annualAvg >= 85 ? "Alto" : row.annualAvg >= 75 ? "Medio" : "Bajo"}
                          </span>
                        ) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                No hay suficientes datos históricos para mostrar.
              </p>
            )}
          </div>
        </div>

        {/* Observaciones y Textos */}
        {textInsights.length > 0 && (
          <div className="glass-panel rounded-2xl overflow-hidden shadow-sm mt-8">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-black text-slate-800 dark:text-white">
                Observaciones, Detalles y Asistentes
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {textInsights.map((insight, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">{insight.date}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                        {insight.type}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{insight.question}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                      {insight.answer}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 text-right">Reportado por: {insight.auditor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
