"use client";

import { useTransition } from "react";
import type { Bin } from "@/lib/types";
import { BIN_META } from "@/lib/types";
import { toggleBinAction } from "@/app/actions";

export default function BinButton({
  bin,
  childId,
}: {
  bin: Bin;
  childId: number;
}) {
  const [pending, startTransition] = useTransition();
  const meta = BIN_META[bin.type];

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleBinAction(bin.id, childId))}
      className={[
        "flex flex-col items-center justify-center rounded-2xl border-4 p-4 text-center transition",
        bin.is_full
          ? "border-red-400 bg-red-50"
          : "border-emerald-200 bg-white hover:border-emerald-400",
        pending ? "opacity-60" : "",
      ].join(" ")}
    >
      <span className="text-3xl">{meta.emoji}</span>
      <span className="mt-1 text-sm font-semibold">{meta.label}</span>
      <span className="mt-1 text-xs font-bold">
        {bin.is_full ? "¡Lleno! ✋" : "Vacío"}
      </span>
    </button>
  );
}
