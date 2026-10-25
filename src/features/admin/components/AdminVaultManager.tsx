"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  FolderLock,
  User as UserIcon,
} from "lucide-react";

export interface SerializedVaultFile {
  id: string;
  titleEn: string;
  titleHi: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  userName: string;
  userEmail?: string | null;
  userPhone?: string | null;
  orderNumber?: string | null;
}

export interface UserOption {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  orders: Array<{ id: string; orderNumber: string }>;
}

interface AdminVaultManagerProps {
  files: SerializedVaultFile[];
  users: UserOption[];
  locale: string;
}

export function AdminVaultManager({
  files: initialFiles,
  users,
  locale,
}: AdminVaultManagerProps) {
  const isHindi = locale === "hi";
  const [files, setFiles] = useState<SerializedVaultFile[]>(initialFiles);
  const [search, setSearch] = useState("");

  // Form state
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || "");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const filteredFiles = files.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.titleEn.toLowerCase().includes(q) ||
      f.titleHi.toLowerCase().includes(q) ||
      f.fileName.toLowerCase().includes(q) ||
      f.userName.toLowerCase().includes(q) ||
      (f.orderNumber && f.orderNumber.toLowerCase().includes(q))
    );
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !titleEn.trim() || !titleHi.trim() || !file) {
      setError(
        isHindi
          ? "कृपया उपयोगकर्ता, दोनों भाषाओं में शीर्षक और पीडीएफ फाइल चुनें।"
          : "Please specify user, bilingual titles, and select a PDF file."
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("userId", selectedUserId);
      if (selectedOrderId) {
        formData.append("orderId", selectedOrderId);
      }
      formData.append("titleEn", titleEn.trim());
      formData.append("titleHi", titleHi.trim());
      formData.append("file", file);

      const res = await fetch("/api/admin/vault/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccess(
        isHindi
          ? "कुण्डली दस्तावेज सफलतापूर्वक ग्राहक वॉल्ट में अपलोड किया गया।"
          : "Kundli PDF uploaded to the customer vault."
      );

      // Add to list
      const newFile: SerializedVaultFile = {
        id: data.vaultFile.id,
        titleEn: data.vaultFile.titleEn,
        titleHi: data.vaultFile.titleHi,
        fileName: data.vaultFile.fileName,
        fileSize: data.vaultFile.fileSize,
        uploadedAt: data.vaultFile.uploadedAt,
        userName: selectedUser?.name || "Customer",
        userEmail: selectedUser?.email,
        userPhone: selectedUser?.phone,
        orderNumber: selectedUser?.orders.find((o) => o.id === selectedOrderId)?.orderNumber || null,
      };

      setFiles([newFile, ...files]);
      setTitleEn("");
      setTitleHi("");
      setFile(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full text-left space-y-8">
      {/* Top Section: Upload Drawer / Form */}
      <div className="bg-surface rounded-lg p-6 sm:p-8 border-2 border-secondary/30 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-outline-variant/40">
          <FolderLock className="w-5 h-5 text-secondary" />
          <h2 className="font-serif text-lg font-bold text-secondary">
            {isHindi ? "ग्राहक डिजिटल वॉल्ट में कुण्डली PDF अपलोड करें" : "Upload Kundli PDF to Customer Vault"}
          </h2>
        </div>

        {error && (
          <div className="p-4 rounded bg-error-container/20 border border-error text-error text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target User */}
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "लक्षित ग्राहक चुनें *" : "Select Target Customer *"}
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setSelectedOrderId("");
                }}
                className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs font-semibold focus:border-secondary focus:outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.phone ? `(${u.phone})` : ""} {u.email ? `• ${u.email}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Order (optional) */}
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "संबंधित आदेश संख्या (वैकल्पिक)" : "Associated Order (Optional)"}
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs font-mono focus:border-secondary focus:outline-none"
              >
                <option value="">{isHindi ? "-- कोई संबद्ध आदेश नहीं --" : "-- Direct Vault Upload --"}</option>
                {selectedUser?.orders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    {ord.orderNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Bilingual Titles */}
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "दस्तावेज़ शीर्षक (English) *" : "Document Title (English) *"}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lifetime Janampatri"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "दस्तावेज़ शीर्षक (हिन्दी) *" : "Document Title (Hindi) *"}
              </label>
              <input
                type="text"
                required
                placeholder="उदा. सम्पूर्ण जन्मपत्रिका एवं षोडशवर्ग चक्र"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          {/* PDF File Picker */}
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
              {isHindi ? "कुण्डली PDF फाइल (अधिकतम १० MB) *" : "Kundli PDF File (Max 10 MB) *"}
            </label>
            <input
              type="file"
              required
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-surface-container-high file:text-secondary hover:file:bg-surface-container-highest cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] px-6 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{submitting ? (isHindi ? "अपलोड हो रहा है..." : "Uploading...") : (isHindi ? "वॉल्ट में सुरक्षित करें" : "Upload to Vault")}</span>
          </button>
        </form>
      </div>

      {/* Files List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-secondary">
              {isHindi ? "अपलोड किए गए वॉल्ट दस्तावेज़" : "Uploaded Vault Documents"}
            </h3>
            <span className="text-xs text-on-surface-variant">
              {files.length} {isHindi ? "दस्तावेज़ संचित" : "files on record"}
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder={isHindi ? "शीर्षक, ग्राहक या फाइल से खोजें..." : "Search documents..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
            />
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center bg-surface-container rounded-lg border border-outline-variant/40 text-on-surface-variant text-sm">
            {isHindi ? "कोई वॉल्ट दस्तावेज़ नहीं मिला।" : "No vault documents found."}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFiles.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-surface rounded-lg border border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-secondary shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-on-surface">
                      {isHindi ? doc.titleHi : doc.titleEn}
                    </h4>
                    <div className="text-xs text-on-surface-variant mt-0.5 space-x-2">
                      <span className="font-semibold text-secondary">
                        <UserIcon className="w-3 h-3 inline mr-1" />
                        {doc.userName}
                      </span>
                      {doc.orderNumber && (
                        <span className="font-mono text-primary font-bold">
                          Ref: {doc.orderNumber}
                        </span>
                      )}
                      <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-outline">
                    {new Date(doc.uploadedAt).toLocaleDateString(isHindi ? "hi-IN" : "en-IN")}
                  </span>
                  <a
                    href={`/api/vault/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[44px] px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-secondary text-xs font-bold rounded flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isHindi ? "डाउनलोड" : "Download"}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
