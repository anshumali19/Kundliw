import { prisma } from "@/lib/prisma";
import { formatGstRateBasisPoints } from "./gst";

export interface GstSettingsSnapshot {
  /** Effective rate in basis points (0 when GST is not applicable). */
  rateBasisPoints: number;
  /** Rate as a percentage string, e.g. "18" or "12.5". */
  ratePercent: string;
  /** Human-readable label, e.g. "GST @ 18%". */
  label: string;
  /** GSTIN snapshot, or null when the Kendra is unregistered. */
  gstin: string | null;
  enabled: boolean;
}

interface GstSettingsSource {
  adminSettings: {
    findUnique(args: { where: { id: string } }): Promise<{
      gstin?: string | null;
      defaultGstRateBps?: number | null;
    } | null>;
  };
}

/**
 * Single source of truth for GST rate/label.
 *
 * Mirrors the order-creation rules: a configured GSTIN enables GST at
 * `defaultGstRateBps` (falling back to 18%), while a missing GSTIN means the
 * Kendra is unregistered and no GST is charged. Both the coupon preview and
 * order creation must use this helper so their totals cannot diverge.
 */
export async function getGstSettings(
  client?: GstSettingsSource
): Promise<GstSettingsSnapshot> {
  const db = client ?? (prisma as unknown as GstSettingsSource);
  const settings = await db.adminSettings.findUnique({ where: { id: "default" } });

  const gstin = settings?.gstin && settings.gstin.trim() ? settings.gstin : null;
  const enabled = Boolean(gstin);
  const rateBasisPoints = enabled ? (settings?.defaultGstRateBps ?? 1800) : 0;
  const ratePercent = formatGstRateBasisPoints(rateBasisPoints);

  return {
    rateBasisPoints,
    ratePercent,
    label: `GST @ ${ratePercent}%`,
    gstin,
    enabled,
  };
}
