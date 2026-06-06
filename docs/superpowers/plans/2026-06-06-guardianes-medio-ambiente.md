# Guardianes del Medio Ambiente — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, kid-friendly Next.js web app where children mark their recycling bins as full, a leader schedules the recycling truck per point, and children see when the truck passes — with simple seals/achievements for motivation.

**Architecture:** Next.js (App Router) running as a persistent Node server. A SQLite database (`better-sqlite3`) stores children, ecological points, bins and settings. A pure data layer (`lib/db.ts`, `lib/recycle.ts`) is unit-tested with an in-memory database; Server Actions wrap that layer; pages render the UI. Deployed on Railway with the SQLite file on a mounted volume so it survives redeploys.

**Tech Stack:** Next.js 15 (App Router, TypeScript), better-sqlite3, Tailwind CSS, Vitest. Deploy: Railway (Node service + volume).

**Spec:** `docs/superpowers/specs/2026-06-06-guardianes-medio-ambiente-design.md`

**Conventions:** Code in TypeScript; comments and user-facing strings in Spanish (matches the project). Leader PIN default `1234`. App name "Guardianes del Medio Ambiente".

---

## File Structure

```
/app
  layout.tsx                → root layout (fonts, Tailwind, <html lang="es">)
  globals.css               → Tailwind directives + base styles
  page.tsx                  → Inicio "¿Quién eres?" (server component)
  actions.ts                → all Server Actions (wrap lib/recycle.ts)
  /nino/[id]/page.tsx       → Panel del niño
  /nino/[id]/BinButton.tsx  → client component: toggle a bin
  /nino/[id]/logros/page.tsx→ Mis logros
  /lider/page.tsx           → Tablero del líder (PIN gate)
  /lider/PinGate.tsx        → client component: PIN entry
  /lider/PointCard.tsx      → client component: agendar / recogido controls
  /lider/admin/page.tsx     → Administrar niños + PIN
  /lider/admin/AdminForms.tsx → client components for admin forms
/lib
  db.ts                     → connection singleton, schema, seed
  recycle.ts                → data operations + pure helpers (sealLevel)
  types.ts                  → shared TS types
/tests
  db.test.ts                → schema + seed
  recycle.test.ts           → data ops + sealLevel
next.config.ts              → serverExternalPackages for better-sqlite3
vitest.config.ts
tailwind.config.ts
postcss.config.mjs
Dockerfile                  → Railway build (or rely on Nixpacks)
.gitignore
README.md
```

---

## Task 1: Scaffold project, dependencies and tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.gitignore`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (temporary placeholder)

- [ ] **Step 1: Initialize the Next.js app non-interactively**

Run from the project root (`/Users/carlos.castellanos/Development/jjcm`):
```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir=false --import-alias "@/*" --no-turbopack --use-npm --yes
```
Expected: scaffolds `app/`, `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`. If it refuses because the directory is not empty (the `docs/` folder exists), move `docs` aside, scaffold, then move it back:
```bash
mv docs /tmp/jjcm-docs && npx create-next-app@latest . --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-npm --yes && mv /tmp/jjcm-docs docs
```

- [ ] **Step 2: Install runtime and test dependencies**

```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3 vitest
```
Expected: packages added to `package.json`, no errors.

- [ ] **Step 3: Configure better-sqlite3 as an external server package**

Edit `next.config.ts` so the native module is not bundled:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
```

- [ ] **Step 4: Add the Vitest config and test script**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

Add to the `"scripts"` block of `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Ensure the local data dir and DB file are git-ignored**

Append to `.gitignore`:
```
# SQLite local database
/data
*.db
```

- [ ] **Step 6: Smoke-test the toolchain**

Run:
```bash
npm run build
```
Expected: build succeeds (the default scaffolded page compiles). If `better-sqlite3` triggers a native build warning that's fine as long as the build completes.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Tailwind, better-sqlite3 and Vitest"
```

---

## Task 2: Shared types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Define the shared TypeScript types**

Create `lib/types.ts`:
```ts
// Tipos compartidos del dominio.

export type BinType = "glass" | "paper" | "cans" | "organic";

export type PickupStatus = "none" | "scheduled" | "collected";

export interface Child {
  id: number;
  name: string;
  avatar: string; // emoji
  grade: number;
  seal_count: number;
  created_at: string;
}

export interface Point {
  id: number;
  child_id: number | null; // null = punto de la escuela
  kind: "home" | "school";
  label: string;
  pickup_date: string | null; // YYYY-MM-DD
  pickup_status: PickupStatus;
}

export interface Bin {
  id: number;
  point_id: number;
  type: BinType;
  is_full: boolean;
  marked_at: string | null;
}

// Un punto con sus recipientes, tal como lo consumen las pantallas.
export interface PointWithBins extends Point {
  bins: Bin[];
}

export const BIN_TYPES: BinType[] = ["glass", "paper", "cans", "organic"];

// Etiquetas y colores para la UI (los usaremos en las pantallas).
export const BIN_META: Record<BinType, { label: string; emoji: string }> = {
  glass: { label: "Vidrio", emoji: "🟢" },
  paper: { label: "Papel/Cartón", emoji: "🔵" },
  cans: { label: "Latas/Plástico", emoji: "🟡" },
  organic: { label: "Foso (orgánicos)", emoji: "🟤" },
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add shared domain types"
```

---

## Task 3: Database schema and seed (TDD)

**Files:**
- Create: `lib/db.ts`
- Test: `tests/db.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/db.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { createSchema, seed, isEmpty } from "@/lib/db";

function freshDb() {
  const db = new Database(":memory:");
  createSchema(db);
  return db;
}

describe("schema + seed", () => {
  it("creates the four tables", () => {
    const db = freshDb();
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((r: any) => r.name);
    expect(tables).toEqual(
      expect.arrayContaining(["children", "points", "bins", "settings"])
    );
  });

  it("reports empty before seeding and not empty after", () => {
    const db = freshDb();
    expect(isEmpty(db)).toBe(true);
    seed(db);
    expect(isEmpty(db)).toBe(false);
  });

  it("seeds 5 children, 6 points (5 home + 1 school), 24 bins and a PIN", () => {
    const db = freshDb();
    seed(db);
    const children = db.prepare("SELECT COUNT(*) c FROM children").get() as any;
    const points = db.prepare("SELECT COUNT(*) c FROM points").get() as any;
    const homePoints = db
      .prepare("SELECT COUNT(*) c FROM points WHERE kind='home'")
      .get() as any;
    const schoolPoints = db
      .prepare("SELECT COUNT(*) c FROM points WHERE kind='school'")
      .get() as any;
    const bins = db.prepare("SELECT COUNT(*) c FROM bins").get() as any;
    const pin = db
      .prepare("SELECT value FROM settings WHERE key='leader_pin'")
      .get() as any;

    expect(children.c).toBe(5);
    expect(points.c).toBe(6);
    expect(homePoints.c).toBe(5);
    expect(schoolPoints.c).toBe(1);
    expect(bins.c).toBe(24); // 6 points * 4 bins
    expect(pin.value).toBe("1234");
  });

  it("is idempotent: seeding twice does not duplicate", () => {
    const db = freshDb();
    seed(db);
    seed(db);
    const children = db.prepare("SELECT COUNT(*) c FROM children").get() as any;
    expect(children.c).toBe(5);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/db.test.ts`
Expected: FAIL — cannot import `createSchema`/`seed`/`isEmpty` (module not found).

- [ ] **Step 3: Write the implementation**

Create `lib/db.ts`:
```ts
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { BIN_TYPES } from "./types";

type DB = Database.Database;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  grade INTEGER NOT NULL,
  seal_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  label TEXT NOT NULL,
  pickup_date TEXT,
  pickup_status TEXT NOT NULL DEFAULT 'none'
);
CREATE TABLE IF NOT EXISTS bins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  point_id INTEGER NOT NULL REFERENCES points(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  is_full INTEGER NOT NULL DEFAULT 0,
  marked_at TEXT
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

export function createSchema(db: DB): void {
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
}

export function isEmpty(db: DB): boolean {
  const row = db.prepare("SELECT COUNT(*) c FROM children").get() as {
    c: number;
  };
  return row.c === 0;
}

// Crea un punto con sus 4 recipientes vacíos. Devuelve el id del punto.
function createPointWithBins(
  db: DB,
  childId: number | null,
  kind: "home" | "school",
  label: string
): number {
  const info = db
    .prepare("INSERT INTO points (child_id, kind, label) VALUES (?, ?, ?)")
    .run(childId, kind, label);
  const pointId = Number(info.lastInsertRowid);
  const insertBin = db.prepare(
    "INSERT INTO bins (point_id, type, is_full) VALUES (?, ?, 0)"
  );
  for (const type of BIN_TYPES) insertBin.run(pointId, type);
  return pointId;
}

export function seed(db: DB): void {
  if (!isEmpty(db)) return; // idempotente

  const niños: Array<{ name: string; avatar: string; grade: number }> = [
    { name: "Damián", avatar: "🦊", grade: 1 },
    { name: "Jerónimo", avatar: "🐼", grade: 2 },
    { name: "Chaves", avatar: "🐢", grade: 3 },
    { name: "Barrera", avatar: "🦉", grade: 4 },
    { name: "Rodríguez", avatar: "🐝", grade: 5 },
  ];

  const tx = db.transaction(() => {
    const insertChild = db.prepare(
      "INSERT INTO children (name, avatar, grade) VALUES (?, ?, ?)"
    );
    for (const n of niños) {
      const info = insertChild.run(n.name, n.avatar, n.grade);
      createPointWithBins(db, Number(info.lastInsertRowid), "home", "Mi casa");
    }
    createPointWithBins(db, null, "school", "La escuela");
    db.prepare(
      "INSERT INTO settings (key, value) VALUES ('leader_pin', '1234')"
    ).run();
  });
  tx();
}

// --- Singleton de conexión para la app (no se usa en tests) ---
let _db: DB | null = null;

export function getDb(): DB {
  if (_db) return _db;
  const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "recicla.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  _db = new Database(dbPath);
  createSchema(_db);
  if (isEmpty(_db)) seed(_db);
  return _db;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/db.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/db.ts tests/db.test.ts
git commit -m "feat: SQLite schema, seed and connection singleton"
```

---

## Task 4: Pure helper `sealLevel` (TDD)

**Files:**
- Modify: `lib/recycle.ts` (create)
- Test: `tests/recycle.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `tests/recycle.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { sealLevel } from "@/lib/recycle";

describe("sealLevel", () => {
  it("returns seedling for 0–2", () => {
    expect(sealLevel(0)).toBe("🌱");
    expect(sealLevel(2)).toBe("🌱");
  });
  it("returns tree for 3–6", () => {
    expect(sealLevel(3)).toBe("🌳");
    expect(sealLevel(6)).toBe("🌳");
  });
  it("returns planet for 7+", () => {
    expect(sealLevel(7)).toBe("🌍");
    expect(sealLevel(99)).toBe("🌍");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/recycle.test.ts`
Expected: FAIL — `sealLevel` not exported / module not found.

- [ ] **Step 3: Write the minimal implementation**

Create `lib/recycle.ts`:
```ts
// Operaciones de datos del dominio + helpers puros.
// Las funciones reciben la conexión `db` para poder probarlas con SQLite en memoria.

// Devuelve el emoji del sello según la cantidad acumulada.
export function sealLevel(count: number): "🌱" | "🌳" | "🌍" {
  if (count >= 7) return "🌍";
  if (count >= 3) return "🌳";
  return "🌱";
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/recycle.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/recycle.ts tests/recycle.test.ts
git commit -m "feat: add sealLevel helper"
```

---

## Task 5: Read operations — children & points with bins (TDD)

**Files:**
- Modify: `lib/recycle.ts`
- Test: `tests/recycle.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `tests/recycle.test.ts`:
```ts
import Database from "better-sqlite3";
import { createSchema, seed } from "@/lib/db";
import {
  listChildren,
  getChild,
  getPointsForChild,
  getSchoolPoint,
} from "@/lib/recycle";

function seededDb() {
  const db = new Database(":memory:");
  createSchema(db);
  seed(db);
  return db;
}

describe("read operations", () => {
  it("listChildren returns the 5 seeded children", () => {
    const db = seededDb();
    const children = listChildren(db);
    expect(children).toHaveLength(5);
    expect(children[0].name).toBe("Damián");
  });

  it("getChild returns one child by id", () => {
    const db = seededDb();
    const child = getChild(db, 1);
    expect(child?.name).toBe("Damián");
    expect(getChild(db, 999)).toBeNull();
  });

  it("getPointsForChild returns the home point with 4 bins", () => {
    const db = seededDb();
    const points = getPointsForChild(db, 1);
    expect(points).toHaveLength(1);
    expect(points[0].kind).toBe("home");
    expect(points[0].bins).toHaveLength(4);
    expect(points[0].bins.every((b) => b.is_full === false)).toBe(true);
  });

  it("getSchoolPoint returns the shared school point with bins", () => {
    const db = seededDb();
    const school = getSchoolPoint(db);
    expect(school?.kind).toBe("school");
    expect(school?.child_id).toBeNull();
    expect(school?.bins).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/recycle.test.ts`
Expected: FAIL — `listChildren` etc. not exported.

- [ ] **Step 3: Write the implementation**

Append to `lib/recycle.ts`:
```ts
import type Database from "better-sqlite3";
import type { Child, Point, PointWithBins, Bin } from "./types";

type DB = Database.Database;

// Convierte la fila cruda (is_full como 0/1) al tipo Bin.
function rowToBin(row: any): Bin {
  return { ...row, is_full: row.is_full === 1 };
}

function binsForPoint(db: DB, pointId: number): Bin[] {
  const rows = db
    .prepare("SELECT * FROM bins WHERE point_id = ? ORDER BY id")
    .all(pointId);
  return rows.map(rowToBin);
}

export function listChildren(db: DB): Child[] {
  return db.prepare("SELECT * FROM children ORDER BY grade").all() as Child[];
}

export function getChild(db: DB, id: number): Child | null {
  const row = db.prepare("SELECT * FROM children WHERE id = ?").get(id) as
    | Child
    | undefined;
  return row ?? null;
}

export function getPointsForChild(db: DB, childId: number): PointWithBins[] {
  const points = db
    .prepare("SELECT * FROM points WHERE child_id = ? ORDER BY id")
    .all(childId) as Point[];
  return points.map((p) => ({ ...p, bins: binsForPoint(db, p.id) }));
}

export function getSchoolPoint(db: DB): PointWithBins | null {
  const point = db
    .prepare("SELECT * FROM points WHERE kind = 'school' LIMIT 1")
    .get() as Point | undefined;
  if (!point) return null;
  return { ...point, bins: binsForPoint(db, point.id) };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- tests/recycle.test.ts`
Expected: PASS (all read + sealLevel tests).

- [ ] **Step 5: Commit**

```bash
git add lib/recycle.ts tests/recycle.test.ts
git commit -m "feat: read operations for children and points"
```

---

## Task 6: Write operations — toggle bin, schedule pickup, collect (TDD)

**Files:**
- Modify: `lib/recycle.ts`
- Test: `tests/recycle.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `tests/recycle.test.ts`:
```ts
import {
  toggleBin,
  schedulePickup,
  collectPoint,
  collectiveCount,
} from "@/lib/recycle";

describe("write operations", () => {
  it("toggleBin flips is_full and sets/clears marked_at", () => {
    const db = seededDb();
    const point = getPointsForChild(db, 1)[0];
    const binId = point.bins[0].id;

    toggleBin(db, binId);
    let bin = db.prepare("SELECT * FROM bins WHERE id = ?").get(binId) as any;
    expect(bin.is_full).toBe(1);
    expect(bin.marked_at).not.toBeNull();

    toggleBin(db, binId);
    bin = db.prepare("SELECT * FROM bins WHERE id = ?").get(binId) as any;
    expect(bin.is_full).toBe(0);
    expect(bin.marked_at).toBeNull();
  });

  it("schedulePickup sets date and status", () => {
    const db = seededDb();
    const point = getPointsForChild(db, 1)[0];
    schedulePickup(db, point.id, "2026-06-09");
    const updated = db
      .prepare("SELECT * FROM points WHERE id = ?")
      .get(point.id) as any;
    expect(updated.pickup_date).toBe("2026-06-09");
    expect(updated.pickup_status).toBe("scheduled");
  });

  it("collectPoint empties bins, marks collected and awards a seal", () => {
    const db = seededDb();
    const point = getPointsForChild(db, 1)[0];
    toggleBin(db, point.bins[0].id); // dejar un recipiente lleno

    const result = collectPoint(db, point.id);

    expect(result.awardedChildId).toBe(1);
    const child = getChild(db, 1);
    expect(child?.seal_count).toBe(1);
    const refreshed = getPointsForChild(db, 1)[0];
    expect(refreshed.bins.every((b) => b.is_full === false)).toBe(true);
    expect(refreshed.pickup_status).toBe("collected");
  });

  it("collectPoint awards no seal when nothing was full", () => {
    const db = seededDb();
    const point = getPointsForChild(db, 1)[0];
    const result = collectPoint(db, point.id);
    expect(result.awardedChildId).toBeNull();
    expect(getChild(db, 1)?.seal_count).toBe(0);
  });

  it("collectPoint on the school point awards no seal (no owner)", () => {
    const db = seededDb();
    const school = getSchoolPoint(db)!;
    toggleBin(db, school.bins[0].id);
    const result = collectPoint(db, school.id);
    expect(result.awardedChildId).toBeNull();
  });

  it("collectiveCount sums all seal counts", () => {
    const db = seededDb();
    const point = getPointsForChild(db, 1)[0];
    toggleBin(db, point.bins[0].id);
    collectPoint(db, point.id);
    expect(collectiveCount(db)).toBe(1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/recycle.test.ts`
Expected: FAIL — write functions not exported.

- [ ] **Step 3: Write the implementation**

Append to `lib/recycle.ts`:
```ts
// Marca/desmarca un recipiente como lleno.
export function toggleBin(db: DB, binId: number): void {
  const bin = db.prepare("SELECT is_full FROM bins WHERE id = ?").get(binId) as
    | { is_full: number }
    | undefined;
  if (!bin) return;
  if (bin.is_full === 1) {
    db.prepare("UPDATE bins SET is_full = 0, marked_at = NULL WHERE id = ?").run(
      binId
    );
  } else {
    db.prepare(
      "UPDATE bins SET is_full = 1, marked_at = datetime('now') WHERE id = ?"
    ).run(binId);
  }
}

// Agenda la recogida del camión para un punto.
export function schedulePickup(db: DB, pointId: number, date: string): void {
  db.prepare(
    "UPDATE points SET pickup_date = ?, pickup_status = 'scheduled' WHERE id = ?"
  ).run(date, pointId);
}

// Marca un punto como recogido: vacía recipientes, marca 'collected'
// y, si había algo lleno y el punto tiene dueño, suma un sello.
export function collectPoint(
  db: DB,
  pointId: number
): { awardedChildId: number | null } {
  const point = db.prepare("SELECT * FROM points WHERE id = ?").get(pointId) as
    | { id: number; child_id: number | null }
    | undefined;
  if (!point) return { awardedChildId: null };

  const full = db
    .prepare("SELECT COUNT(*) c FROM bins WHERE point_id = ? AND is_full = 1")
    .get(pointId) as { c: number };
  const hadFull = full.c > 0;

  const tx = db.transaction(() => {
    db.prepare(
      "UPDATE bins SET is_full = 0, marked_at = NULL WHERE point_id = ?"
    ).run(pointId);
    db.prepare(
      "UPDATE points SET pickup_status = 'collected', pickup_date = NULL WHERE id = ?"
    ).run(pointId);
    if (hadFull && point.child_id != null) {
      db.prepare(
        "UPDATE children SET seal_count = seal_count + 1 WHERE id = ?"
      ).run(point.child_id);
    }
  });
  tx();

  return {
    awardedChildId: hadFull && point.child_id != null ? point.child_id : null,
  };
}

export function collectiveCount(db: DB): number {
  const row = db
    .prepare("SELECT COALESCE(SUM(seal_count), 0) s FROM children")
    .get() as { s: number };
  return row.s;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- tests/recycle.test.ts`
Expected: PASS (all write tests).

- [ ] **Step 5: Commit**

```bash
git add lib/recycle.ts tests/recycle.test.ts
git commit -m "feat: write operations — toggle bin, schedule pickup, collect"
```

---

## Task 7: Admin operations — children CRUD and PIN (TDD)

**Files:**
- Modify: `lib/recycle.ts`
- Test: `tests/recycle.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `tests/recycle.test.ts`:
```ts
import {
  addChild,
  updateChild,
  deleteChild,
  getPin,
  setPin,
} from "@/lib/recycle";

describe("admin operations", () => {
  it("addChild creates a child plus a home point with 4 bins", () => {
    const db = seededDb();
    const id = addChild(db, "Nueva", "🐧", 1);
    expect(getChild(db, id)?.name).toBe("Nueva");
    const points = getPointsForChild(db, id);
    expect(points).toHaveLength(1);
    expect(points[0].bins).toHaveLength(4);
  });

  it("updateChild changes name, avatar and grade", () => {
    const db = seededDb();
    updateChild(db, 1, "Damián R.", "🐯", 2);
    const c = getChild(db, 1);
    expect(c?.name).toBe("Damián R.");
    expect(c?.avatar).toBe("🐯");
    expect(c?.grade).toBe(2);
  });

  it("deleteChild removes the child and cascades its points/bins", () => {
    const db = seededDb();
    const points = getPointsForChild(db, 1);
    deleteChild(db, 1);
    expect(getChild(db, 1)).toBeNull();
    const bins = db
      .prepare("SELECT COUNT(*) c FROM bins WHERE point_id = ?")
      .get(points[0].id) as any;
    expect(bins.c).toBe(0);
  });

  it("getPin / setPin read and update the leader PIN", () => {
    const db = seededDb();
    expect(getPin(db)).toBe("1234");
    setPin(db, "9876");
    expect(getPin(db)).toBe("9876");
  });
});
```

Note: `deleteChild` cascade requires `PRAGMA foreign_keys = ON`. In tests the in-memory db is created via `createSchema`, which already sets that pragma. `getDb()` also sets it.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/recycle.test.ts`
Expected: FAIL — admin functions not exported.

- [ ] **Step 3: Write the implementation**

Append to `lib/recycle.ts`:
```ts
import { BIN_TYPES } from "./types";

export function addChild(
  db: DB,
  name: string,
  avatar: string,
  grade: number
): number {
  const tx = db.transaction(() => {
    const info = db
      .prepare("INSERT INTO children (name, avatar, grade) VALUES (?, ?, ?)")
      .run(name, avatar, grade);
    const childId = Number(info.lastInsertRowid);
    const pointInfo = db
      .prepare(
        "INSERT INTO points (child_id, kind, label) VALUES (?, 'home', 'Mi casa')"
      )
      .run(childId);
    const pointId = Number(pointInfo.lastInsertRowid);
    const insertBin = db.prepare(
      "INSERT INTO bins (point_id, type, is_full) VALUES (?, ?, 0)"
    );
    for (const type of BIN_TYPES) insertBin.run(pointId, type);
    return childId;
  });
  return tx();
}

export function updateChild(
  db: DB,
  id: number,
  name: string,
  avatar: string,
  grade: number
): void {
  db.prepare(
    "UPDATE children SET name = ?, avatar = ?, grade = ? WHERE id = ?"
  ).run(name, avatar, grade, id);
}

export function deleteChild(db: DB, id: number): void {
  db.prepare("DELETE FROM children WHERE id = ?").run(id);
}

export function getPin(db: DB): string {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'leader_pin'")
    .get() as { value: string } | undefined;
  return row?.value ?? "1234";
}

export function setPin(db: DB, pin: string): void {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('leader_pin', ?) " +
      "ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(pin);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- tests/recycle.test.ts`
Expected: PASS (all admin tests + previous).

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: PASS — `tests/db.test.ts` and `tests/recycle.test.ts`, all green.

- [ ] **Step 6: Commit**

```bash
git add lib/recycle.ts tests/recycle.test.ts
git commit -m "feat: admin operations — children CRUD and PIN"
```

---

## Task 8: Server Actions

**Files:**
- Create: `app/actions.ts`

- [ ] **Step 1: Write the Server Actions module**

Create `app/actions.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import {
  toggleBin,
  schedulePickup,
  collectPoint,
  addChild,
  updateChild,
  deleteChild,
  getPin,
  setPin,
} from "@/lib/recycle";

export async function toggleBinAction(binId: number, childId: number) {
  toggleBin(getDb(), binId);
  revalidatePath(`/nino/${childId}`);
  revalidatePath("/lider");
}

export async function schedulePickupAction(pointId: number, date: string) {
  schedulePickup(getDb(), pointId, date);
  revalidatePath("/lider");
}

export async function collectPointAction(pointId: number) {
  collectPoint(getDb(), pointId);
  revalidatePath("/lider");
}

export async function verifyPinAction(pin: string): Promise<boolean> {
  return getPin(getDb()) === pin;
}

export async function addChildAction(
  name: string,
  avatar: string,
  grade: number
) {
  addChild(getDb(), name, avatar, grade);
  revalidatePath("/lider/admin");
  revalidatePath("/");
}

export async function updateChildAction(
  id: number,
  name: string,
  avatar: string,
  grade: number
) {
  updateChild(getDb(), id, name, avatar, grade);
  revalidatePath("/lider/admin");
  revalidatePath("/");
}

export async function deleteChildAction(id: number) {
  deleteChild(getDb(), id);
  revalidatePath("/lider/admin");
  revalidatePath("/");
}

export async function setPinAction(pin: string) {
  setPin(getDb(), pin);
  revalidatePath("/lider/admin");
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add app/actions.ts
git commit -m "feat: server actions wrapping the data layer"
```

---

## Task 9: Root layout and global styles

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`

- [ ] **Step 1: Set Spanish lang and app metadata in the layout**

Replace `app/layout.tsx` with:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guardianes del Medio Ambiente",
  description: "Reciclando al planeta vamos cuidando 🌍",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-b from-emerald-50 to-sky-100 text-emerald-950 antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Ensure Tailwind directives are present in globals.css**

Confirm `app/globals.css` begins with the Tailwind import (Tailwind v4 default from create-next-app):
```css
@import "tailwindcss";
```
If the scaffold used v3-style directives instead, leave them as generated. Do not remove existing base styles.

- [ ] **Step 3: Verify the app boots**

Run: `npm run dev` (then stop it after confirming)
Expected: dev server starts at http://localhost:3000 with no compile errors.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: Spanish root layout and base background"
```

---

## Task 10: Inicio — "¿Quién eres?"

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the Inicio page**

Replace `app/page.tsx` with:
```tsx
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
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev` and open http://localhost:3000
Expected: the 5 seeded children appear as cards with avatar/name/grade, plus the "Soy el líder" button. Clicking a child navigates to `/nino/<id>` (will 404 until Task 11 — that's expected).

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: Inicio screen with child picker and leader entry"
```

---

## Task 11: Panel del niño + BinButton

**Files:**
- Create: `app/nino/[id]/page.tsx`, `app/nino/[id]/BinButton.tsx`

- [ ] **Step 1: Write the BinButton client component**

Create `app/nino/[id]/BinButton.tsx`:
```tsx
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
      onClick={() =>
        startTransition(() => toggleBinAction(bin.id, childId))
      }
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
```

- [ ] **Step 2: Write the Panel del niño page**

Create `app/nino/[id]/page.tsx`:
```tsx
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
      Aún no hay fecha para <b>{point.label}</b>, ¡el líder la pondrá pronto!
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
          ✅ El líder ya puede ver lo que está lleno aquí.
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
        <Link href="/" className="text-sm text-emerald-700">
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
            Tu sello: <span className="text-2xl">{sealLevel(child.seal_count)}</span>
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
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open a child from Inicio.
Expected: greeting with avatar + seal; "Mi casa" and "La escuela" sections each with 4 bin buttons. Tapping a bin toggles it red/"¡Lleno!" and the page updates. Pickup card shows the "no hay fecha" message initially.

- [ ] **Step 4: Commit**

```bash
git add "app/nino/[id]/page.tsx" "app/nino/[id]/BinButton.tsx"
git commit -m "feat: panel del niño with toggleable bins and pickup card"
```

---

## Task 12: Mis logros

**Files:**
- Create: `app/nino/[id]/logros/page.tsx`

- [ ] **Step 1: Write the logros page**

Create `app/nino/[id]/logros/page.tsx`:
```tsx
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
      <Link href={`/nino/${childId}`} className="block text-left text-sm text-emerald-700">
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
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, open `/nino/1/logros`.
Expected: shows the seal, the personal count, the three-stage legend, and the collective counter.

- [ ] **Step 3: Commit**

```bash
git add "app/nino/[id]/logros/page.tsx"
git commit -m "feat: mis logros screen with seals and collective counter"
```

---

## Task 13: Tablero del líder + PIN gate

**Files:**
- Create: `app/lider/page.tsx`, `app/lider/PinGate.tsx`, `app/lider/PointCard.tsx`

- [ ] **Step 1: Write the PinGate client component**

Create `app/lider/PinGate.tsx`:
```tsx
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
      <h1 className="mt-2 text-xl font-bold">Acceso del líder</h1>
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
```

- [ ] **Step 2: Write the PointCard client component**

Create `app/lider/PointCard.tsx`:
```tsx
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
```

- [ ] **Step 3: Write the Tablero page**

Create `app/lider/page.tsx`:
```tsx
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
          <Link href="/" className="text-sm text-emerald-700">
            ← Inicio
          </Link>
          <Link
            href="/lider/admin"
            className="rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white"
          >
            Administrar ⚙️
          </Link>
        </div>

        <h1 className="mt-4 text-2xl font-extrabold">Tablero del líder 🧑‍🏫</h1>
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
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open `/lider`.
Expected: PIN gate appears; entering `1234` shows the board. Mark a bin full from a child's panel in another tab, refresh `/lider` → that point shows "⚠️ Espera recogida" and the full bin chip. Pick a date + "Agendar camión" → the child's panel shows the scheduled date. "Marcar como recogido" → bins clear and the child's seal count goes up (check `/nino/<id>/logros`).

- [ ] **Step 5: Commit**

```bash
git add "app/lider/page.tsx" "app/lider/PinGate.tsx" "app/lider/PointCard.tsx"
git commit -m "feat: tablero del líder with PIN gate, scheduling and collect"
```

---

## Task 14: Administrar (líder)

**Files:**
- Create: `app/lider/admin/page.tsx`, `app/lider/admin/AdminForms.tsx`

- [ ] **Step 1: Write the admin client forms**

Create `app/lider/admin/AdminForms.tsx`:
```tsx
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
```

- [ ] **Step 2: Write the admin page**

Create `app/lider/admin/page.tsx`:
```tsx
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
```

Note: the admin page is reached only from inside the PIN-gated `/lider`, so it does not need its own gate. (Direct URL access to `/lider/admin` is possible; acceptable for this small classroom app — documented as out of scope to harden.)

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, go `/lider` → enter PIN → "Administrar". Add a child (appears on Inicio), edit a name, change the PIN (log out by reloading `/lider` and confirm the new PIN works), delete a test child.

- [ ] **Step 4: Commit**

```bash
git add "app/lider/admin/page.tsx" "app/lider/admin/AdminForms.tsx"
git commit -m "feat: admin screen — manage children and PIN"
```

---

## Task 15: Production build, Railway deploy config and README

**Files:**
- Create: `Dockerfile`, `README.md`
- Modify: `next.config.ts`

- [ ] **Step 1: Enable standalone output for a small Docker image**

Update `next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
```

- [ ] **Step 2: Add a Dockerfile that compiles better-sqlite3 natively**

Create `Dockerfile`:
```dockerfile
FROM node:20-bookworm-slim AS base
# better-sqlite3 needs build tools to compile its native addon
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production
ENV DB_PATH=/data/recicla.db
# standalone output bundles only what is needed to run
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 3: Verify the production build locally**

Run:
```bash
npm run build
```
Expected: build completes; `.next/standalone/server.js` exists. (Optional local run: `DB_PATH=./data/recicla.db node .next/standalone/server.js` then open http://localhost:3000.)

- [ ] **Step 4: Write the README with Railway steps**

Create `README.md`:
```markdown
# Guardianes del Medio Ambiente 🌍

App escolar de reciclaje (proyecto "Reciclando al planeta vamos cuidando",
Escuela José Joaquín Castro Martínez). Los niños marcan recipientes llenos,
el líder agenda la recogida del camión y todos ganan sellos.

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # pruebas de la capa de datos
```

La base SQLite se crea sola en `./data/recicla.db` con datos de ejemplo.
PIN del líder por defecto: **1234** (cambiable en Administrar).

## Despliegue en Railway

1. `railway login`
2. `railway init` (nuevo proyecto o service; no afecta apps existentes)
3. En el dashboard del service: **Settings → Volumes → New Volume**, montado en `/data`.
4. **Variables**: `DB_PATH=/data/recicla.db`.
5. `railway up` (usa el `Dockerfile`). Railway expone un dominio `*.up.railway.app`.
6. Opcional: conectar un repo de GitHub para auto-deploy en cada push.

La base de datos vive en el volumen montado en `/data`, así que **persiste entre
despliegues**.
```

- [ ] **Step 5: Commit**

```bash
git add Dockerfile README.md next.config.ts
git commit -m "chore: Railway deploy config (standalone build, Dockerfile, README)"
```

- [ ] **Step 6 (optional, requires Railway CLI auth): Deploy**

Run (user-driven, interactive login may be needed — suggest the user runs `! railway login`):
```bash
railway init
railway up
```
Then add the volume at `/data` and the `DB_PATH` env var in the dashboard.
Expected: app reachable at the Railway-provided URL; child picker loads.

---

## Self-Review Notes

- **Spec coverage:** roles + avatar login (T10, T13 PinGate), 4 bins per point incl. organic/foso (T2 BIN_TYPES, T3 seed), home + shared school point (T3 seed, T5 reads), mark full (T6 toggleBin, T11), avisar al líder (UI confirmation in T11, no table — per spec), schedule per point (T6 schedulePickup, T13), child sees pickup + countdown (T11 PickupCard), collect → empty + seal (T6 collectPoint, T13), seals 🌱→🌳→🌍 derived (T4 sealLevel), collective counter (T6 collectiveCount, T12), admin children + PIN (T7, T14), SQLite on Railway volume (T3 DB_PATH, T15). All covered.
- **Type consistency:** `toggleBinAction(binId, childId)`, `collectPoint → {awardedChildId}`, `PointWithBins.bins`, `BIN_META`/`BIN_TYPES` used consistently across tasks.
- **Out of scope (per spec):** photos, leader notes, ordered route, competitive ranking, hardening direct `/lider/admin` URL access.
