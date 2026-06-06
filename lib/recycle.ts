// Operaciones de datos del dominio + helpers puros.
// Las funciones reciben la conexión `db` para poder probarlas con SQLite en memoria.

import type Database from "better-sqlite3";
import type { Child, Point, PointWithBins, Bin } from "./types";
import { BIN_TYPES } from "./types";

type DB = Database.Database;

// Devuelve el emoji del sello según la cantidad acumulada.
export function sealLevel(count: number): "🌱" | "🌳" | "🌍" {
  if (count >= 7) return "🌍";
  if (count >= 3) return "🌳";
  return "🌱";
}

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

// Marca/desmarca un recipiente como lleno.
export function toggleBin(db: DB, binId: number): void {
  const bin = db.prepare("SELECT is_full FROM bins WHERE id = ?").get(binId) as
    | { is_full: number }
    | undefined;
  if (!bin) return;
  if (bin.is_full === 1) {
    db.prepare(
      "UPDATE bins SET is_full = 0, marked_at = NULL WHERE id = ?"
    ).run(binId);
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
