"use client";

import { useState } from "react";
import { verifyPinAction } from "@/app/actions";

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  if (ok) return <>{children}</>;

  return (
    <main className="mx-auto max-w-sm px-4 py-16 text-center">
      <div className="text-5xl">🔒</div>
      <h1 className="mt-2 text-xl font-bold">Acceso del docente</h1>
      <p className="text-emerald-700">Escribe el PIN</p>
      <form
        className="mt-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const valid = await verifyPinAction(pin);
          setOk(valid);
          setError(!valid);
        }}
      >
        <input
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-40 rounded-2xl border-2 border-emerald-300 px-4 py-2 text-center text-2xl tracking-widest"
          placeholder="••••"
          autoFocus
        />
        <div>
          <button
            type="submit"
            className="mt-4 rounded-full bg-emerald-700 px-6 py-2 font-semibold text-white"
          >
            Entrar
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">PIN incorrecto</p>}
      </form>
    </main>
  );
}
