import React from "react";
import Link from "next/link";
import { Mountain, Coffee, ChefHat, ClipboardList, Briefcase, Users, DollarSign } from "lucide-react";

interface ScoreCardProps {
  area: string;
  score: number;
  count: number;
  cumpleCount: number;
  isDisabled?: boolean;
}

export function ScoreCard({ area, score, count, cumpleCount, isDisabled = false }: ScoreCardProps) {
  const getTheme = (score: number) => {
    if (isDisabled) return {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-400 dark:text-slate-500",
      ring: "text-slate-200 dark:text-slate-700",
      border: "border-slate-200 dark:border-slate-700",
      badge: "bg-slate-200 dark:bg-slate-700 text-slate-500",
      glow: ""
    };
    if (score >= 85) return {
      bg: "bg-emerald-50/80 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      ring: "text-emerald-500 dark:text-emerald-400",
      border: "border-emerald-200/60 dark:border-emerald-800/50",
      badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
      glow: "hover:shadow-emerald-200 dark:hover:shadow-emerald-900/50"
    };
    if (score >= 75) return {
      bg: "bg-amber-50/80 dark:bg-amber-900/20",
      text: "text-amber-600 dark:text-amber-400",
      ring: "text-amber-500 dark:text-amber-400",
      border: "border-amber-200/60 dark:border-amber-800/50",
      badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
      glow: "hover:shadow-amber-200 dark:hover:shadow-amber-900/50"
    };
    return {
      bg: "bg-rose-50/80 dark:bg-rose-900/20",
      text: "text-rose-600 dark:text-rose-400",
      ring: "text-rose-500 dark:text-rose-400",
      border: "border-rose-200/60 dark:border-rose-800/50",
      badge: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
      glow: "hover:shadow-rose-200 dark:hover:shadow-rose-900/50"
    };
  };

  const getIcon = (area: string) => {
    switch (area.toLowerCase()) {
      case "cavernas": return <Mountain className="w-6 h-6" />;
      case "salón": return <Coffee className="w-6 h-6" />;
      case "cocina": return <ChefHat className="w-6 h-6" />;
      case "inventarios": return <ClipboardList className="w-6 h-6" />;
      case "administración": return <Briefcase className="w-6 h-6" />;
      case "servicio al cliente": return <Users className="w-6 h-6" />;
      case "ventas": return <DollarSign className="w-6 h-6" />;
      default: return <ClipboardList className="w-6 h-6" />;
    }
  };

  const theme = getTheme(score);
  // Anillo MÁS GRUESO: strokeWidth 8 y radio 38
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = isDisabled ? circumference : circumference - (score / 100) * circumference;

  const CardContent = (
    <div className={`relative flex flex-col p-6 rounded-2xl border-2 ${theme.border} ${theme.bg} ${isDisabled ? 'opacity-60 grayscale cursor-not-allowed' : `backdrop-blur-md shadow-md hover:shadow-xl ${theme.glow} hover:-translate-y-1.5`} transition-all duration-300 group h-full`}>

      {/* Cabecera: Icono + Área */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
            Área
          </p>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
            {area}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${theme.badge} transition-transform group-hover:scale-110 duration-300`}>
          {getIcon(area)}
        </div>
      </div>

      {/* Circular Progress GRUESO + Score grande */}
      <div className="flex items-center justify-center my-2">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Pista de fondo gruesa */}
            <circle
              cx="50" cy="50" r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-200 dark:text-slate-700/60"
            />
            {/* Progreso grueso */}
            <circle
              cx="50" cy="50" r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`${theme.ring} transition-all duration-1000 ease-out`}
            />
          </svg>
          {/* Score central grande */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-3xl font-black tracking-tight ${theme.text}`}>
              {isDisabled ? "—" : `${score}%`}
            </span>
            {!isDisabled && (
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Score</span>
            )}
          </div>
        </div>
      </div>

      {/* Pie: conteos */}
      {isDisabled ? (
        <div className="mt-4 text-center">
          <span className="text-sm font-bold text-slate-400 italic">Próximamente</span>
        </div>
      ) : (
        <div className={`mt-4 flex items-center justify-between px-3 py-2.5 rounded-xl ${theme.badge}`}>
          <div className="text-center flex-1">
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{cumpleCount}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cumplen</p>
          </div>
          <div className="w-px h-8 bg-current opacity-20 mx-2" />
          <div className="text-center flex-1">
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{count}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</p>
          </div>
        </div>
      )}
    </div>
  );

  if (isDisabled) {
    return <div>{CardContent}</div>;
  }

  return (
    <Link href={`/areas/${area.toLowerCase()}`} className="block h-full">
      {CardContent}
    </Link>
  );
}
