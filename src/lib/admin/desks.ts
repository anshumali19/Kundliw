import { z } from "zod";
import { prisma } from "@/lib/prisma";

/** The four record lists behind the Sister services desks (matrimony, travel requests, vehicles, tax). */
export type DeskKind = "matrimony" | "travel" | "vehicles" | "tax";

interface Delegate {
  findMany(args: { orderBy: unknown }): Promise<unknown[]>;
  create(args: { data: unknown }): Promise<unknown>;
  update(args: { where: { id: string }; data: unknown }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
}

const text = (max = 200) => z.string().trim().max(max);
const optText = (max = 200) => text(max).nullish().transform((v) => v || null);
const optDate = z.preprocess((v) => (v === "" || v == null ? null : new Date(String(v))), z.date().nullable());
const phone = text(20).min(7, "Enter a phone number");

export const DESKS: Record<DeskKind, { delegate: Delegate; schema: z.ZodObject<z.ZodRawShape>; orderBy: unknown }> = {
  matrimony: {
    delegate: prisma.matrimonyProfile as unknown as Delegate,
    orderBy: [{ createdAt: "desc" }],
    schema: z.object({
      name: text().min(2, "Enter the name"),
      phone,
      gender: z.enum(["MALE", "FEMALE"]),
      dob: optText(20),
      city: optText(),
      about: optText(2000),
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
      isPaidMember: z.boolean(),
      paidUntil: optDate,
      notes: optText(2000),
    }),
  },
  travel: {
    delegate: prisma.travelRequest as unknown as Delegate,
    orderBy: [{ createdAt: "desc" }],
    schema: z.object({
      name: text().min(2, "Enter the name"),
      phone,
      destination: text().min(2, "Enter the destination"),
      travelDate: optDate,
      passengers: z.coerce.number().int().min(1).max(200),
      vehicleId: z.string().nullish().transform((v) => v || null),
      status: z.enum(["NEW", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED"]),
      notes: optText(2000),
    }),
  },
  vehicles: {
    delegate: prisma.travelVehicle as unknown as Delegate,
    orderBy: [{ name: "asc" }],
    schema: z.object({
      name: text().min(2, "Enter the vehicle name"),
      number: text(30).min(2, "Enter the registration number"),
      seats: z.coerce.number().int().min(1).max(100),
      driverName: optText(),
      driverPhone: optText(20),
      isAvailable: z.boolean(),
    }),
  },
  tax: {
    delegate: prisma.taxCase as unknown as Delegate,
    orderBy: [{ createdAt: "desc" }],
    schema: z.object({
      clientName: text().min(2, "Enter the client name"),
      phone,
      assessmentYear: text(20).min(4, "Enter the assessment year, for example 2025-26"),
      docType: text().min(2, "Enter what was submitted"),
      documentUrl: optText(500),
      filingStatus: z.enum(["RECEIVED", "IN_PROGRESS", "FILED", "ACKNOWLEDGED"]),
      ackNumber: optText(60),
      notes: optText(2000),
    }),
  },
};

export function isDeskKind(v: string): v is DeskKind {
  return v in DESKS;
}
