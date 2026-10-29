import { getCurrentUser } from "@/lib/auth/guards";
import { TrackOrderClient } from "@/features/orders/components/TrackOrderClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track your order • Maharshi Kanad Jyotish Kendra",
  description: "Enter your order number and mobile number to see the progress of your Kundli or consultation order.",
};

interface TrackPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function TrackPage(props: TrackPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const user = await getCurrentUser();

  return (
    <TrackOrderClient
      locale={locale}
      isLoggedIn={Boolean(user)}
    />
  );
}
