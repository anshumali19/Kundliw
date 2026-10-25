import { NextRequest, NextResponse } from "next/server";
import { guardApiAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  try {
    const body = await req.json();
    const updated = await prisma.contactEnquiry.update({
      where: { id: params.id },
      data: { isResolved: !!body.isResolved },
    });
    return NextResponse.json({ success: true, enquiry: updated });
  } catch (error) {
    console.error("[API Admin Enquiry PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update enquiry status." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await guardApiAdmin();
  if (guard.errorResponse) return guard.errorResponse;

  try {
    await prisma.contactEnquiry.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: "Enquiry deleted." });
  } catch (error) {
    console.error("[API Admin Enquiry DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete enquiry." },
      { status: 500 }
    );
  }
}
