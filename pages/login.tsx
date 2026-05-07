import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

// Usuarios y PINes temporales (Reemplazar por Supabase Auth en Fase 4 si se desea)
const USERS = [
  { name: "Wendy", role: "admin", area: "Todas", pin: "1234" },
  { name: "Benito", role: "admin", area: "Todas", pin: "1234" },
  { name: "Líder Salón", role: "supervisor", area: "Salón", pin: "8362" },
  { name: "Líder Cocina", role: "supervisor", area: "Cocina", pin: "5174" },
  { name: "Líder Cavernas", role: "supervisor", area: "Cavernas", pin: "9428" },
  { name: "Líder Administración", role: "supervisor", area: "Administración", pin: "3751" },
  { name: "Líder Inventarios", role: "supervisor", area: "Inventarios", pin: "6093" },
];

export default function Login() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(USERS[0]);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === selectedUser.pin) {
      // Login exitoso
      localStorage.setItem("currentUser", JSON.stringify(selectedUser));
      router.push("/dashboard/macro");
    } else {
      setError("PIN incorrecto. Intenta de nuevo.");
      setPin("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Head>
        <title>Ingresar - Anfiteatro</title>
      </Head>
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">
            Anfiteatro Audit
          </h1>
          <p className="text-slate-500 mt-2">Selecciona tu usuario para ingresar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Usuario
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              value={selectedUser.name}
              onChange={(e) => {
                setSelectedUser(USERS.find((u) => u.name === e.target.value) || USERS[0]);
                setError("");
              }}
            >
              {USERS.map((user) => (
                <option key={user.name} value={user.name}>
                  {user.name} ({user.area})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              PIN de Acceso
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError("");
              }}
              placeholder="••••"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
            {error && <p className="text-rose-500 text-sm mt-2 font-medium text-center">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Ingresar al Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
