import { Metadata } from "next";
import { AdminChatbotManager } from "@/features/admin/chatbot/AdminChatbotManager";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isHi = params?.locale === "hi";
  return {
    title: isHi
      ? "वैदिक चैटबॉट प्रश्नोत्तर प्रबंधन | एडमिन"
      : "Vedic Chatbot Q&A Management | Admin Console",
  };
}

export default function AdminChatbotPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale || "hi";
  return <AdminChatbotManager locale={locale} />;
}
