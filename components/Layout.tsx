import React, { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BarChart3, Clock, Home, Mountain, Coffee, ChefHat, ClipboardList, Briefcase, Users, DollarSign, Database } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  lastRefresh?: Date;
}

const AREA_ICONS: Record<string, React.ReactNode> = {
  "Cavernas": <Mountain className="w-4 h-4" />,
  "Salón": <Coffee className="w-4 h-4" />,
  "Cocina": <ChefHat className="w-4 h-4" />,
  "Inventarios": <ClipboardList className="w-4 h-4" />,
  "Administración": <Briefcase className="w-4 h-4" />,
  "Servicio al Cliente": <Users className="w-4 h-4" />,
  "Ventas": <DollarSign className="w-4 h-4" />,
};

export function Layout({ children, lastRefresh }: LayoutProps) {
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  const formatRefreshTime = (date?: Date) => {
    if (!date) return "Nunca";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Ahora mismo";
    if (diffMins < 60) return `hace ${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;
    return date.toLocaleDateString("es-CR");
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <nav className="w-72 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-lg flex flex-col">

        {/* Logo */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight leading-none">
            Anfiteatro Villa
          </h1>
          <p className="text-xs font-black text-brand-600 dark:text-brand-400 mt-1.5 uppercase tracking-widest">
            Sistema Operativo
          </p>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">

          {/* Inicio */}
          <Link
            href="/dashboard/macro"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
              isActive("/") || isActive("/dashboard/macro")
                ? "bg-brand-600 text-white font-black shadow-md shadow-brand-500/30"
                : "text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Resumen Operacional</span>
          </Link>

          {/* Sección Áreas */}
          <div className="pt-5 pb-2 px-1">
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
              Áreas
            </p>
          </div>

          {["Cavernas", "Salón", "Cocina", "Inventarios", "Administración", "Servicio al Cliente", "Ventas"].map((area) => {
            const isVentas = area === "Ventas";
            const path = `/areas/${area.toLowerCase()}`;
            const active = isActive(path);
            return (
              <Link
                key={area}
                href={isVentas ? "#" : path}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  isVentas
                    ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
                    : active
                    ? "bg-brand-600 text-white font-black shadow-md shadow-brand-500/30"
                    : "text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex-shrink-0">{AREA_ICONS[area] || <BarChart3 className="w-4 h-4" />}</span>
                  <span className="truncate">{area}</span>
                </div>
                {isVentas && (
                  <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex-shrink-0">
                    Pronto
                  </span>
                )}
              </Link>
            );
          })}
          {/* Sección Equipo */}
          <div className="pt-5 pb-2 px-1">
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
              Equipo
            </p>
          </div>

          <Link
            href="/equipo"
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
              isActive("/equipo") || router.pathname.startsWith("/colaborador")
                ? "bg-brand-600 text-white font-black shadow-md shadow-brand-500/30"
                : "text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex-shrink-0"><Users className="w-4 h-4" /></span>
              <span className="truncate">Resultados Individuales</span>
            </div>
          </Link>
          {/* Sección Registros */}
          <div className="pt-5 pb-2 px-1">
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
              Registros
            </p>
          </div>

          <Link
            href="/audits"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
              isActive("/audits")
                ? "bg-brand-600 text-white font-black shadow-md shadow-brand-500/30"
                : "text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Database className="w-5 h-5 flex-shrink-0" />
            <span>Auditorías Completadas</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Actualizado: {formatRefreshTime(lastRefresh)}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
