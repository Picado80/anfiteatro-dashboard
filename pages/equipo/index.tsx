import React, { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "../../components/Layout";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Users, Search, ChevronRight } from "lucide-react";
import { useAudits } from "../../lib/hooks/useAudits";
import { calculateCompliance } from "../../lib/audit-utils";

// Mapa de Líderes a Áreas (donde el área completa es su evaluación)
const LEADER_AREA_MAP: Record<string, string> = {
  "Chef": "Inventarios",
  "Yeiruska": "Administración",
  "Stephanie": "Administración",
  "Mariela": "Servicio al Cliente",
};

export default function EquipoList() {
  const { audits, loading, lastRefresh } = useAudits();
  const [search, setSearch] = useState("");

  // Obtener todos los colaboradores y líderes
  const teamMembers = useMemo(() => {
    // 1. Extraer todos los employee_name únicos de las auditorías
    const evaluatedMap = new Map<string, { total: number, scoreSum: number, area: string }>();
    
    audits.forEach(a => {
      const emp = (a as any).employee_name;
      if (emp) {
        const name = emp.trim();
        if (!evaluatedMap.has(name)) {
          evaluatedMap.set(name, { total: 0, scoreSum: 0, area: a.area || "Varias" });
        }
        const stats = evaluatedMap.get(name)!;
        stats.total += 1;
        if (a.raw_score !== undefined && a.raw_score !== null) {
          stats.scoreSum += a.raw_score;
        }
        // Si hay varias áreas, marcar como "Varias" (opcional)
        if (stats.area !== a.area && stats.area !== "Varias") {
           stats.area = "Varias";
        }
      }
    });

    const list = Array.from(evaluatedMap.entries()).map(([name, stats]) => ({
      name,
      area: stats.area,
      total: stats.total,
      avgScore: stats.total > 0 ? Math.round(stats.scoreSum / stats.total) : null,
      type: "Colaborador"
    }));

    // 2. Añadir a los líderes (que se evalúan con el área completa)
    Object.entries(LEADER_AREA_MAP).forEach(([leaderName, areaName]) => {
      // Filtrar auditorías de esta área
      const areaAudits = audits.filter(a => a.area?.toLowerCase() === areaName.toLowerCase());
      const total = areaAudits.length;
      let scoreSum = 0;
      let count = 0;
      areaAudits.forEach(a => {
        if (a.raw_score !== undefined && a.raw_score !== null) {
          scoreSum += a.raw_score;
          count++;
        }
      });

      // No añadir si ya existe en evaluados
      if (!list.find(l => l.name.toLowerCase() === leaderName.toLowerCase())) {
        list.push({
          name: leaderName,
          area: areaName,
          total,
          avgScore: count > 0 ? Math.round(scoreSum / count) : null,
          type: "Líder de Área"
        });
      }
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [audits]);

  const filteredMembers = useMemo(() => {
    if (!search) return teamMembers;
    const lowerSearch = search.toLowerCase();
    return teamMembers.filter(m => 
      m.name.toLowerCase().includes(lowerSearch) || 
      m.area.toLowerCase().includes(lowerSearch)
    );
  }, [teamMembers, search]);

  if (loading) {
    return (
      <Layout lastRefresh={lastRefresh}>
        <LoadingSpinner size="lg" message="Cargando equipo..." />
      </Layout>
    );
  }

  return (
    <Layout lastRefresh={lastRefresh}>
      <Head>
        <title>Equipo — Resultados Individuales</title>
      </Head>

      <div className="space-y-8 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
              Desempeño Individual
            </p>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-brand-600 dark:from-white dark:to-brand-400 tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-brand-500" />
              Equipo y Líderes
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Resultados individuales de todos los colaboradores y áreas lideradas
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 relative w-full md:w-72">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar persona o área..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-700 dark:text-slate-200 shadow-sm font-medium"
            />
          </div>
        </div>

        {/* Grid de Equipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map((member) => (
            <Link
              key={member.name}
              href={`/colaborador/${encodeURIComponent(member.name)}`}
              className="group glass-panel p-5 rounded-2xl border-2 border-transparent hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                    {member.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${member.type === 'Líder de Área' ? 'bg-amber-500' : 'bg-brand-500'}`} />
                    {member.type} · {member.area}
                  </p>
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                  member.avgScore && member.avgScore >= 85 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" :
                  member.avgScore && member.avgScore >= 75 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" :
                  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                }`}>
                  <span className="font-black text-sm">{member.avgScore || "-"}</span>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">{member.total} auditorías</span>
                <span className="text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                  Ver detalle <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-20 glass-panel rounded-2xl">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No se encontraron resultados para "{search}"</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
