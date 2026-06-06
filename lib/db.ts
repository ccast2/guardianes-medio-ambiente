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
  const dbPath =
    process.env.DB_PATH || path.join(process.cwd(), "data", "recicla.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  _db = new Database(dbPath);
  createSchema(_db);
  if (isEmpty(_db)) seed(_db);
  return _db;
}
