import type { NextApiRequest, NextApiResponse } from "next";
import { fetchAllAudits, clearCache, getCacheStats } from "../../lib/google-sheets";
import { scoreAudit, ScoredAudit } from "../../lib/audit-scoring";

interface ApiResponse {
  success: boolean;
  data?: ScoredAudit[];
  cacheStats?: any[];
  error?: string;
  timestamp?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Support cache clearing via ?refresh=true
    if (req.query.refresh === "true") {
      clearCache();
    }

    // Fetch all audit records from Google Sheets
    const records = await fetchAllAudits();

    // Apply scoring to each record
    const scoredAudits: ScoredAudit[] = records
      .filter((record) => record.timestamp) // Filter out empty rows
      .map((record) => scoreAudit(record));

    // Optional: Return cache stats for monitoring
    const includeStats = req.query.stats === "true";

    res.status(200).json({
      success: true,
      data: scoredAudits,
      ...(includeStats && { cacheStats: getCacheStats() }),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch audit data",
      timestamp: new Date().toISOString(),
    });
  }
}
