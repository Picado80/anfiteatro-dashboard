/**
 * API: /api/alerts/test
 * Envía correos de PRUEBA al correo del administrador para verificar el diseño
 * antes de activar el sistema real con Wendy y Benito.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { buildAlert1Email, buildAlert2Email, buildAlert3Email } from "../../../lib/alerts/email-templates";
import type { Alert1_RedFlag, Alert2_NegativeQuestions, Alert3_FrequencyMissed } from "../../../lib/alerts/engine";

// ─── Datos de ejemplo para el correo de prueba ────────────────────────────────
const sampleRedFlag: Alert1_RedFlag = {
  type: "red_flag_collaborator",
  collaborator: "María González",
  area: "Salón",
  month1: { label: "febrero 2025", avgScore: 62, count: 8 },
  month2: { label: "marzo 2025", avgScore: 58, count: 10 },
  trend: -4,
};

const sampleNegativeQuestion: Alert2_NegativeQuestions = {
  type: "negative_questions",
  area: "Cocina",
  auditType: "Cocina - Auditoría General",
  question: "¿El área de trabajo se encuentra limpia y ordenada al inicio del turno?",
  negativeRate: 0.72,
  totalAudits: 18,
  negativeCount: 13,
  month: "marzo 2025",
};

const sampleFrequency: Alert3_FrequencyMissed = {
  type: "frequency_missed",
  area: "Cavernas",
  expectedCount: 6,
  actualCount: 2,
  periodLabel: "semana del 17 al 21 de marzo",
  responsibles: ["Raquel"],
  auditorsFound: ["Raquel"],
  deficit: 4,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "RESEND_API_KEY no configurado en .env.local" });
  }

  const testEmail = req.query.email as string || "aquilesmaximus@gmail.com";
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = "Anfiteatro Villa - Alertas <onboarding@resend.dev>";
  const sent: string[] = [];
  const failed: string[] = [];

  // Enviar los 3 tipos de correo de prueba
  const emailsToSend = [
    { ...buildAlert1Email([sampleRedFlag]), label: "Bandera Roja" },
    { ...buildAlert2Email([sampleNegativeQuestion]), label: "Preguntas Negativas" },
    { ...buildAlert3Email([sampleFrequency]), label: "Frecuencia Incumplida" },
  ];

  for (const email of emailsToSend) {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [testEmail],
      subject: `[PRUEBA] ${email.subject}`,
      html: email.html,
    });

    if (!error) {
      sent.push(email.label);
    } else {
      failed.push(email.label);
      console.error(`Error enviando ${email.label}:`, error);
    }
  }

  return res.status(200).json({
    success: true,
    message: `Se enviaron ${sent.length} correos de prueba a ${testEmail}`,
    sent,
    failed,
    note: "Revisa tu bandeja de entrada (y spam) en los próximos minutos.",
  });
}
