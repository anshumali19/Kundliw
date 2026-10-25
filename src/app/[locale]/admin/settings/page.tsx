"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Building2,
  QrCode,
  MapPin,
  FileCheck,
  Upload,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);

  // Form State
  const [siteNameEn, setSiteNameEn] = useState("Maharshi Kanad Jyotish Kendra");
  const [siteNameHi, setSiteNameHi] = useState("महर्षि कणाद ज्योतिष केंद्र");
  const [phone1, setPhone1] = useState("+91-9827991224");
  const [phone2, setPhone2] = useState("+91-7509124672");
  const [email, setEmail] = useState("contact@kanadastro.org");
  const [addressEn, setAddressEn] = useState("Dashashwamedh Ghat, Varanasi, Uttar Pradesh - 221001");
  const [addressHi, setAddressHi] = useState("दशाश्वमेध घाट, वाराणसी, उत्तर प्रदेश - २२१००१");

  // Coordinates
  const [city, setCity] = useState("Varanasi");
  const [latitude, setLatitude] = useState<number | "">(25.3176);
  const [longitude, setLongitude] = useState<number | "">(82.9739);
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  // Banking & Manual Payments
  const [upiVpa, setUpiVpa] = useState("kanadastro@upi");
  const [bankAccountName, setBankAccountName] = useState("Maharshi Kanad Jyotish Kendra");
  const [bankAccountNumber, setBankAccountNumber] = useState("987654321012");
  const [bankIfsc, setBankIfsc] = useState("SBIN0001234");
  const [bankName, setBankName] = useState("State Bank of India");
  const [qrCodeUrl, setQrCodeUrl] = useState("/images/qr-code.png");

  // Tax
  const [gstin, setGstin] = useState("09AAAAA0000A1Z5");
  const [defaultGstRateBps, setDefaultGstRateBps] = useState<number>(1800);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.settings) {
        const s = data.settings;
        if (s.siteNameEn) setSiteNameEn(s.siteNameEn);
        if (s.siteNameHi) setSiteNameHi(s.siteNameHi);
        if (s.phone1) setPhone1(s.phone1);
        if (s.phone2) setPhone2(s.phone2);
        if (s.email) setEmail(s.email);
        if (s.addressEn) setAddressEn(s.addressEn);
        if (s.addressHi) setAddressHi(s.addressHi);
        if (s.city) setCity(s.city);
        if (s.latitude !== null && s.latitude !== undefined) setLatitude(s.latitude);
        if (s.longitude !== null && s.longitude !== undefined) setLongitude(s.longitude);
        if (s.timezone) setTimezone(s.timezone);
        if (s.upiVpa) setUpiVpa(s.upiVpa);
        if (s.bankAccountName) setBankAccountName(s.bankAccountName);
        if (s.bankAccountNumber) setBankAccountNumber(s.bankAccountNumber);
        if (s.bankIfsc) setBankIfsc(s.bankIfsc);
        if (s.bankName) setBankName(s.bankName);
        if (s.qrCodeUrl) setQrCodeUrl(s.qrCodeUrl);
        if (s.gstin) setGstin(s.gstin);
        if (s.defaultGstRateBps !== null && s.defaultGstRateBps !== undefined)
          setDefaultGstRateBps(s.defaultGstRateBps);
      }
    } catch {
      setError("Error loading settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", "qr");

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setQrCodeUrl(data.url);
        setSuccess("QR code uploaded successfully");
      } else {
        setError(data.error || "QR upload failed");
      }
    } catch {
      setError("Error uploading QR code");
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteNameEn,
          siteNameHi,
          phone1,
          phone2,
          email,
          addressEn,
          addressHi,
          city,
          latitude: latitude === "" ? null : Number(latitude),
          longitude: longitude === "" ? null : Number(longitude),
          timezone,
          upiVpa,
          bankAccountName,
          bankAccountNumber,
          bankIfsc,
          bankName,
          qrCodeUrl,
          gstin,
          defaultGstRateBps: Number(defaultGstRateBps),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Settings updated successfully");
      } else {
        setError(data.error || "Failed to update settings");
      }
    } catch {
      setError("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="font-serif text-2xl font-bold text-secondary">
          व्यवस्था सेटिंग्स • Admin Settings
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Configure Kendra contact details, manual payment banking, GSTIN, and Panchang coordinates.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded bg-error-container/20 border border-error text-error text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Contact Details */}
        <div className="bg-surface rounded-lg p-6 border border-outline-variant/40 space-y-4">
          <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2 pb-2 border-b border-outline-variant/30">
            <Phone className="w-4 h-4 text-primary" />
            <span>Kendra Contact & Address (संपर्क एवं पता)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Primary Phone *
              </label>
              <input
                type="text"
                required
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Secondary Phone *
              </label>
              <input
                type="text"
                required
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Support Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Physical Address (English)
              </label>
              <textarea
                rows={2}
                value={addressEn}
                onChange={(e) => setAddressEn(e.target.value)}
                className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                कार्यालय का पता (हिन्दी)
              </label>
              <textarea
                rows={2}
                value={addressHi}
                onChange={(e) => setAddressHi(e.target.value)}
                className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none font-serif"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Panchang Ephemeris Coordinates */}
        <div className="bg-surface rounded-lg p-6 border border-outline-variant/40 space-y-4">
          <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2 pb-2 border-b border-outline-variant/30">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Panchang Astronomical Coordinates (पंचांग एवं दृग्गणित निर्देशांक)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Ephemeris Reference City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 font-mono bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Longitude (°E)
              </label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 font-mono bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Manual Payments & Banking */}
        <div className="bg-surface rounded-lg p-6 border border-outline-variant/40 space-y-4">
          <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2 pb-2 border-b border-outline-variant/30">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Manual Payment Options (बैंक अंतरण, यूपीआई एवं क्यूआर कोड)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Kendra UPI VPA (e.g. name@upi)
              </label>
              <input
                type="text"
                value={upiVpa}
                onChange={(e) => setUpiVpa(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 font-mono bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Beneficiary Account Name
              </label>
              <input
                type="text"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 font-mono bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Bank IFSC Code
              </label>
              <input
                type="text"
                value={bankIfsc}
                onChange={(e) => setBankIfsc(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 font-mono bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                QR Code Image (Upload or Path)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qrCodeUrl}
                  onChange={(e) => setQrCodeUrl(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
                <label className="min-h-[44px] px-3 py-2 border border-outline-variant rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer hover:bg-surface-container shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingQr ? "..." : "Upload"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    className="hidden"
                    disabled={uploadingQr}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: GST & Tax Configuration */}
        <div className="bg-surface rounded-lg p-6 border border-outline-variant/40 space-y-4">
          <h2 className="font-serif text-base font-bold text-secondary flex items-center gap-2 pb-2 border-b border-outline-variant/30">
            <FileCheck className="w-4 h-4 text-primary" />
            <span>Taxation & Billing (जीएसटी एवं कर प्रणाली)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Kendra GSTIN (15 Digits)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 09AAAAA0000A1Z5"
                className="w-full min-h-[44px] px-3 py-2 font-mono bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                Default GST Rate (Basis Points, 1800 = 18%)
              </label>
              <input
                type="number"
                value={defaultGstRateBps}
                onChange={(e) => setDefaultGstRateBps(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 font-mono bg-surface-container-low border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] px-8 py-3 bg-secondary hover:bg-secondary/90 text-on-secondary font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Admin Settings"}</span>
        </button>
      </form>
    </div>
  );
}
