import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { createSchema, seed } from "@/lib/db";
import {
  sealLevel,
  listChildren,
  getChild,
  getPointsForChild,
  getSchoolPoint,
  toggleBin,
  schedulePickup,
  collectPoint,
  collectiveCount,
  addChild,
  updateChild,
  deleteChild,
  getPin,
  setPin,
} from "@/lib/recycle";

function seededDb() {
  const db = new Database(":memory:");
  createSchema(db);
  seed(db);
  return db;
}

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
