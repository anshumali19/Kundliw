"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

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
    socialWhatsapp?: string | null;
    socialTelegram?: string | null;
    socialFacebook?: string | null;
    socialInstagram?: string | null;
    socialYoutube?: string | null;
  };
  locale: string;
}

const DEFAULT_MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3606.877840131435!2d83.00762957599026!3d25.30831627763878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e2e21759d57a9%3A0xea8f7c94fafe0e52!2sDashashwamedh%20Ghat!5e0!3m2!1sen!2sin!4v1729864000000!5m2!1sen!2sin";

export function ContactClient({ settings, locale }: ContactClientProps) {
  const isHindi = locale === "hi";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const phone1 = settings.phone1 || "+91-9827991224";
  const phone2 = settings.phone2 || "+91-7509124672";
  const emailAddr = settings.email || "contact@kanadastro.org";
  const address = isHindi
    ? settings.addressHi || "दशाश्वमेध घाट, वाराणसी, उत्तर प्रदेश - २२१००१"
    : settings.addressEn || "Dashashwamedh Ghat, Varanasi, Uttar Pradesh - 221001";
  const mapUrl = settings.googleMapEmbedUrl || DEFAULT_MAP_EMBED;

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

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    "Dashashwamedh Ghat, Varanasi, Uttar Pradesh, India"
  )}`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-10">
      {/* Editorial Header */}
      <div className="border-b border-outline-variant/40 pb-6">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
          <MapPin className="w-4 h-4" />
          <span>{isHindi ? "केंद्र संपर्क एवं स्थान" : "Sanctum Location & Direct Contact"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-on-surface">
          {isHindi ? "महर्षि कणाद ज्योतिष केंद्र • वाराणसी" : "Maharshi Kanad Jyotish Kendra • Varanasi"}
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 max-w-3xl leading-relaxed">
          {isHindi
            ? "पवित्र गंगा तट, दशाश्वमेध घाट, वाराणसी पर स्थित हमारा केंद्र वैदिक ज्योतिष, जन्मपत्री निर्माण एवं व्यक्तिगत परामर्श हेतु उपस्थित है।"
            : "Situated at the sacred banks of Ganga at Dashashwamedh Ghat, Varanasi. We welcome consultation inquiries, personal visits, and remote astrological requests."}
        </p>
      </div>

      {/* Embedded Google Map Section */}
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-surface border-b border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            <span className="font-serif font-bold text-sm text-on-surface">
              {isHindi ? "गूगल मानचित्र अवस्थिति" : "Live Google Map Navigation"}
            </span>
          </div>
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-secondary text-on-secondary text-xs font-bold hover:bg-secondary/90 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>{isHindi ? "दिशा-निर्देश प्राप्त करें (Google Maps)" : "Get Directions on Google Maps"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
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

      {/* Asymmetric Two-Column Split: Contact Details vs Quick Enquiry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Coordinates & Timings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 space-y-5">
            <h2 className="font-serif font-bold text-lg text-secondary border-b border-outline-variant/30 pb-3">
              {isHindi ? "सीधा संपर्क विवरण" : "Direct Contact Coordinates"}
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-on-surface mb-0.5">
                    {isHindi ? "पवित्र धाम का पता" : "Sacred Address"}
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-on-surface mb-0.5">
                    {isHindi ? "आधिकारिक हेल्पलाइन नंबर" : "Helpline & Appointment Inquiries"}
                  </div>
                  <div className="space-y-1 font-mono text-secondary font-semibold">
                    <div>
                      <a href={`tel:${phone1.replace(/\s+/g, "")}`} className="hover:underline">
                        {phone1}
                      </a>
                    </div>
                    <div>
                      <a href={`tel:${phone2.replace(/\s+/g, "")}`} className="hover:underline">
                        {phone2}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-on-surface mb-0.5">
                    {isHindi ? "ईमेल पत्राचार" : "Electronic Mail"}
                  </div>
                  <a href={`mailto:${emailAddr}`} className="text-secondary font-mono hover:underline">
                    {emailAddr}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-on-surface mb-0.5">
                    {isHindi ? "परामर्श समय (भारतीय मानक समय)" : "Consultation Hours (IST)"}
                  </div>
                  <p className="text-on-surface-variant">
                    {isHindi
                      ? "सोमवार से रविवार: प्रातः ०७:०० से सायं ०९:०० बजे तक"
                      : "Monday through Sunday: 07:00 AM – 09:00 PM IST"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Enquiry Form (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-outline-variant/60 rounded-xl p-6 sm:p-8 space-y-6">
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
                <AlertCircle className="w-4 h-4 text-error shrink-0" />
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
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 flex items-center justify-center gap-2 transition-all shadow-sm min-h-[44px] disabled:opacity-50"
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
