"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  Lock,
} from "lucide-react";

interface CredentialSummary {
  key: string;
  label: string;
  category: "PAYMENTS" | "SMS" | "EMAIL" | "AUTH" | "ASTRO" | "ANALYTICS" | "MAPS";
  description: string;
  envVar: string;
  isSecret: boolean;
  source: "DATABASE" | "ENVIRONMENT" | "NOT_CONFIGURED";
  isSet: boolean;
  masked: string;
}

const CATEGORY_HEADERS: Record<
  string,
  { titleEn: string; titleHi: string; descriptionEn: string; docUrl?: string }
> = {
  PAYMENTS: {
    titleEn: "Razorpay Payment Gateway",
    titleHi: "रेज़रपे भुगतान गेटवे",
    descriptionEn: "Configure Razorpay keys for instant card, UPI, net banking, and webhook verification.",
    docUrl: "https://dashboard.razorpay.com/app/keys",
  },
  SMS: {
    titleEn: "MSG91 SMS & Mobile OTP",
    titleHi: "MSG91 एसएमएस एवं मोबाइल ओटीपी",
    descriptionEn: "Transactional SMS and WhatsApp OTP gateway credentials for fast Indian phone verification.",
    docUrl: "https://control.msg91.com/",
  },
  EMAIL: {
    titleEn: "SMTP Email Delivery",
    titleHi: "एसएमटीपी ईमेल प्रेषण",
    descriptionEn: "Outgoing mail server credentials for booking receipts, astrology charts, and customer updates.",
  },
  AUTH: {
    titleEn: "OAuth Social Authentication",
    titleHi: "गूगल / फेसबुक सोशल लॉगिन",
    descriptionEn: "Google Cloud and Meta Developers credentials for 1-click social authentication.",
    docUrl: "https://console.cloud.google.com/apis/credentials",
  },
  ASTRO: {
    titleEn: "AstroSage Planetary Ephemeris",
    titleHi: "एस्ट्रोसेज पंचांग एवं गणना एपीआई",
    descriptionEn: "Astronomical planetary calculations and Kundli cloud engine authorization credentials.",
    docUrl: "https://cloud.astrosage.com/",
  },
  ANALYTICS: {
    titleEn: "Google Analytics 4",
    titleHi: "गूगल एनालिटिक्स ४",
    descriptionEn: "Web traffic measurement ID for visitor analytics and conversion tracking.",
    docUrl: "https://analytics.google.com/",
  },
  MAPS: {
    titleEn: "Google Maps Embed",
    titleHi: "गूगल मैप्स एम्बेड",
    descriptionEn: "Iframe embed URL for Varanasi Kendra physical location (100% free, zero Maps API bill).",
    docUrl: "https://maps.google.com/",
  },
};

export function AdminKeysManager({ locale }: { locale: string }) {
  const isHindi = locale === "hi";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<CredentialSummary[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [showPlaintext, setShowPlaintext] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCredentials = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/settings/keys");
      const data = await res.json();
      if (res.ok && data.credentials) {
        setCredentials(data.credentials);
      } else {
        setStatus({ type: "error", text: data.error || "Failed to load keys." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error loading credentials." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const toggleShowPlaintext = (key: string) => {
    setShowPlaintext((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    // Only send fields that have non-empty new values
    const payload: Record<string, string> = {};
    for (const [k, v] of Object.entries(inputs)) {
      if (v && v.trim()) {
        payload[k] = v.trim();
      }
    }

    if (Object.keys(payload).length === 0) {
      setStatus({
        type: "error",
        text: isHindi
          ? "कोई नया मान दर्ज नहीं किया गया है।"
          : "No new credential values entered to save.",
      });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/settings/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({
          type: "success",
          text: isHindi
            ? `सफलतापूर्वक ${data.updatedCount} कुंजियाँ सुरक्षित (AES-256-GCM) रूप से सहेजी गईं।`
            : `Successfully encrypted (AES-256-GCM) and saved ${data.updatedCount} credentials.`,
        });
        setInputs({});
        await fetchCredentials();
      } else {
        setStatus({ type: "error", text: data.error || "Failed to save keys." });
      }
    } catch {
      setStatus({ type: "error", text: "Network error saving credentials." });
    } finally {
      setSaving(false);
    }
  };

  // Group credentials by category
  const categories = ["PAYMENTS", "SMS", "EMAIL", "AUTH", "ASTRO", "ANALYTICS", "MAPS"] as const;

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-serif font-bold text-on-surface">
              {isHindi ? "एपीआई एवं क्रेडेंशियल सुरक्षा नियंत्रण" : "API & Credentials Security Vault"}
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            {isHindi
              ? "सभी संवेदनशील कुंजियाँ डेटाबेस में AES-256-GCM द्वारा एन्क्रिप्टेड रहती हैं और कभी भी सादे पाठ में प्रदर्शित नहीं होती हैं।"
              : "All sensitive credentials are encrypted at rest with AES-256-GCM and never returned unmasked by any API."}
          </p>
        </div>

        <button
          onClick={fetchCredentials}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded border border-outline-variant text-xs font-semibold hover:bg-surface-container transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{isHindi ? "पुनः लोड करें" : "Refresh"}</span>
        </button>
      </div>

      {/* Security Architecture Callout */}
      <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 flex items-start gap-3">
        <Lock className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 text-on-surface-variant">
          <p className="font-semibold text-on-surface">
            {isHindi
              ? "द्वि-स्तरीय विन्यास व्यवस्था (Precedence Order):"
              : "Two-Tier Credential Resolution Hierarchy:"}
          </p>
          <p>
            {isHindi
              ? "१. इस फॉर्म में दर्ज की गई कुंजियाँ डेटाबेस में एन्क्रिप्ट होकर तुरंत प्रभावी हो जाती हैं। २. यदि यहाँ कोई कुंजी खाली है, तो सर्वर `.env` पर्यावरण चर का स्वतः उपयोग करता है।"
              : "1. Credentials entered here are AES-256 encrypted and take immediate precedence over environment variables. 2. If left blank here, the system gracefully falls back to your .env file."}
          </p>
        </div>
      </div>

      {/* Status banner */}
      {status && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 text-sm ${
            status.type === "success"
              ? "bg-secondary-container/30 text-on-secondary-container border border-secondary"
              : "bg-error-container/30 text-error border border-error"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-secondary" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-error" />
          )}
          <span>{status.text}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {categories.map((cat) => {
          const catMeta = CATEGORY_HEADERS[cat];
          const catCreds = credentials.filter((c) => c.category === cat);
          if (catCreds.length === 0 && !loading) return null;

          return (
            <div
              key={cat}
              className="bg-surface-container-low rounded-xl border border-outline-variant/40 p-5 sm:p-6 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/20">
                <div>
                  <h2 className="text-lg font-serif font-bold text-on-surface">
                    {isHindi ? catMeta?.titleHi : catMeta?.titleEn}
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {catMeta?.descriptionEn}
                  </p>
                </div>
                {catMeta?.docUrl && (
                  <a
                    href={catMeta.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline self-start"
                  >
                    <span>{isHindi ? "पोर्टल खोलें" : "Open Console"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {catCreds.map((cred) => {
                  const isVisible = showPlaintext[cred.key] || false;
                  const currentInputValue = inputs[cred.key] || "";

                  return (
                    <div
                      key={cred.key}
                      className="p-4 rounded-lg bg-surface border border-outline-variant/30 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-on-surface">
                            {cred.label}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                            {cred.envVar}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          {cred.source === "DATABASE" && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-medium">
                              <ShieldCheck className="w-3 h-3 text-secondary" />
                              <span>{isHindi ? "डेटाबेस में सक्रिय" : "Active (DB)"}</span>
                            </span>
                          )}
                          {cred.source === "ENVIRONMENT" && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-tertiary-container/40 text-on-tertiary-container font-medium">
                              <ShieldCheck className="w-3 h-3 text-tertiary" />
                              <span>{isHindi ? ".env से सक्रिय" : "Active (.env)"}</span>
                            </span>
                          )}
                          {cred.source === "NOT_CONFIGURED" && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant/80 font-medium">
                              <ShieldAlert className="w-3 h-3 text-amber-500" />
                              <span>{isHindi ? "रिक्त (Not Set)" : "Not Set"}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-on-surface-variant">
                        {cred.description}
                      </p>

                      {/* Current Masked Value Display */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-on-surface-variant font-medium">
                          {isHindi ? "वर्तमान सक्रिय मान:" : "Current Active Value:"}
                        </span>
                        {cred.isSet ? (
                          <span className="font-mono bg-surface-container-high px-2 py-0.5 rounded text-on-surface text-xs font-semibold">
                            {cred.masked}
                          </span>
                        ) : (
                          <span className="italic text-on-surface-variant/60">
                            {isHindi ? "(कोई मान सेट नहीं)" : "(No value set)"}
                          </span>
                        )}
                      </div>

                      {/* Input for updating */}
                      <div className="relative mt-2">
                        <input
                          type={isVisible || !cred.isSecret ? "text" : "password"}
                          value={currentInputValue}
                          onChange={(e) => handleInputChange(cred.key, e.target.value)}
                          placeholder={
                            isHindi
                              ? "नया मान दर्ज करें (बदलने के लिए)..."
                              : `Enter new value to update ${cred.label}...`
                          }
                          className="w-full px-3.5 py-2.5 pr-10 rounded border border-outline-variant bg-surface text-on-surface text-xs font-mono placeholder:font-sans placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        {cred.isSecret && (
                          <button
                            type="button"
                            onClick={() => toggleShowPlaintext(cred.key)}
                            className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-on-surface"
                            aria-label="Toggle secret visibility"
                          >
                            {isVisible ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Action Button Bar */}
        <div className="sticky bottom-4 bg-surface/95 backdrop-blur-md p-4 rounded-xl border border-outline-variant shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-on-surface-variant">
            {Object.keys(inputs).filter((k) => inputs[k]?.trim()).length > 0 ? (
              <span className="font-semibold text-secondary">
                {Object.keys(inputs).filter((k) => inputs[k]?.trim()).length}{" "}
                {isHindi ? "कुंजियाँ अद्यतन करने के लिए तैयार" : "credential(s) ready to update"}
              </span>
            ) : (
              <span>
                {isHindi
                  ? "कुंजी बदलने के लिए ऊपर किसी भी बॉक्स में नया मान टाइप करें।"
                  : "Type a new value in any box above, then click Save."}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-primary text-on-primary font-medium text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {saving
                ? isHindi
                  ? "एन्क्रिप्ट एवं सहेज रहे हैं..."
                  : "Encrypting & Saving..."
                : isHindi
                ? "सभी परिवर्तन सुरक्षित सहेजें"
                : "Save All Updates (AES-256)"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
