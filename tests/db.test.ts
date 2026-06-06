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
