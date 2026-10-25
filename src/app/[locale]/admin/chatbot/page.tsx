import { Metadata } from "next";
import { AdminChatbotManager } from "@/features/admin/chatbot/AdminChatbotManager";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const isHi = params?.locale === "hi";
  return {
    title: isHi
      ? "वैदिक चैटबॉट प्रश्नोत्तर प्रबंधन | एडमिन"
      : "Vedic Chatbot Q&A Management | Admin Console",
  };
}

export default async function AdminChatbotPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;
  const locale = params?.locale || "hi";
  return <AdminChatbotManager locale={locale} />;
}
