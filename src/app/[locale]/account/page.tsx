import { redirect } from "next/navigation";
import { loadPlanTitleMap, bundleTitle } from "@/lib/booking/bundle";
import { Role } from "@prisma/client";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { formatPaiseToInr } from "@/lib/billing/gst";
import { OrderStatusStepper } from "@/features/orders/components/OrderStatusStepper";
import { CanonicalOrderStatus } from "@/lib/orders/status";
import {
  User,
  Package,
  Calendar,
  Clock,
  Download,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  FileText,
  AlertCircle,
} from "lucide-react";

interface AccountPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AccountPage(props: AccountPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const user = await requireUser("/account", locale);
  if (user.role === Role.ASSOCIATE) {
    redirect(`/${locale}/associate`);
  }
  const isHindi = locale === "hi";

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      service: true,
      plan: true,
      slot: true,
      statusEvents: {
        orderBy: { createdAt: "desc" },
        include: {
          changedBy: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });
  const planMap = await loadPlanTitleMap(orders.flatMap((o) => o.extraPlanIds));

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 text-left space-y-8">
      {/* User Profile Header Card */}
      <div className="bg-surface-container rounded-lg p-6 sm:p-8 border-2 border-secondary/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand text-on-brand flex items-center justify-center font-serif text-xl font-bold shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : "Y"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-secondary">
                {user.name || (isHindi ? "सम्मानित ग्राहक" : "Valued Customer")}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-container-high text-on-surface">
                {user.role}
              </span>
            </div>
            <div className="text-xs text-on-surface-variant flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {user.phone && <span>Mobile: {user.phone}</span>}
              {user.email && <span>Email: {user.email}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-surface rounded border border-outline-variant/40 text-center min-w-[90px]">
            <span className="font-serif text-lg font-bold text-primary block leading-none">
              {orders.length}
            </span>
            <span className="text-[10px] uppercase text-outline font-semibold">
              {isHindi ? "कुल आदेश" : "Total Orders"}
            </span>
          </div>

          <Link
            href="/services"
            className="min-h-[44px] px-4 py-2.5 bg-brand hover:bg-brand-hover text-on-brand text-xs uppercase font-bold tracking-wider rounded transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>{isHindi ? "नवीन परामर्श बुक करें" : "Book Consultation"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick links: documents, credentials and logout */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/vault"
          className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg border border-maroon bg-surface hover:bg-brand/20 text-sm font-bold text-secondary"
        >
          <FileText className="w-4 h-4 text-primary" />
          {isHindi ? "मेरे दस्तावेज़ (वॉल्ट)" : "My documents (vault)"}
        </Link>
        <Link
          href="/credentials"
          className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg border border-maroon bg-surface hover:bg-brand/20 text-sm font-bold text-secondary"
        >
          <ShieldCheck className="w-4 h-4 text-primary" />
          {isHindi ? "प्रमाणपत्र एवं दस्तावेज़" : "Credentials and documents"}
        </Link>
        <SignOutButton label={isHindi ? "लॉग आउट" : "Log out"} className="ml-auto" />
      </div>

      {/* Orders Section */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {isHindi ? "परामर्श इतिहास एवं प्रगति" : "Your Consultations & Progress"}
          </span>
          <h2 className="font-serif text-2xl font-bold text-secondary mt-1">
            {isHindi ? "सक्रिय एवं विगत आदेश" : "My Orders & Astrological Tracker"}
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center bg-surface-container rounded-lg border border-outline-variant/40 space-y-4">
            <Package className="w-12 h-12 text-outline mx-auto" />
            <h3 className="font-serif text-lg font-bold text-secondary">
              {isHindi ? "कोई परामर्श आदेश नहीं मिला" : "No orders found"}
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
              {isHindi
                ? "आपने अभी तक किसी वैदिक ज्योतिष परामर्श अथवा कुण्डली निर्माण हेतु पंजीकरण नहीं कराया है।"
                : "You have not registered any astrological consultations yet. Explore our authentic Vedic services."}
            </p>
            <div className="pt-2">
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-5 py-2.5 bg-brand text-on-brand rounded text-xs uppercase font-bold"
              >
                <span>{isHindi ? "वैदिक सेवाएँ देखें" : "Explore Services"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isPaid = order.paymentStatus === "PAID";
              const isAwaiting = order.paymentStatus === "AWAITING_VERIFICATION";
              const isPending = order.paymentStatus === "PENDING" || order.paymentStatus === "FAILED";

              return (
                <div
                  key={order.id}
                  className="bg-surface rounded-lg p-5 sm:p-6 border-2 border-outline-variant/60 shadow-sm space-y-6 text-left"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-secondary">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          • {new Date(order.createdAt).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-on-surface mt-1">
                        {isHindi
                          ? order.service?.titleHi || "Vedic Service"
                          : order.service?.titleEn || "Vedic Service"}
                      </h3>
                      <p className="text-xs text-primary font-medium">
                        {bundleTitle(order, planMap, isHindi)} • {formatPaiseToInr(order.netAmountPaise)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Payment Status Chip */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : isAwaiting
                            ? "bg-brand/20 text-primary border border-brand"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {isPaid ? "PAID" : isAwaiting ? "Awaiting Verification" : "Payment Pending"}
                      </span>

                      {/* Current Canonical Order Status */}
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-tertiary-fixed text-on-tertiary-fixed">
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {/* Appointment status (orders with a booked slot) */}
                  {order.appointmentStatus && order.slot && (
                    <div className="p-3 rounded bg-surface-container-low border border-outline-variant/40 text-sm flex flex-wrap items-center justify-between gap-2">
                      <span>
                        <strong>{isHindi ? "अपॉइंटमेंट:" : "Appointment:"}</strong>{" "}
                        {order.slot.date.toISOString().slice(0, 10)} {order.slot.startTime} - {order.slot.endTime}
                      </span>
                      <span className="font-bold text-primary">
                        {order.appointmentStatus === "PENDING"
                          ? isHindi ? "स्वीकृति की प्रतीक्षा" : "Awaiting approval"
                          : order.appointmentStatus === "APPROVED"
                            ? isHindi ? "स्वीकृत" : "Approved"
                            : order.appointmentStatus === "COMPLETED"
                              ? isHindi ? "पूर्ण" : "Completed"
                              : isHindi ? "अस्वीकृत" : "Not approved"}
                      </span>
                      {order.appointmentNote && (
                        <span className="basis-full text-xs text-on-surface-variant">{order.appointmentNote}</span>
                      )}
                    </div>
                  )}

                  {/* 6-step Tracker Stepper */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary block mb-3">
                      {isHindi ? "षट्-पदीय प्रगति विवरण • 6-Stage Kundli Tracker" : "6-Stage Progress Stepper"}
                    </span>
                    <OrderStatusStepper
                      currentStatus={order.status as CanonicalOrderStatus}
                      events={order.statusEvents.map((e) => ({
                        id: e.id,
                        status: e.status,
                        note: e.note,
                        createdAt: e.createdAt.toISOString(),
                        changedByName: e.changedBy?.name || e.changedBy?.email || null,
                      }))}
                      courierName={order.courierName}
                      trackingNumber={order.trackingNumber}
                      locale={locale}
                    />
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-4 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/booking/success/${order.id}`}
                        className="text-secondary font-bold underline hover:text-primary min-h-[44px] flex items-center"
                      >
                        {isHindi ? "विस्तृत विवरण देखें →" : "View Booking Receipt →"}
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isPaid && (
                        <>
                          <a
                            href={`/api/invoice/${order.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="min-h-[44px] px-3.5 py-2 bg-surface hover:bg-surface-container border border-outline-variant text-on-surface font-semibold rounded flex items-center gap-1.5 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 text-secondary" />
                            <span>{isHindi ? "बीजक (PDF)" : "Invoice (PDF)"}</span>
                          </a>
                          <a
                            href={`/api/ticket/${order.id}?lang=${isHindi ? "hi" : "en"}`}
                            target="_blank"
                            rel="noreferrer"
                            className="min-h-[44px] px-3.5 py-2 bg-surface hover:bg-surface-container border border-outline-variant text-on-surface font-semibold rounded flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-primary" />
                            <span>{isHindi ? "कन्फर्मेशन टिकट" : "Confirmation Ticket"}</span>
                          </a>
                          <a
                            href={`/api/invoice/${order.id}?format=html`}
                            target="_blank"
                            rel="noreferrer"
                            className="min-h-[44px] px-3.5 py-2 bg-surface hover:bg-surface-container border border-outline-variant text-on-surface font-semibold rounded flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-primary" />
                            <span>{isHindi ? "बीजक (HTML)" : "Invoice (HTML)"}</span>
                          </a>
                        </>
                      )}

                      {isPending && (
                        <Link
                          href={`/booking/checkout/${order.id}`}
                          className="min-h-[44px] px-4 py-2 bg-brand hover:bg-brand-hover text-on-brand font-bold rounded flex items-center gap-1.5 shadow-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{isHindi ? "दक्षिणा भुगतान करें" : "Pay Dakshina"}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
