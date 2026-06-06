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
