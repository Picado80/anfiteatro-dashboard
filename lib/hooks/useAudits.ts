import { useState, useEffect } from "react";
import { ScoredAudit } from "../audit-scoring";

interface UseAuditsResult {
  audits: ScoredAudit[];
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  refresh: () => Promise<void>;
}

export function useAudits(refreshInterval: number = 15 * 60 * 1000): UseAuditsResult {
  const [audits, setAudits] = useState<ScoredAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/audits");

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setAudits(data.data || []);
        setLastRefresh(new Date());
      } else {
        throw new Error(data.error || "Failed to fetch audits");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching audits:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAudits();
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(fetchAudits, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    audits,
    loading,
    error,
    lastRefresh,
    refresh: fetchAudits,
  };
}
