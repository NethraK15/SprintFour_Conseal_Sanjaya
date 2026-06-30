import type { EntityType } from "@/types";

export const ENTITY_LABELS: Record<EntityType, string> = {
  NAME: "Name",
  EMAIL: "Email",
  PHONE: "Phone Number",
  ADDRESS: "Address",
  BANK_ACCOUNT: "Bank Account",
  PASSPORT: "Passport Number",
  PAN: "PAN Number",
  DATE: "Date",
  ORGANIZATION: "Organization",
};

export const ENTITY_COLORS: Record<EntityType, string> = {
  NAME: "bg-blue-100 text-blue-800 border-blue-200",
  EMAIL: "bg-purple-100 text-purple-800 border-purple-200",
  PHONE: "bg-amber-100 text-amber-800 border-amber-200",
  ADDRESS: "bg-emerald-100 text-emerald-800 border-emerald-200",
  BANK_ACCOUNT: "bg-rose-100 text-rose-800 border-rose-200",
  PASSPORT: "bg-indigo-100 text-indigo-800 border-indigo-200",
  PAN: "bg-cyan-100 text-cyan-800 border-cyan-200",
  DATE: "bg-emerald-50 text-emerald-900 border-emerald-300 underline decoration-emerald-500 decoration-dotted",
  ORGANIZATION: "bg-emerald-50 text-emerald-900 border-emerald-300 underline decoration-emerald-500 decoration-dotted",
};

export function confidenceTone(confidence: number) {
  if (confidence >= 0.85) return "success";
  if (confidence >= 0.7) return "default";
  return "warning";
}
