import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { submitManualPayment } from "@/lib/payments/service";
import { getStorageProvider } from "@/lib/storage";
import { PaymentMode, Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let orderId = "";
    let paymentModeStr = "";
    let manualPaymentRef = "";
    let manualPaymentProofUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      orderId = String(formData.get("orderId") || "");
      paymentModeStr = String(formData.get("paymentMode") || "");
      manualPaymentRef = String(formData.get("manualPaymentRef") || "");

      const proofFile = formData.get("proofFile") as File | null;
      if (proofFile && proofFile.size > 0) {
        const buffer = Buffer.from(await proofFile.arrayBuffer());
        const storage = getStorageProvider();
        const stored = await storage.saveFile(
          buffer,
          proofFile.name || "receipt.png",
          proofFile.type || "image/png",
          "payment-proofs"
        );
        manualPaymentProofUrl = stored.publicUrl;
      }
    } else {
      const body = await request.json();
      orderId = body.orderId;
      paymentModeStr = body.paymentMode;
      manualPaymentRef = body.manualPaymentRef;
      manualPaymentProofUrl = body.manualPaymentProofUrl;
    }

    if (!orderId || !manualPaymentRef || !paymentModeStr) {
      return NextResponse.json(
        { error: "Order ID, Payment Mode, and Reference Number are required." },
        { status: 400 }
      );
    }

    const validModes: PaymentMode[] = [
      PaymentMode.MANUAL_UPI,
      PaymentMode.MANUAL_BANK,
      PaymentMode.MANUAL_QR,
    ];
    if (!validModes.includes(paymentModeStr as PaymentMode)) {
      return NextResponse.json(
        { error: "Invalid manual payment mode." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isOwner = order.userId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await submitManualPayment(orderId, {
      paymentMode: paymentModeStr as PaymentMode,
      manualPaymentRef: manualPaymentRef.trim(),
      manualPaymentProofUrl,
    });

    return NextResponse.json({
      success: true,
      orderId: updated.id,
      paymentStatus: updated.paymentStatus,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to submit manual payment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
