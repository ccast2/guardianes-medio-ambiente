import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getChild, sealLevel, collectiveCount } from "@/lib/recycle";

export const dynamic = "force-dynamic";

export default async function LogrosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const childId = Number(id);
  const db = getDb();
  const child = getChild(db, childId);
  if (!child) notFound();

  const total = collectiveCount(db);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-center">
      <Link
        href={`/nino/${childId}`}
        className="block text-left text-sm text-emerald-700"
      >
        ← Volver
      </Link>

      <h1 className="mt-4 text-2xl font-extrabold">Mis logros 🏅</h1>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow">
        <div className="text-7xl">{sealLevel(child.seal_count)}</div>
        <p className="mt-2 text-lg font-bold">{child.name}</p>
        <p className="text-emerald-700">
          Has reciclado <b>{child.seal_count}</b>{" "}
          {child.seal_count === 1 ? "vez" : "veces"}.
        </p>
        <div className="mt-4 flex justify-center gap-4 text-3xl">
          <span title="0 a 2">🌱</span>
          <span title="3 a 6">🌳</span>
          <span title="7 o más">🌍</span>
        </div>
        <p className="mt-1 text-xs text-emerald-600">
          Sigue reciclando para llegar al planeta 🌍
        </p>
      </div>

      <p className="mt-6 rounded-2xl bg-emerald-100 px-4 py-3 font-semibold text-emerald-800">
        🎉 Entre todos los Guardianes ya reciclamos <b>{total}</b>{" "}
        {total === 1 ? "vez" : "veces"}.
      </p>
    </main>
  );
}
