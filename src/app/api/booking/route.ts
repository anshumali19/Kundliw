import { NextRequest, NextResponse } from "next/server";
import { guardApiUser } from "@/lib/auth/guards";
import { validateCsrfOrigin } from "@/lib/auth/csrf";
import { createBookingOrderSchema } from "@/features/booking/validation";
import { createBookingOrder, BookingError } from "@/lib/booking/service";
import { REFERRAL_COOKIE } from "@/lib/associates/service";

export async function POST(request: NextRequest) {
  // 1. Enforce user authentication
  const guard = await guardApiUser();
  if (!guard.ok) {
    return guard.errorResponse;
  }
  const user = guard.user;

  // 2. Enforce CSRF Origin validation
  const csrf = validateCsrfOrigin(request);
  if (!csrf.isValid) {
    return csrf.errorResponse;
  }

  try {
    const body = await request.json();
    const parsed = createBookingOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 3. Create order transactionally with server-side pricing
    const referralCode = parsed.data.referralCode || request.cookies.get(REFERRAL_COOKIE)?.value || null;
    const result = await createBookingOrder(user.id, parsed.data, referralCode);

    return NextResponse.json(
      {
        success: true,
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        netAmountPaise: result.netAmountPaise,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Booking order creation error:", error);

    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 }
    );
  }
}
