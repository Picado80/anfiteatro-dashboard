/**
 /**
 * MOTOR DE DETECCIÓN DE ALERTAS
 * Analiza los datos de Supabase y detecta 3 tipos de condiciones de alerta.
 */
import { getServiceSupabase } from "../database";
import {
  SCORE_THRESHOLDS,
  NEGATIVE_RESPONSE_RATE,
  AUDIT_FREQUENCIES,
  NEGATIVE_RESPONSE_VALUES,
  POSITIVE_RESPONSE_VALUES,
} from "./config";
// ─── Tipos de Alerta ─────────────────────────────────────────────────────────

export interface Alert1_RedFlag {
  type: "red_flag_collaborator";
  collaborator: string;    // Nombre del colaborador
  area: string;
  month1: { label: string; avgScore: number; count: number };
  month2: { label: string; avgScore: number; count: number };
  trend: number;           // Diferencia entre mes 1 y 2 (negativo = empeora)
}

export interface Alert2_NegativeQuestions {
  type: "negative_questions";
  area: string;
  auditType: string;
  question: string;        // Texto de la pregunta problemática
  negativeRate: number;    // 0-1 (ej. 0.7 = 70% negativos)
  totalAudits: number;
  negativeCount: number;
  month: string;
}

export interface Alert3_FrequencyMissed {
  type: "frequency_missed";
  area: string;
  expectedCount: number;
  actualCount: number;
  periodLabel: string;     // "semana del 15 al 21 de abril"
  responsibles: string[];
  auditorsFound: string[]; // Quiénes sí auditaron (aunque sea poco)
  deficit: number;         // expectedCount - actualCount
}

export type AnyAlert = Alert1_RedFlag | Alert2_NegativeQuestions | Alert3_FrequencyMissed;

// ─── Utilidades ──────────────────────────────────────────────────────────────

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("es-CR", { month: "long", year: "numeric" });
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function isNegativeResponse(value: string | null | undefined): boolean {
  if (!value) return false;
  const v = String(value).toLowerCase().trim();
  return NEGATIVE_RESPONSE_VALUES.some((neg) => v === neg || v.startsWith(neg));
}

function isPositiveResponse(value: string | null | undefined): boolean {
  if (!value) return false;
  const v = String(value).toLowerCase().trim();
  return POSITIVE_RESPONSE_VALUES.some((pos) => v === pos || v.startsWith(pos));
}

// ─── ALERTA 1: Colaborador bajo la meta por 2 meses consecutivos ─────────────

export async function detectRedFlagCollaborators(): Promise<Alert1_RedFlag[]> {
  const supabase = getServiceSupabase();
  const alerts: Alert1_RedFlag[] = [];

  // Obtener auditorías de los últimos 3 meses
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const { data: audits, error } = await supabase
    .from("audits")
    .select("timestamp, employee_name, auditor, area, raw_score")
    .gte("timestamp", threeMonthsAgo.toISOString())
    .order("timestamp", { ascending: true });

  if (error || !audits) return [];

  // Agrupar por colaborador
  const byCollaborator: Record<string, { area: string; monthlyScores: Record<string, number[]> }> = {};

  audits.forEach((audit) => {
    const person = (audit as any).employee_name || audit.auditor;
    if (!person) return;

    const area = audit.area || "Desconocida";
    const monthKey = getMonthKey(new Date(audit.timestamp));
    const score = Number(audit.raw_score || 0);
    const key = `${person}::${area}`;

    if (!byCollaborator[key]) {
      byCollaborator[key] = { area, monthlyScores: {} };
    }
    if (!byCollaborator[key].monthlyScores[monthKey]) {
      byCollaborator[key].monthlyScores[monthKey] = [];
    }
    byCollaborator[key].monthlyScores[monthKey].push(score);
  });

  // Revisar los últimos 2 meses para cada colaborador
  const now = new Date();
  const month2 = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const month1 = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const key2 = getMonthKey(month2);
  const key1 = getMonthKey(month1);

  for (const [personKey, data] of Object.entries(byCollaborator)) {
    const [collaborator, area] = personKey.split("::");
    const scores1 = data.monthlyScores[key1];
    const scores2 = data.monthlyScores[key2];

    if (!scores1 || !scores2) continue; // Sin datos suficientes

    const avg1 = Math.round(scores1.reduce((a, b) => a + b, 0) / scores1.length);
    const avg2 = Math.round(scores2.reduce((a, b) => a + b, 0) / scores2.length);

    // Si AMBOS meses están por debajo de la meta → Bandera Roja
    if (avg1 < SCORE_THRESHOLDS.cumple && avg2 < SCORE_THRESHOLDS.cumple) {
      alerts.push({
        type: "red_flag_collaborator",
        collaborator,
        area,
        month1: { label: getMonthLabel(month1), avgScore: avg1, count: scores1.length },
        month2: { label: getMonthLabel(month2), avgScore: avg2, count: scores2.length },
        trend: avg2 - avg1,
      });
    }
  }

  return alerts;
}

// ─── ALERTA 2: Preguntas con alta tasa de respuestas negativas ───────────────

export async function detectNegativeQuestions(): Promise<Alert2_NegativeQuestions[]> {
  const supabase = getServiceSupabase();
  const alerts: Alert2_NegativeQuestions[] = [];

  // Auditorías del mes actual
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const { data: audits, error } = await supabase
    .from("audits")
    .select("area, audit_type, responses, timestamp")
    .gte("timestamp", firstOfMonth.toISOString());

  if (error || !audits || audits.length === 0) return [];

  // Agrupar por tipo de auditoría
  const byType: Record<string, { area: string; auditType: string; questionScores: Record<string, { pos: number; neg: number }> }> = {};

  audits.forEach((audit) => {
    const key = `${audit.area}::${audit.audit_type}`;
    if (!byType[key]) {
      byType[key] = { area: audit.area, auditType: audit.audit_type, questionScores: {} };
    }

    const responses = audit.responses as Record<string, any>;
    for (const [question, answer] of Object.entries(responses)) {
      // Saltar campos que no son preguntas de sí/no
      const lowerQ = question.toLowerCase();
      if (lowerQ.includes("marca temporal") || lowerQ.includes("fecha") ||
        lowerQ.includes("auditor") || lowerQ.includes("nombre") ||
        lowerQ.includes("colaborador") || lowerQ.includes("mesero")) {
        continue;
      }

      if (!byType[key].questionScores[question]) {
        byType[key].questionScores[question] = { pos: 0, neg: 0 };
      }

      if (isNegativeResponse(String(answer))) {
        byType[key].questionScores[question].neg++;
      } else if (isPositiveResponse(String(answer))) {
        byType[key].questionScores[question].pos++;
      }
    }
  });

  const monthLabel = firstOfMonth.toLocaleDateString("es-CR", { month: "long", year: "numeric" });

  for (const [, data] of Object.entries(byType)) {
    for (const [question, scores] of Object.entries(data.questionScores)) {
      const total = scores.pos + scores.neg;
      if (total < 3) continue; // Necesitamos al menos 3 respuestas para la estadística

      const negRate = scores.neg / total;
      if (negRate >= NEGATIVE_RESPONSE_RATE) {
        alerts.push({
          type: "negative_questions",
          area: data.area,
          auditType: data.auditType,
          question,
          negativeRate: negRate,
          totalAudits: total,
          negativeCount: scores.neg,
          month: monthLabel,
        });
      }
    }
  }

  return alerts;
}

// ─── ALERTA 3: Auditoría no completada en el período ─────────────────────────

export async function detectFrequencyMissed(): Promise<Alert3_FrequencyMissed[]> {
  const supabase = getServiceSupabase();
  const alerts: Alert3_FrequencyMissed[] = [];

  // Semana actual (lunes a hoy)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Dom, 1=Lun...
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);

  const periodLabel = `semana del ${monday.toLocaleDateString("es-CR", { day: "2-digit", month: "short" })} al ${now.toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" })}`;

  // Contar auditorías por área en la semana
  const { data: weekAudits, error } = await supabase
    .from("audits")
    .select("area, auditor")
    .gte("timestamp", monday.toISOString());

  if (error) return [];

  // También contar por mes para auditorías mensuales
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const { data: monthAudits, error: monthError } = await supabase
    .from("audits")
    .select("area, auditor")
    .gte("timestamp", firstOfMonth.toISOString());

  if (monthError) return [];

  // Contar por área
  const weekCountByArea: Record<string, { count: number; auditors: Set<string> }> = {};
  (weekAudits || []).forEach((a) => {
    if (!weekCountByArea[a.area]) weekCountByArea[a.area] = { count: 0, auditors: new Set() };
    weekCountByArea[a.area].count++;
    if (a.auditor) weekCountByArea[a.area].auditors.add(a.auditor);
  });

  const monthCountByArea: Record<string, { count: number; auditors: Set<string> }> = {};
  (monthAudits || []).forEach((a) => {
    if (!monthCountByArea[a.area]) monthCountByArea[a.area] = { count: 0, auditors: new Set() };
    monthCountByArea[a.area].count++;
    if (a.auditor) monthCountByArea[a.area].auditors.add(a.auditor);
  });

  // Comparar contra frecuencias esperadas
  for (const [area, config] of Object.entries(AUDIT_FREQUENCIES)) {
    if (config.periodType === "weekly" && config.weeklyTarget) {
      const actual = weekCountByArea[area]?.count ?? 0;
      const expected = config.weeklyTarget;
      const auditorsFound = Array.from(weekCountByArea[area]?.auditors ?? []);

      if (actual < expected) {
        alerts.push({
          type: "frequency_missed",
          area,
          expectedCount: expected,
          actualCount: actual,
          periodLabel,
          responsibles: config.responsibles,
          auditorsFound,
          deficit: expected - actual,
        });
      }
    } else if (config.periodType === "monthly" && config.monthlyTarget) {
      // Solo alertar en la última semana del mes
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const isLastWeek = now.getDate() >= daysInMonth - 7;

      if (isLastWeek) {
        const actual = monthCountByArea[area]?.count ?? 0;
        const expected = config.monthlyTarget;
        const auditorsFound = Array.from(monthCountByArea[area]?.auditors ?? []);

        if (actual < expected) {
          const monthPeriod = firstOfMonth.toLocaleDateString("es-CR", { month: "long", year: "numeric" });
          alerts.push({
            type: "frequency_missed",
            area,
            expectedCount: expected,
            actualCount: actual,
            periodLabel: `mes de ${monthPeriod}`,
            responsibles: config.responsibles,
            auditorsFound,
            deficit: expected - actual,
          });
        }
      }
    }
  }

  return alerts;
}

// ─── Función principal: detectar TODAS las alertas ───────────────────────────

export async function detectAllAlerts(): Promise<{
  redFlags: Alert1_RedFlag[];
  negativeQuestions: Alert2_NegativeQuestions[];
  frequencyMissed: Alert3_FrequencyMissed[];
  total: number;
}> {
  const [redFlags, negativeQuestions, frequencyMissed] = await Promise.all([
    detectRedFlagCollaborators(),
    detectNegativeQuestions(),
    detectFrequencyMissed(),
  ]);

  return {
    redFlags,
    negativeQuestions,
    frequencyMissed,
    total: redFlags.length + negativeQuestions.length + frequencyMissed.length,
  };
}
