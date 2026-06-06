"use client";

import { useState, useTransition } from "react";
import type { Child } from "@/lib/types";
import {
  addChildAction,
  updateChildAction,
  deleteChildAction,
  setPinAction,
} from "@/app/actions";

const AVATARS = ["🦊", "🐼", "🐢", "🦉", "🐝", "🐧", "🐯", "🦁", "🐨", "🦋"];

export function AddChildForm() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [grade, setGrade] = useState(1);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="rounded-2xl bg-white p-4 shadow"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        startTransition(async () => {
          await addChildAction(name.trim(), avatar, grade);
          setName("");
        });
      }}
    >
      <h3 className="font-bold">Agregar niño</h3>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="rounded-xl border-2 border-emerald-200 px-3 py-1"
        />
        <select
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          className="rounded-xl border-2 border-emerald-200 px-2 py-1 text-xl"
        >
          {AVATARS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={grade}
          onChange={(e) => setGrade(Number(e.target.value))}
          className="rounded-xl border-2 border-emerald-200 px-2 py-1"
        >
          {[1, 2, 3, 4, 5].map((g) => (
            <option key={g} value={g}>
              Grado {g}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-emerald-700 px-4 py-1 font-semibold text-white"
        >
          Agregar
        </button>
      </div>
    </form>
  );
}

export function ChildRow({ child }: { child: Child }) {
  const [name, setName] = useState(child.name);
  const [avatar, setAvatar] = useState(child.avatar);
  const [grade, setGrade] = useState(child.grade);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow">
      <select
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
        className="rounded-xl border-2 border-emerald-200 px-2 py-1 text-xl"
      >
        {AVATARS.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-xl border-2 border-emerald-200 px-3 py-1"
      />
      <select
        value={grade}
        onChange={(e) => setGrade(Number(e.target.value))}
        className="rounded-xl border-2 border-emerald-200 px-2 py-1"
      >
        {[1, 2, 3, 4, 5].map((g) => (
          <option key={g} value={g}>
            Grado {g}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(() =>
            updateChildAction(child.id, name.trim(), avatar, grade)
          )
        }
        className="rounded-full bg-emerald-700 px-3 py-1 text-sm font-semibold text-white"
      >
        Guardar
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm(`¿Quitar a ${child.name}?`))
            startTransition(() => deleteChildAction(child.id));
        }}
        className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white"
      >
        Quitar
      </button>
    </div>
  );
}

export function PinForm({ current }: { current: string }) {
  const [pin, setPin] = useState(current);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="rounded-2xl bg-white p-4 shadow"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await setPinAction(pin);
          setSaved(true);
        });
      }}
    >
      <h3 className="font-bold">PIN del líder</h3>
      <div className="mt-2 flex items-center gap-2">
        <input
          inputMode="numeric"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setSaved(false);
          }}
          className="w-32 rounded-xl border-2 border-emerald-200 px-3 py-1 text-center tracking-widest"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-emerald-700 px-4 py-1 font-semibold text-white"
        >
          Cambiar PIN
        </button>
        {saved && <span className="text-sm text-emerald-700">Guardado ✅</span>}
      </div>
    </form>
  );
}
