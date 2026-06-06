import Link from "next/link";
import { getDb } from "@/lib/db";
import { listChildren } from "@/lib/recycle";

export const dynamic = "force-dynamic";

export default function Home() {
  const children = listChildren(getDb());

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="text-center">
        <div className="text-6xl">🌍</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          Guardianes del Medio Ambiente
        </h1>
        <p className="mt-1 text-emerald-700">¿Quién eres?</p>
      </header>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {children.map((c) => (
          <li key={c.id}>
            <Link
              href={`/nino/${c.id}`}
              className="flex flex-col items-center rounded-3xl bg-white p-5 shadow-md transition hover:scale-105 hover:shadow-lg"
            >
              <span className="text-5xl">{c.avatar}</span>
              <span className="mt-2 text-lg font-bold">{c.name}</span>
              <span className="text-sm text-emerald-600">Grado {c.grade}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 text-center">
        <Link
          href="/lider"
          className="inline-block rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-800"
        >
          Soy el líder 🧑‍🏫
        </Link>
      </div>
    </main>
  );
}
