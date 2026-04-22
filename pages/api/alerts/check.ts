/**
 * API: /api/alerts/check
 * Detecta las 3 condiciones de alerta y envía los correos a Wendy y Benito via Resend.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { detectAllAlerts } from "../../../lib/alerts/engine";
import { buildAlert1Email, buildAlert2Email, buildAlert3Email } from "../../../lib/alerts/email-templates";
import { ALERT_RECIPIENTS } from "../../../lib/alerts/config";

// ─── Handler principal ────────────────────────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({
      error: "Email no configurado",
      message: "Añade RESEND_API_KEY en el archivo .env.local",
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = "Anfiteatro Villa - Alertas <onboarding@resend.dev>";
  const recipients = [ALERT_RECIPIENTS.wendy, ALERT_RECIPIENTS.benito];

  try {
    console.log("[Alerts] Iniciando detección de alertas...");

    const { redFlags, negativeQuestions, frequencyMissed, total } = await detectAllAlerts();

    console.log(`[Alerts] Detectadas: ${redFlags.length} banderas rojas, ${negativeQuestions.length} preguntas negativas, ${frequencyMissed.length} frecuencias incumplidas`);

    const emailsSent: string[] = [];
    const emailsFailed: string[] = [];

    // Alerta 1 — Banderas Rojas (colaboradores bajo meta 2 meses)
    if (redFlags.length > 0) {
      const { subject, html } = buildAlert1Email(redFlags);
      const { error } = await resend.emails.send({ from: FROM, to: recipients, subject, html });
      if (!error) {
        emailsSent.push("Banderas Rojas");
        console.log("[Alerts] ✅ Correo de banderas rojas enviado");
      } else {
        emailsFailed.push("Banderas Rojas");
        console.error("[Alerts] ❌ Error banderas rojas:", error);
      }
    }

    // Alerta 2 — Preguntas con alta tasa negativa
    if (negativeQuestions.length > 0) {
      const { subject, html } = buildAlert2Email(negativeQuestions);
      const { error } = await resend.emails.send({ from: FROM, to: recipients, subject, html });
      if (!error) {
        emailsSent.push("Preguntas con fallos");
        console.log("[Alerts] ✅ Correo de preguntas negativas enviado");
      } else {
        emailsFailed.push("Preguntas Negativas");
        console.error("[Alerts] ❌ Error preguntas negativas:", error);
      }
    }

    // Alerta 3 — Frecuencias incumplidas
    if (frequencyMissed.length > 0) {
      const { subject, html } = buildAlert3Email(frequencyMissed);
      const { error } = await resend.emails.send({ from: FROM, to: recipients, subject, html });
      if (!error) {
        emailsSent.push("Incumplimiento de cuotas");
        console.log("[Alerts] ✅ Correo de frecuencias enviado");
      } else {
        emailsFailed.push("Frecuencias");
        console.error("[Alerts] ❌ Error frecuencias:", error);
      }
    }

    return res.status(200).json({
      success: true,
      summary: {
        totalAlerts: total,
        redFlagsFound: redFlags.length,
        negativeQuestionsFound: negativeQuestions.length,
        frequencyMissedFound: frequencyMissed.length,
      },
      emails: {
        sent: emailsSent,
        failed: emailsFailed,
        recipients: total > 0 ? recipients : [],
      },
      message: total === 0
        ? "✅ Todo en orden — No se detectaron alertas esta vez."
        : `Se enviaron ${emailsSent.length} correo(s) de alerta a Wendy y Benito.`,
    });

  } catch (err) {
    console.error("[Alerts] Error:", err);
    return res.status(500).json({ success: false, error: String(err) });
  }
}
