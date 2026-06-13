import Link from "next/link";
import { getDb } from "@/lib/db";
import {
  listChildren,
  getPointsForChild,
  getSchoolPoint,
} from "@/lib/recycle";
import PinGate from "./PinGate";
import PointCard from "./PointCard";

export const dynamic = "force-dynamic";

export default function LiderPage() {
  const db = getDb();
  const children = listChildren(db);
  const homeCards = children.flatMap((c) =>
    getPointsForChild(db, c.id).map((p) => ({ point: p, owner: c.name }))
  );
  const school = getSchoolPoint(db);

  return (
    <PinGate>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between">
          <Link href="/inicio" className="text-sm text-emerald-700">
            ← Inicio
          </Link>
          <Link
            href="/lider/admin"
            className="rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white"
          >
            Administrar ⚙️
          </Link>
        </div>

        <h1 className="mt-4 text-2xl font-extrabold">Tablero del docente 🧑‍🏫</h1>
        <p className="text-emerald-700">
          Puntos ecológicos y recogida del camión.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {homeCards.map(({ point, owner }) => (
            <PointCard key={point.id} point={point} ownerName={owner} />
          ))}
          {school && (
            <PointCard point={school} ownerName="La escuela (compartido)" />
          )}
        </div>
      </main>
    </PinGate>
  );
}
