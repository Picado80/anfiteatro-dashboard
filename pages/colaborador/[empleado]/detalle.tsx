/**
 * Página de detalle de respuestas por pregunta para un colaborador
 * Ruta: /colaborador/[empleado]/detalle
 */

import React, { useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "../../../components/Layout";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useAudits } from "../../../lib/hooks/useAudits";

/**
 * Determina si una respuesta se considera positiva.
 * Acepta valores booleanos, numéricos (1) o strings "sí", "si", "yes".
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

// Mapa de Líderes a Áreas (donde el área completa es su evaluación)
const LEADER_AREA_MAP: Record<string, string> = {
  "chef": "Inventarios",
  "yeiruska": "Administración",
  "stephanie": "Administración",
  "mariela": "Servicio al Cliente",
};

export default function ColaboradorDetalle() {
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
    return audits.filter(
      (a) => (a as any).employee_name?.toLowerCase() === lowerName
    );
  }, [audits, empleado]);

  // Calcular métricas por pregunta
  const questionStats = useMemo(() => {
    const stats: Record<
      string,
      { total: number; positive: number; negative: number }
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

    employeeAudits.forEach((audit) => {
      const resp = (audit as any).responses || {};
      Object.entries(resp).forEach(([question, answer]) => {
        const lowerQ = question.toLowerCase();
        
        // Ignorar preguntas que son claramente metadatos y no evaluables
        if (METADATA_FIELDS.some(meta => lowerQ.includes(meta))) {
          return;
        }

        if (!stats[question]) {
          stats[question] = { total: 0, positive: 0, negative: 0 };
        }
        const pos = isPositive(answer);
        stats[question].total += 1;
        if (pos) stats[question].positive += 1;
        else stats[question].negative += 1;
      });
    });
    // Convertir a array ordenado alfabéticamente
    return Object.entries(stats)
      .map(([question, data]) => ({ question, ...data }))
      .sort((a, b) => a.question.localeCompare(b.question));
  }, [employeeAudits]);

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

    employeeAudits.forEach((audit) => {
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
  }, [employeeAudits]);

  // Calcular promedios de escalas 1 a 5
  const scaleMetrics = useMemo(() => {
    let atencionSum = 0;
    let atencionCount = 0;
    let satisfaccionSum = 0;
    let satisfaccionCount = 0;

    employeeAudits.forEach(audit => {
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
  }, [employeeAudits]);

  if (loading) {
    return (
      <Layout lastRefresh={lastRefresh}>
        <LoadingSpinner size="lg" message="Cargando datos..." />
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
        <title>{displayName} — Detalle de Preguntas</title>
      </Head>

      <div className="space-y-8 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
              Detalle de {displayName}
            </p>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-brand-600 dark:from-white dark:to-brand-400 tracking-tight">
              Respuestas por Pregunta
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={refresh}
              className="inline-flex items-center px-4 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-500 transition-colors"
            >
              🔄 Actualizar
            </button>
            <Link
              href="/dashboard/macro"
              className="inline-flex items-center px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver
            </Link>
          </div>
        </div>

        {/* Tabla de preguntas */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-bold text-slate-600 dark:text-slate-300">Pregunta</th>
                <th className="px-4 py-2 text-center text-sm font-bold text-slate-600 dark:text-slate-300">% Positiva</th>
                <th className="px-4 py-2 text-center text-sm font-bold text-slate-600 dark:text-slate-300">% Negativa</th>
                <th className="px-4 py-2 text-center text-sm font-bold text-slate-600 dark:text-slate-300">Total Respuestas</th>
              </tr>
            </thead>
            <tbody>
              {questionStats.map((q) => {
                const posPct = Math.round((q.positive / q.total) * 100);
                const negPct = Math.round((q.negative / q.total) * 100);
                return (
                  <tr key={q.question} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-2 text-sm text-slate-800 dark:text-slate-200">{q.question}</td>
                    <td className="px-4 py-2 text-center text-sm text-emerald-600 dark:text-emerald-400">{posPct}%</td>
                    <td className="px-4 py-2 text-center text-sm text-rose-600 dark:text-rose-400">{negPct}%</td>
                    <td className="px-4 py-2 text-center text-sm text-slate-600 dark:text-slate-400">{q.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
