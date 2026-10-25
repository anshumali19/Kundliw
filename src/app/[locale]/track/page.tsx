import { getCurrentUser } from "@/lib/auth/guards";
import { TrackOrderClient } from "@/features/orders/components/TrackOrderClient";

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
