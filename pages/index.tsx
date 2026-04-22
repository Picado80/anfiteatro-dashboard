import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al Dashboard Macro (WENDY) por defecto
    // En la Fase 4, esto se reemplazará por una verificación de login/roles
    router.replace("/dashboard/macro");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-pulse text-xl text-gray-500 dark:text-gray-400">
        Cargando Anfiteatro Dashboard...
      </div>
    </div>
  );
}
