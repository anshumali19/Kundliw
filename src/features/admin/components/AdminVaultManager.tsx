"use client";

import React, { useEffect, useRef, useState } from "react";
import { VaultFileActions } from "@/features/vault/VaultFileActions";
import { SelectedFilePreview } from "@/components/content/FileViewer";
import { DOCUMENT_ACCEPT } from "@/lib/storage/fileTypes";
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
  userId?: string;
  userName: string;
  userEmail?: string | null;
  userPhone?: string | null;
  orderNumber?: string | null;
  mimeType: string;
  uploadedByRole?: string;
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
  users: initialUsers,
  locale,
}: AdminVaultManagerProps) {
  const isHindi = locale === "hi";
  const [files, setFiles] = useState<SerializedVaultFile[]>(initialFiles);
  const [users, setUsers] = useState<UserOption[]>(initialUsers);

  // Searching: by customer ID, name, mobile number or e-mail
  type Field = "all" | "id" | "name" | "mobile" | "email";
  const [listQuery, setListQuery] = useState("");
  const [listField, setListField] = useState<Field>("all");
  const [userQuery, setUserQuery] = useState("");
  const [userField, setUserField] = useState<Field>("all");
  const [listBusy, setListBusy] = useState(false);
  const firstRun = useRef(true);
  const userFirst = useRef(true);
  const fieldLabels: Array<[Field, string, string]> = [
    ["all", "All fields", "सभी"],
    ["id", "Customer ID", "ग्राहक ID"],
    ["name", "Name", "नाम"],
    ["mobile", "Mobile no.", "मोबाइल नं."],
    ["email", "Email / Gmail", "ईमेल / जीमेल"],
  ];

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

  const runSearch = async (q: string, field: Field) => {
    const res = await fetch(`/api/admin/vault/search?q=${encodeURIComponent(q)}&field=${field}`);
    if (!res.ok) throw new Error("Search failed");
    return (await res.json()) as { files: SerializedVaultFile[]; users: UserOption[] };
  };

  // File list: search as the admin types
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const t = setTimeout(async () => {
      setListBusy(true);
      try {
        setFiles((await runSearch(listQuery, listField)).files);
      } catch {
        setError(isHindi ? "खोज नहीं हो सकी।" : "Search could not be completed.");
      } finally {
        setListBusy(false);
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listQuery, listField]);

  // Customer picker: narrow the list of customers
  useEffect(() => {
    if (userFirst.current) {
      userFirst.current = false;
      return;
    }
    const t = setTimeout(async () => {
      try {
        const found = (await runSearch(userQuery, userField)).users;
        setUsers(found);
        setSelectedUserId((cur) => (found.some((u) => u.id === cur) ? cur : found[0]?.id || ""));
        setSelectedOrderId("");
      } catch {
        /* keep the current list */
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userQuery, userField]);

  const filteredFiles = files;

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
        userId: selectedUser?.id,
        userName: selectedUser?.name || "Customer",
        userEmail: selectedUser?.email,
        userPhone: selectedUser?.phone,
        orderNumber: selectedUser?.orders.find((o) => o.id === selectedOrderId)?.orderNumber || null,
        mimeType: data.vaultFile.mimeType,
        uploadedByRole: data.vaultFile.uploadedByRole,
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
          <div className="p-4 rounded bg-error-container/20 border border-error text-on-error-container text-xs flex items-start gap-2">
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
              <div className="flex gap-2 mb-2">
                <select
                  value={userField}
                  onChange={(e) => setUserField(e.target.value as Field)}
                  aria-label={isHindi ? "खोज का प्रकार" : "Search by"}
                  className="min-h-[44px] px-2 bg-surface border border-outline-variant rounded text-xs font-semibold focus:border-secondary focus:outline-none"
                >
                  {fieldLabels.map(([id, en, hi]) => (
                    <option key={id} value={id}>
                      {isHindi ? hi : en}
                    </option>
                  ))}
                </select>
                <input
                  type="search"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder={isHindi ? "ID, नाम, मोबाइल या ईमेल से ग्राहक खोजें" : "Find customer by ID, name, mobile or email"}
                  className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
                />
              </div>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setSelectedOrderId("");
                }}
                className="w-full min-h-[44px] px-3 py-2 bg-surface border border-outline-variant rounded text-xs font-semibold focus:border-secondary focus:outline-none"
              >
                {users.length === 0 && <option value="">{isHindi ? "कोई ग्राहक नहीं मिला" : "No customer found"}</option>}
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.phone ? `(${u.phone})` : ""} {u.email ? `• ${u.email}` : ""} • ID {u.id.slice(-8)}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-on-surface-variant mt-1">
                {users.length} {isHindi ? "ग्राहक" : "customers"}
              </p>
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

          {/* File picker with a preview beside it */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                {isHindi ? "फाइल (अधिकतम ४ MB) *" : "File (up to 4 MB) *"}
              </label>
              <input
                type="file"
                required
                accept={DOCUMENT_ACCEPT}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-surface-container-high file:text-secondary hover:file:bg-surface-container-highest cursor-pointer"
              />
              <p className="text-[11px] text-on-surface-variant mt-1">
                {isHindi
                  ? "PDF, चित्र, वीडियो, ऑडियो, Word, Excel, PowerPoint, RTF या टेक्स्ट फाइल।"
                  : "PDF, image, video, audio, Word, Excel, PowerPoint, RTF or text file."}
              </p>
            </div>
            <SelectedFilePreview
              file={file}
              emptyText={isHindi ? "चुनी गई फाइल यहाँ दिखाई देगी।" : "The file you choose appears here."}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
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

          <div className="flex w-full sm:w-auto gap-2">
            <select
              value={listField}
              onChange={(e) => setListField(e.target.value as Field)}
              aria-label={isHindi ? "खोज का प्रकार" : "Filter by"}
              className="min-h-[44px] px-2 bg-surface border border-outline-variant rounded text-xs font-semibold focus:border-secondary focus:outline-none"
            >
              {fieldLabels.map(([id, en, hi]) => (
                <option key={id} value={id}>
                  {isHindi ? hi : en}
                </option>
              ))}
            </select>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 w-4 h-4 text-on-surface-variant" />
              <input
                type="search"
                placeholder={isHindi ? "ID, नाम, मोबाइल, ईमेल या शीर्षक से खोजें..." : "Search by ID, name, mobile, email or title..."}
                value={listQuery}
                onChange={(e) => setListQuery(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded text-xs focus:border-secondary focus:outline-none"
              />
            </div>
            {listBusy && <span className="self-center text-[11px] text-on-surface-variant">…</span>}
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
                      {doc.userPhone && <span>{doc.userPhone}</span>}
                      {doc.userEmail && <span>{doc.userEmail}</span>}
                      {doc.userId && <span className="font-mono">ID {doc.userId.slice(-8)}</span>}
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
                  {doc.uploadedByRole && doc.uploadedByRole !== "ADMIN" && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand/20 text-primary">
                      {isHindi ? "ग्राहक द्वारा अपलोड" : `Uploaded by ${doc.uploadedByRole.toLowerCase()}`}
                    </span>
                  )}
                  <VaultFileActions
                    id={doc.id}
                    title={isHindi ? doc.titleHi : doc.titleEn}
                    fileName={doc.fileName}
                    mimeType={doc.mimeType}
                    isHindi={isHindi}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
