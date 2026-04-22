/**
 * PLANTILLAS DE CORREO HTML — SISTEMA DE ALERTAS ANFITEATRO
 * Diseño profesional compatible con Gmail y Hotmail/Outlook
 */

import {
  Alert1_RedFlag,
  Alert2_NegativeQuestions,
  Alert3_FrequencyMissed,
} from "./engine";

const BRAND_COLOR = "#7c3aed"; // Violeta brand de Anfiteatro
const DANGER_COLOR = "#dc2626";
const WARNING_COLOR = "#d97706";
const SUCCESS_COLOR = "#059669";

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f1f5f9;
  margin: 0;
  padding: 0;
`;

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="${baseStyle}">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);padding:32px 36px;">
      <p style="margin:0 0 4px 0;color:#c4b5fd;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">Anfiteatro Villa</p>
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;letter-spacing:-0.5px;line-height:1.2;">Sistema de Auditorías</h1>
    </div>
    <!-- Content -->
    <div style="padding:36px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="padding:20px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
        Este es un correo automático del Sistema de Auditorías de Anfiteatro Villa.<br/>
        No responder directamente a este mensaje.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function alertHeader(
  icon: string,
  color: string,
  bg: string,
  badge: string,
  title: string,
  subtitle: string
): string {
  return `
    <div style="display:inline-block;padding:6px 14px;background:${bg};border-radius:999px;margin-bottom:16px;">
      <span style="font-size:13px;font-weight:800;color:${color};letter-spacing:0.05em;text-transform:uppercase;">${icon} ${badge}</span>
    </div>
    <h2 style="margin:0 0 6px 0;font-size:22px;font-weight:900;color:#0f172a;">${title}</h2>
    <p style="margin:0 0 28px 0;font-size:15px;color:#64748b;">${subtitle}</p>
    <hr style="border:none;border-top:2px solid #f1f5f9;margin-bottom:28px;"/>
  `;
}

function scoreBar(score: number): string {
  const color = score >= 85 ? SUCCESS_COLOR : score >= 75 ? WARNING_COLOR : DANGER_COLOR;
  return `
    <div style="background:#f1f5f9;border-radius:999px;height:10px;overflow:hidden;margin-top:6px;">
      <div style="width:${score}%;height:100%;background:${color};border-radius:999px;"></div>
    </div>
  `;
}

// ─── ALERTA 1: Bandera Roja — Colaborador bajo la meta 2 meses ───────────────

export function buildAlert1Email(alerts: Alert1_RedFlag[]): { subject: string; html: string } {
  const subject = `🚨 Bandera Roja — ${alerts.length} colaborador${alerts.length > 1 ? "es" : ""} bajo la meta por 2 meses consecutivos`;

  const cards = alerts.map((alert) => {
    const trendIcon = alert.trend > 0 ? "↑" : alert.trend < 0 ? "↓" : "→";
    const trendColor = alert.trend > 0 ? SUCCESS_COLOR : DANGER_COLOR;

    return `
      <div style="background:#fff;border:2px solid #fee2e2;border-radius:12px;padding:20px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
          <div>
            <p style="margin:0 0 2px 0;font-size:18px;font-weight:900;color:#0f172a;">👤 ${alert.collaborator}</p>
            <p style="margin:0;font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Área: ${alert.area}</p>
          </div>
          <span style="font-size:20px;font-weight:900;color:${trendColor};">${trendIcon} ${Math.abs(alert.trend)}pts</span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="background:#fef2f2;border-radius:8px;padding:12px;">
            <p style="margin:0 0 2px 0;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.08em;">${alert.month1.label}</p>
            <p style="margin:0 0 6px 0;font-size:24px;font-weight:900;color:#dc2626;">${alert.month1.avgScore}%</p>
            ${scoreBar(alert.month1.avgScore)}
            <p style="margin:6px 0 0 0;font-size:11px;color:#94a3b8;">${alert.month1.count} auditorías</p>
          </div>
          <div style="background:#fef2f2;border-radius:8px;padding:12px;">
            <p style="margin:0 0 2px 0;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.08em;">${alert.month2.label}</p>
            <p style="margin:0 0 6px 0;font-size:24px;font-weight:900;color:#dc2626;">${alert.month2.avgScore}%</p>
            ${scoreBar(alert.month2.avgScore)}
            <p style="margin:6px 0 0 0;font-size:11px;color:#94a3b8;">${alert.month2.count} auditorías</p>
          </div>
        </div>

        <div style="margin-top:14px;padding:10px 14px;background:#fef2f2;border-radius:8px;border-left:4px solid ${DANGER_COLOR};">
          <p style="margin:0;font-size:13px;font-weight:600;color:#991b1b;">
            Ambos meses están por debajo de la meta de <strong>85%</strong>. Se recomienda intervención inmediata.
          </p>
        </div>
      </div>
    `;
  }).join("");

  const html = emailWrapper(`
    ${alertHeader(
      "🚨",
      DANGER_COLOR,
      "#fee2e2",
      "Bandera Roja — Alerta Crítica",
      "Colaboradores con Desempeño Bajo por 2 Meses",
      `Se detectaron ${alerts.length} colaborador${alerts.length > 1 ? "es" : ""} con promedio por debajo del 85% durante 2 meses consecutivos. Se requiere atención inmediata.`
    )}
    ${cards}
    <div style="text-align:center;margin-top:28px;">
      <a href="http://localhost:3001/dashboard/macro" style="display:inline-block;padding:14px 28px;background:${BRAND_COLOR};color:#fff;text-decoration:none;border-radius:10px;font-weight:800;font-size:15px;">
        Ver Dashboard Completo →
      </a>
    </div>
  `);

  return { subject, html };
}

// ─── ALERTA 2: Preguntas con alta tasa de respuestas negativas ───────────────

export function buildAlert2Email(alerts: Alert2_NegativeQuestions[]): { subject: string; html: string } {
  const subject = `⚠️ Alerta — ${alerts.length} pregunta${alerts.length > 1 ? "s" : ""} con alta tasa de fallos este mes`;

  // Agrupar por área
  const byArea: Record<string, Alert2_NegativeQuestions[]> = {};
  alerts.forEach((a) => {
    if (!byArea[a.area]) byArea[a.area] = [];
    byArea[a.area].push(a);
  });

  const sections = Object.entries(byArea).map(([area, areaAlerts]) => {
    const rows = areaAlerts.map((alert) => {
      const pct = Math.round(alert.negativeRate * 100);
      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#1e293b;font-weight:500;max-width:300px;">${alert.question}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;">
            <span style="display:inline-block;padding:4px 10px;background:#fee2e2;border-radius:999px;font-size:13px;font-weight:900;color:#dc2626;">${pct}%</span>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:13px;color:#64748b;">${alert.negativeCount}/${alert.totalAudits}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#94a3b8;">${alert.auditType}</td>
        </tr>
      `;
    }).join("");

    return `
      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 10px 0;font-size:16px;font-weight:900;color:#0f172a;">📍 ${area}</h3>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          <thead>
            <tr style="background:#fef3c7;">
              <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;">Pregunta Problemática</th>
              <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;">% Fallos</th>
              <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;">Fallos/Total</th>
              <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;">Tipo</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }).join("");

  const html = emailWrapper(`
    ${alertHeader(
      "⚠️",
      WARNING_COLOR,
      "#fef3c7",
      "Alerta de Calidad",
      "Preguntas con Alta Tasa de Respuestas Negativas",
      `Durante ${alerts[0]?.month ?? "este mes"} se detectaron ${alerts.length} pregunta${alerts.length > 1 ? "s" : ""} con más del 50% de fallos.`
    )}
    ${sections}
    <div style="text-align:center;margin-top:28px;">
      <a href="http://localhost:3001/dashboard/macro" style="display:inline-block;padding:14px 28px;background:${BRAND_COLOR};color:#fff;text-decoration:none;border-radius:10px;font-weight:800;font-size:15px;">
        Ver Dashboard Completo →
      </a>
    </div>
  `);

  return { subject, html };
}

// ─── ALERTA 3: Auditoría no completada en el período ─────────────────────────

export function buildAlert3Email(alerts: Alert3_FrequencyMissed[]): { subject: string; html: string } {
  const subject = `📋 Incumplimiento — ${alerts.length} área${alerts.length > 1 ? "s" : ""} no completaron sus auditorías`;

  const cards = alerts.map((alert) => {
    const completionPct = alert.expectedCount > 0
      ? Math.round((alert.actualCount / alert.expectedCount) * 100)
      : 0;

    return `
      <div style="background:#fff;border:2px solid #e0e7ff;border-radius:12px;padding:20px;margin-bottom:16px;">
        <div style="margin-bottom:14px;">
          <p style="margin:0 0 2px 0;font-size:18px;font-weight:900;color:#0f172a;">📍 ${alert.area}</p>
          <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;">Período: ${alert.periodLabel}</p>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px;">
          <div style="background:#f8fafc;border-radius:8px;padding:12px;text-align:center;">
            <p style="margin:0 0 2px 0;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Esperadas</p>
            <p style="margin:0;font-size:28px;font-weight:900;color:#0f172a;">${alert.expectedCount}</p>
          </div>
          <div style="background:#fef2f2;border-radius:8px;padding:12px;text-align:center;">
            <p style="margin:0 0 2px 0;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;">Realizadas</p>
            <p style="margin:0;font-size:28px;font-weight:900;color:#dc2626;">${alert.actualCount}</p>
          </div>
          <div style="background:#fff7ed;border-radius:8px;padding:12px;text-align:center;">
            <p style="margin:0 0 2px 0;font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;">Faltantes</p>
            <p style="margin:0;font-size:28px;font-weight:900;color:#d97706;">${alert.deficit}</p>
          </div>
        </div>

        <div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:12px;font-weight:700;color:#64748b;">Cumplimiento del período</span>
            <span style="font-size:12px;font-weight:900;color:${completionPct >= 100 ? SUCCESS_COLOR : DANGER_COLOR};">${completionPct}%</span>
          </div>
          ${scoreBar(completionPct)}
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
          <span style="font-size:12px;font-weight:700;color:#64748b;">Responsables:</span>
          ${alert.responsibles.map((r) => `<span style="padding:3px 10px;background:#ede9fe;color:#5b21b6;border-radius:999px;font-size:12px;font-weight:800;">${r}</span>`).join("")}
        </div>
        ${alert.auditorsFound.length > 0 ? `
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
            <span style="font-size:12px;font-weight:700;color:#64748b;">Sí auditaron:</span>
            ${alert.auditorsFound.map((a) => `<span style="padding:3px 10px;background:#dcfce7;color:#166534;border-radius:999px;font-size:12px;font-weight:800;">${a}</span>`).join("")}
          </div>
        ` : ""}
      </div>
    `;
  }).join("");

  const html = emailWrapper(`
    ${alertHeader(
      "📋",
      "#4f46e5",
      "#ede9fe",
      "Incumplimiento de Cuota",
      "Áreas sin Completar sus Auditorías",
      `${alerts.length} área${alerts.length > 1 ? "s" : ""} no completaron el número requerido de auditorías en el período indicado.`
    )}
    ${cards}
    <div style="text-align:center;margin-top:28px;">
      <a href="http://localhost:3001/dashboard/macro" style="display:inline-block;padding:14px 28px;background:${BRAND_COLOR};color:#fff;text-decoration:none;border-radius:10px;font-weight:800;font-size:15px;">
        Ver Dashboard Completo →
      </a>
    </div>
  `);

  return { subject, html };
}
