"use client";

import { kendraEmail } from "@/lib/content/contact";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  MapPin,
  Phone,
  Mail,
  Navigation,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  Clock,
} from "lucide-react";
import { directionsUrl, mapIframeSrc } from "@/lib/content/map";
import { RichText } from "@/components/content/RichText";
import { SocialIcon } from "@/components/content/SocialIcon";
import { Link } from "@/i18n/routing";
import { LifeBuoy, Ticket, Map as MapIcon } from "lucide-react";

interface ContactClientProps {
  settings: {
    siteNameEn?: string | null;
    siteNameHi?: string | null;
    phone1?: string | null;
    phone2?: string | null;
    email?: string | null;
    addressEn?: string | null;
    addressHi?: string | null;
    city?: string | null;
    googleMapEmbedUrl?: string | null;
    mapEnabled?: boolean | null;
    mapZoom?: number | null;
    mapLatitude?: number | null;
    mapLongitude?: number | null;
    mapLabelEn?: string | null;
    mapLabelHi?: string | null;
    socialWhatsapp?: string | null;
    socialTelegram?: string | null;
    socialFacebook?: string | null;
    socialInstagram?: string | null;
    socialYoutube?: string | null;
  };
  locale: string;
  extra?: {
    workingHours?: string;
    note?: string;
    social?: Array<{ id: string; name: string; url: string }>;
    /** Admin > Website settings > Map and contact icons */
    icons?: {
      show: boolean;
      map: boolean;
      navigation: boolean;
      enquiry: boolean;
      support: boolean;
      tickets: boolean;
      address: boolean;
      phone: boolean;
      email: boolean;
      labels: { navigation?: string; enquiry?: string; support?: string; tickets?: string };
      supportLink: string;
      ticketsLink: string;
    };
  };
}

const DEFAULT_ICONS = {
  show: true, map: true, navigation: true, enquiry: true, support: true, tickets: true,
  address: true, phone: true, email: true,
  labels: {} as { navigation?: string; enquiry?: string; support?: string; tickets?: string },
  supportLink: "/help", ticketsLink: "/account",
};

export function ContactClient({ settings, locale, extra }: ContactClientProps) {
  const isHindi = locale === "hi";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const phone1 = settings.phone1 || "";
  const phone2 = settings.phone2 || "";
  const emailAddr = kendraEmail(settings.email);
  const address = isHindi
    ? settings.addressHi || settings.addressEn || ""
    : settings.addressEn || settings.addressHi || "";
  const mapUrl = mapIframeSrc(settings) || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/contact/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          subject,
          message,
          source: "CONTACT_PAGE",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({
          type: "success",
          text: isHindi
            ? "आपकी पूछताछ सफलतापूर्वक प्राप्त हो गई है। केंद्र दल शीघ्र संपर्क करेगा।"
            : "Your enquiry has been received successfully. The Kendra team will reach out soon.",
        });
        setName("");
        setPhone("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatus({ type: "error", text: data.error || "Submission failed." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error submitting form." });
    } finally {
      setLoading(false);
    }
  };

  const googleMapsDirectionsUrl =
    directionsUrl(settings) ||
    (address ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}` : null);

  const icons = { ...DEFAULT_ICONS, ...(extra?.icons || {}) };
  const iconItems: Array<{ key: string; label: string; href: string; Icon: typeof MapIcon }> = [];
  if (icons.map && mapUrl) iconItems.push({ key: "map", label: isHindi ? "गूगल मैप" : "Google Map", href: "#contact-map", Icon: MapIcon });
  if (icons.navigation && googleMapsDirectionsUrl) iconItems.push({ key: "nav", label: icons.labels.navigation || (isHindi ? "नेविगेशन" : "Navigation"), href: googleMapsDirectionsUrl, Icon: Navigation });
  if (icons.enquiry) iconItems.push({ key: "enq", label: icons.labels.enquiry || (isHindi ? "पूछताछ" : "Enquiry"), href: "#enquiry", Icon: MessageSquare });
  if (icons.support && icons.supportLink) iconItems.push({ key: "sup", label: icons.labels.support || (isHindi ? "सहायता" : "Support"), href: icons.supportLink, Icon: LifeBuoy });
  if (icons.tickets && icons.ticketsLink) iconItems.push({ key: "tix", label: icons.labels.tickets || (isHindi ? "टिकट" : "Tickets"), href: icons.ticketsLink, Icon: Ticket });
  if (icons.email) iconItems.push({ key: "mail", label: isHindi ? "ईमेल" : "Email", href: `mailto:${emailAddr}`, Icon: Mail });
  if (iconItems.length === 0) icons.show = false;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-10">
      {/* Editorial Header */}
      <div className="border-b border-outline-variant/40 pb-6">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
          <MapPin className="w-4 h-4" />
          <span>{isHindi ? "संपर्क" : "Contact"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-on-surface">
          {isHindi ? "महर्षि कणाद ज्योतिष केंद्र" : "Maharshi Kanad Jyotish Kendra"}
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 max-w-3xl leading-relaxed">
          {isHindi
            ? "परामर्श, बुकिंग या किसी भी जानकारी के लिए हमसे संपर्क करें।"
            : "Reach us for consultations, bookings or any question."}
        </p>
      </div>

      {/* Icon row: Map, Navigation, Enquiry, Support, Tickets (Admin > Website settings > Map and contact icons) */}
      {icons.show && (
        <ul className="grid grid-cols-2 sm:grid-cols-5 gap-3" aria-label={isHindi ? "त्वरित विकल्प" : "Quick options"}>
          {iconItems.map((it) => {
            const cls =
              "flex flex-col items-center justify-center gap-2 min-h-[88px] px-3 py-4 rounded-xl border border-outline-variant/60 bg-surface text-secondary text-xs font-bold text-center hover:bg-surface-container-high transition-colors";
            const body = (
              <>
                <it.Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                <span>{it.label}</span>
              </>
            );
            return (
              <li key={it.key}>
                {it.href.startsWith("#") ? (
                  <a href={it.href} className={cls}>{body}</a>
                ) : it.href.startsWith("/") ? (
                  <Link href={it.href} className={cls}>{body}</Link>
                ) : (
                  <a href={it.href} target={it.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cls}>{body}</a>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Embedded Google Map Section */}
      {mapUrl && icons.map && (
      <div id="contact-map" className="scroll-mt-40 bg-surface-container-low border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-surface border-b border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            <span className="font-serif font-bold text-sm text-on-surface">
              {isHindi ? "मानचित्र एवं दिशा-निर्देश" : "Map and directions"}
            </span>
          </div>
          {googleMapsDirectionsUrl && (
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-brand text-on-brand text-xs font-bold hover:bg-brand-hover flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>{isHindi ? "दिशा-निर्देश प्राप्त करें (Google Maps)" : "Get Directions on Google Maps"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          )}
        </div>

        {/* Responsive Map Embed Container */}
        <div className="w-full h-[400px] sm:h-[480px] bg-surface-container relative">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Maharshi Kanad Jyotish Kendra Google Map Location"
          />
        </div>
      </div>
      )}

      {/* Asymmetric Two-Column Split: Contact Details vs Quick Enquiry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Coordinates & Timings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 space-y-5">
            <h2 className="font-serif font-bold text-lg text-secondary border-b border-outline-variant/30 pb-3">
              {isHindi ? "संपर्क विवरण" : "Contact details"}
            </h2>

            <div className="space-y-4 text-xs">
              {address && icons.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-on-surface mb-0.5">
                    {isHindi ? "पता" : "Address"}
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">{address}</p>
                </div>
              </div>
              )}

              {icons.phone && phone1 && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-on-surface mb-0.5">
                    {isHindi ? "फ़ोन" : "Phone"}
                  </div>
                  <div className="space-y-1 font-mono text-secondary font-semibold">
                    <div>
                      <a href={`tel:${phone1.replace(/\s+/g, "")}`} className="hover:underline">
                        {phone1}
                      </a>
                    </div>
                    {phone2 && (
                    <div>
                      <a href={`tel:${phone2.replace(/\s+/g, "")}`} className="hover:underline">
                        {phone2}
                      </a>
                    </div>
                    )}
                  </div>
                </div>
              </div>
              )}

              {emailAddr && icons.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-on-surface mb-0.5">{isHindi ? "ईमेल" : "Email"}</div>
                  <a href={`mailto:${emailAddr}`} className="text-secondary font-mono hover:underline">{emailAddr}</a>
                </div>
              </div>
              )}

              {extra?.workingHours && (
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-on-surface mb-0.5">{isHindi ? "कार्य समय" : "Working hours"}</div>
                    <div className="text-on-surface-variant">{extra.workingHours}</div>
                  </div>
                </div>
              )}

              {extra?.note && <div className="text-xs text-on-surface-variant leading-relaxed space-y-2"><RichText text={extra.note} /></div>}

              {extra?.social && extra.social.length > 0 && (
                <div>
                  <div className="font-bold text-on-surface mb-1.5">{isHindi ? "हमें फ़ॉलो करें" : "Follow us"}</div>
                  <ul className="flex flex-wrap gap-2">
                    {extra.social.map((l) => (
                      <li key={l.id}>
                        <a href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.name} title={l.name} className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-outline-variant text-secondary hover:bg-surface-container-high">
                          <SocialIcon id={l.id} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Enquiry Form (7 cols) */}
        <div id="enquiry" className="scroll-mt-40 lg:col-span-7 bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>{isHindi ? "त्वरित संदेश प्रेषण" : "Direct Message & Enquiry"}</span>
            </div>
            <h2 className="font-serif font-bold text-xl text-on-surface">
              {isHindi ? "केंद्र दल से संपर्क करें" : "Leave an Astrological Inquiry"}
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              {isHindi
                ? "कृपया अपना विवरण दर्ज करें, हमारे दैवज्ञ आपके प्रश्न का अध्ययन कर शीघ्र संपर्क करेंगे।"
                : "Fill out the form below and our team will get in touch with you promptly."}
            </p>
          </div>

          {status && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 text-xs font-medium border ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : "bg-error-container text-on-error-container border-error/20"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-on-error-container shrink-0" />
              )}
              <span>{status.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  {isHindi ? "पूरा नाम *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isHindi ? "उदा. आदित्य शर्मा" : "e.g. Aditya Sharma"}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  {isHindi ? "मोबाइल नंबर (+91) *" : "Phone Number (+91) *"}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  {isHindi ? "ईमेल पता (वैकल्पिक)" : "Email Address (Optional)"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aditya@example.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                  {isHindi ? "विषय" : "Subject"}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={isHindi ? "उदा. जन्मपत्री परामर्श" : "e.g. Janampatri Consultation"}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                {isHindi ? "पूछताछ विवरण अथवा प्रश्न *" : "Message / Astrological Query *"}
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isHindi
                    ? "अपना प्रश्न अथवा परामर्श आवश्यकता यहाँ लिखें..."
                    : "Write your question or consultation requirement here..."
                }
                className="w-full p-3 rounded-lg border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-brand text-on-brand text-xs font-bold hover:bg-brand-hover flex items-center justify-center gap-2 transition-all shadow-sm min-h-[44px] disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? (isHindi ? "भेजा जा रहा है..." : "Submitting...") : (isHindi ? "संदेश भेजें" : "Send Enquiry")}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
