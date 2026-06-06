import Link from "next/link";
import { getDb } from "@/lib/db";
import { listChildren, getPin } from "@/lib/recycle";
import { AddChildForm, ChildRow, PinForm } from "./AdminForms";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const db = getDb();
  const children = listChildren(db);
  const pin = getPin(db);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/lider" className="text-sm text-emerald-700">
        ← Volver al tablero
      </Link>
      <h1 className="mt-4 text-2xl font-extrabold">Administrar ⚙️</h1>

      <div className="mt-6 space-y-3">
        <AddChildForm />
        {children.map((c) => (
          <ChildRow key={c.id} child={c} />
        ))}
      </div>

      <div className="mt-6">
        <PinForm current={pin} />
      </div>
    </main>
  );
}
