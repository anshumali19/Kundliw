import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminHeroSlidesManager } from "@/features/admin/hero/AdminHeroSlidesManager";

export const metadata: Metadata = {
  title: "Hero slides • Maharshi Kanad Jyotish Kendra Admin",
  description: "Add up to 10 pictures to the home page top section, each with text, a YouTube link and a service.",
};

export const dynamic = "force-dynamic";

export default async function AdminHeroSlidesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const services = await prisma.service
    .findMany({ where: { isActive: true }, orderBy: { orderIndex: "asc" }, select: { slug: true, titleEn: true, titleHi: true, imageUrl: true } })
    .catch(() => []);
  return <AdminHeroSlidesManager locale={locale} services={services} />;
}
