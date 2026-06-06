"use client";

import { useState, useTransition } from "react";
import type { PointWithBins } from "@/lib/types";
import { BIN_META } from "@/lib/types";
import { schedulePickupAction, collectPointAction } from "@/app/actions";

export default function PointCard({
  point,
  ownerName,
}: {
  point: PointWithBins;
  ownerName: string;
}) {
  const [date, setDate] = useState(point.pickup_date ?? "");
  const [pending, startTransition] = useTransition();
  const fullBins = point.bins.filter((b) => b.is_full);
  const espera = fullBins.length > 0 && point.pickup_status !== "scheduled";

  return (
    <div
      className={[
        "rounded-3xl bg-white p-4 shadow",
        espera ? "ring-4 ring-amber-300" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {point.kind === "home" ? "🏠" : "🏫"} {ownerName}
        </h2>
        {espera && (
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">
            ⚠️ Espera recogida
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {fullBins.length === 0 ? (
          <span className="text-sm text-emerald-600">Todo vacío ✅</span>
        ) : (
          fullBins.map((b) => (
            <span
              key={b.id}
              className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700"
            >
              {BIN_META[b.type].emoji} {BIN_META[b.type].label}
            </span>
          ))
        )}
      </div>

      {point.pickup_status === "scheduled" && point.pickup_date && (
        <p className="mt-2 text-sm text-amber-800">
          🚛 Agendado para <b>{point.pickup_date}</b>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border-2 border-emerald-200 px-2 py-1 text-sm"
        />
        <button
          type="button"
          disabled={pending || !date}
          onClick={() =>
            startTransition(() => schedulePickupAction(point.id, date))
          }
          className="rounded-full bg-emerald-700 px-3 py-1 text-sm font-semibold text-white disabled:opacity-50"
        >
          Agendar camión 📅
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => collectPointAction(point.id))}
          className="rounded-full bg-sky-700 px-3 py-1 text-sm font-semibold text-white disabled:opacity-50"
        >
          Marcar como recogido ✅
        </button>
      </div>
    </div>
  );
}
