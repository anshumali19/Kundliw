import { getCurrentUser } from "@/lib/auth/guards";
import { TrackOrderClient } from "@/features/orders/components/TrackOrderClient";

interface TrackPageProps {
  params: {
    locale: string;
  };
}

export const dynamic = "force-dynamic";

export default async function TrackPage({
  params: { locale },
}: TrackPageProps) {
  const user = await getCurrentUser();

  return (
    <TrackOrderClient
      locale={locale}
      isLoggedIn={Boolean(user)}
    />
  );
}
