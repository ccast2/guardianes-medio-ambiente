import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import {
  getChild,
  getPointsForChild,
  getSchoolPoint,
  sealLevel,
} from "@/lib/recycle";
import type { PointWithBins } from "@/lib/types";
import BinButton from "./BinButton";

export const dynamic = "force-dynamic";

function daysUntil(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function PickupCard({ point }: { point: PointWithBins }) {
  if (point.pickup_status === "scheduled" && point.pickup_date) {
    const d = daysUntil(point.pickup_date);
    const cuando =
      d > 1 ? `Faltan ${d} días` : d === 1 ? "¡Es mañana!" : "¡Es hoy!";
    return (
      <p className="mt-3 rounded-2xl bg-amber-100 px-4 py-3 text-amber-900">
        🚛 El camión pasa por <b>{point.label}</b> el{" "}
        <b>{point.pickup_date}</b>. {cuando}
      </p>
    );
  }
  return (
    <p className="mt-3 rounded-2xl bg-emerald-100 px-4 py-3 text-emerald-800">
      Aún no hay fecha para <b>{point.label}</b>, ¡el docente la pondrá pronto!
    </p>
  );
}

function PointSection({
  point,
  childId,
}: {
  point: PointWithBins;
  childId: number;
}) {
  const algoLleno = point.bins.some((b) => b.is_full);
  return (
    <section className="mt-6 rounded-3xl bg-white/70 p-4 shadow">
      <h2 className="text-xl font-bold">
        {point.kind === "home" ? "🏠" : "🏫"} {point.label}
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {point.bins.map((bin) => (
          <BinButton key={bin.id} bin={bin} childId={childId} />
        ))}
      </div>
      {algoLleno && (
        <p className="mt-3 text-center text-sm font-semibold text-emerald-700">
          ✅ El docente ya puede ver lo que está lleno aquí.
        </p>
      )}
      <PickupCard point={point} />
    </section>
  );
}

export default async function NinoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const childId = Number(id);
  const db = getDb();
  const child = getChild(db, childId);
  if (!child) notFound();

  const homePoints = getPointsForChild(db, childId);
  const school = getSchoolPoint(db);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <Link href="/inicio" className="text-sm text-emerald-700">
          ← Inicio
        </Link>
        <Link
          href={`/nino/${childId}/logros`}
          className="rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white"
        >
          Mis logros 🏅
        </Link>
      </div>

      <header className="mt-4 flex items-center gap-3">
        <span className="text-5xl">{child.avatar}</span>
        <div>
          <h1 className="text-2xl font-extrabold">¡Hola, {child.name}! 🌱</h1>
          <p className="text-emerald-700">
            Tu sello:{" "}
            <span className="text-2xl">{sealLevel(child.seal_count)}</span>
          </p>
        </div>
      </header>

      {homePoints.map((p) => (
        <PointSection key={p.id} point={p} childId={childId} />
      ))}
      {school && <PointSection point={school} childId={childId} />}
    </main>
  );
}
