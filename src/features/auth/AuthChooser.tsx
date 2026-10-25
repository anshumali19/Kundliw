import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { User, Users, ShieldCheck, ArrowRight } from "lucide-react";

interface AuthChooserProps {
  mode: "signin" | "register";
  locale: string;
  callbackUrl?: string;
}

/**
 * Landing page for /auth/signin and /auth/register: sends each account type
 * (User, Associate, Super Admin) to its own dedicated page.
 */
export async function AuthChooser({ mode, locale, callbackUrl }: AuthChooserProps) {
  const t = await getTranslations({ locale, namespace: "auth" });
  const isSignIn = mode === "signin";
  const query = callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : "";

  const options = [
    {
      href: `/auth/${mode}/user`,
      icon: User,
      title: isSignIn ? t("userLoginTitle") : t("userRegisterTitle"),
      desc: isSignIn ? t("userLoginDesc") : t("userRegisterDesc"),
    },
    {
      href: `/auth/${mode}/associate`,
      icon: Users,
      title: isSignIn ? t("associateLoginTitle") : t("associateRegisterTitle"),
      desc: isSignIn ? t("associateLoginDesc") : t("associateRegisterDesc"),
    },
    ...(isSignIn
      ? [
          {
            href: "/auth/signin/super-admin",
            icon: ShieldCheck,
            title: t("superAdminLoginTitle"),
            desc: t("superAdminLoginDesc"),
          },
        ]
      : []),
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-14 text-left">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-secondary tracking-tight mb-2">
        {isSignIn ? t("chooseLoginType") : t("chooseRegisterType")}
      </h1>
      <p className="text-sm text-on-surface-variant max-w-xl mb-8 leading-relaxed">
        {isSignIn ? t("chooseLoginSubtitle") : t("chooseRegisterSubtitle")}
      </p>

      <div className={`grid grid-cols-1 gap-4 ${isSignIn ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {options.map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={`${href}${query}`}
            className="group flex flex-col gap-3 bg-surface p-6 rounded border border-secondary/30 hover:border-secondary transition-colors"
          >
            <span className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-secondary">
              <Icon className="w-5 h-5" />
            </span>
            <span className="font-serif text-xl font-bold text-secondary">{title}</span>
            <span className="text-sm text-on-surface-variant leading-relaxed">{desc}</span>
            <span className="mt-auto inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-primary">
              {t("continue")} <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-xs text-on-surface-variant">
        {isSignIn ? (
          <Link href="/auth/register" className="font-bold text-primary hover:underline uppercase tracking-wider">
            {t("noAccount")} →
          </Link>
        ) : (
          <Link href="/auth/signin" className="font-bold text-primary hover:underline uppercase tracking-wider">
            {t("haveAccount")} →
          </Link>
        )}
      </div>
    </div>
  );
}
