"use client";

import { LinkTextarea } from "@/components/admin/LinkTextarea";
import { useState } from "react";
import { formatPaiseToInr } from "@/lib/billing/gst";
import { paiseToRupees } from "@/lib/billing/money";
import { LinkItem, normalizeLinks } from "@/lib/content/media";
import { ImageUrlField, LinksEditor, YouTubeUrlField } from "@/components/admin/MediaFields";
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Check,
  AlertCircle,
  X,
  Clock,
  PhoneCall,
  FileText,
} from "lucide-react";

export interface AdminPackageItem {
  id: string;
  slug: string;
  titleEn: string;
  titleHi: string;
  descriptionEn?: string | null;
  descriptionHi?: string | null;
  numberOfDays?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  seats?: number | null;
  booked?: number;
  itineraryDays?: unknown;
  inclusionsEn?: string[];
  inclusionsHi?: string[];
  exclusionsEn?: string[];
  exclusionsHi?: string[];
  materialsEn?: string[];
  materialsHi?: string[];
  youtubeUrl?: string | null;
  imageUrl?: string | null;
  additionalLinks?: unknown;
  orderIndex: number;
  isActive: boolean;
}

interface PackageDay { titleEn: string; titleHi: string; detailsEn: string; detailsHi: string }
const emptyDay = (): PackageDay => ({ titleEn: "", titleHi: "", detailsEn: "", detailsHi: "" });
const toDays = (raw: unknown): PackageDay[] =>
  Array.isArray(raw)
    ? raw.map((d) => {
        const r = (d ?? {}) as Record<string, unknown>;
        return {
          titleEn: String(r.titleEn ?? ""),
          titleHi: String(r.titleHi ?? ""),
          detailsEn: String(r.detailsEn ?? ""),
          detailsHi: String(r.detailsHi ?? ""),
        };
      })
    : [];
const linesOf = (list?: string[]) => (list ?? []).join("\n");
const toLines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export interface AdminPlanItem {
  id: string;
  packageId?: string | null;
  slug: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  pricePaise: number;
  originalPricePaise: number | null;
  deliveryDays: number;
  pages: number | null;
  hasCall: boolean;
  callDurationMinutes: number | null;
  featuresEn: string[];
  featuresHi: string[];
  isPopular: boolean;
  orderIndex: number;
  isActive: boolean;
  programEn?: string | null;
  programHi?: string | null;
  preparationEn?: string | null;
  preparationHi?: string | null;
  samagriEn?: string | null;
  samagriHi?: string | null;
  itineraryEn?: string | null;
  itineraryHi?: string | null;
  imageUrl?: string | null;
  youtubeUrl?: string | null;
  additionalLinks?: unknown;
}

export interface AdminServiceItem {
  id: string;
  slug: string;
  titleEn: string;
  titleHi: string;
  taglineEn?: string | null;
  taglineHi?: string | null;
  descriptionEn: string;
  descriptionHi: string;
  highlightsEn: string[];
  highlightsHi: string[];
  notesEn?: string | null;
  notesHi?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  itineraryEn?: string | null;
  itineraryHi?: string | null;
  samagriEn?: string | null;
  samagriHi?: string | null;
  youtubeUrl?: string | null;
  additionalLinks?: unknown;
  orderIndex: number;
  isActive: boolean;
  plans: AdminPlanItem[];
  packages: AdminPackageItem[];
  _count?: {
    orders: number;
  };
}

interface AdminServicesManagerProps {
  initialServices: AdminServiceItem[];
  locale: string;
}

export function AdminServicesManager({
  initialServices,
  locale,
}: AdminServicesManagerProps) {
  const isHindi = locale === "hi";
  const [services, setServices] = useState<AdminServiceItem[]>(initialServices);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(
    services[0]?.id || null
  );

  // Service Modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState({
    slug: "",
    titleEn: "",
    titleHi: "",
    taglineEn: "",
    taglineHi: "",
    descriptionEn: "",
    descriptionHi: "",
    highlightsEnText: "",
    highlightsHiText: "",
    notesEn: "",
    notesHi: "",
    icon: "auto_stories",
    imageUrl: "",
    itineraryEn: "",
    itineraryHi: "",
    samagriEn: "",
    samagriHi: "",
    youtubeUrl: "",
    additionalLinks: [] as LinkItem[],
    orderIndex: 0,
    isActive: true,
  });

  // Plan Modal state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedServiceForPlan, setSelectedServiceForPlan] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<AdminPlanItem | null>(null);
  const [planForm, setPlanForm] = useState({
    packageId: "",
    slug: "",
    titleEn: "",
    titleHi: "",
    descriptionEn: "",
    descriptionHi: "",
    priceRupees: 1100,
    originalPriceRupees: "" as string | number,
    deliveryDays: 3,
    pages: "" as string | number,
    hasCall: false,
    callDurationMinutes: "" as string | number,
    featuresEnText: "",
    featuresHiText: "",
    isPopular: false,
    orderIndex: 0,
    isActive: true,
    programEn: "",
    programHi: "",
    preparationEn: "",
    preparationHi: "",
    samagriEn: "",
    samagriHi: "",
    itineraryEn: "",
    itineraryHi: "",
    imageUrl: "",
    youtubeUrl: "",
    additionalLinks: [] as LinkItem[],
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", "media");
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image upload failed");
      setServiceForm((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Open Service Modal
  const handleOpenServiceModal = (service?: AdminServiceItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (service) {
      setEditingService(service);
      setServiceForm({
        slug: service.slug,
        titleEn: service.titleEn,
        titleHi: service.titleHi,
        taglineEn: service.taglineEn || "",
        taglineHi: service.taglineHi || "",
        descriptionEn: service.descriptionEn,
        descriptionHi: service.descriptionHi,
        highlightsEnText: (service.highlightsEn || []).join("\n"),
        highlightsHiText: (service.highlightsHi || []).join("\n"),
        notesEn: service.notesEn || "",
        notesHi: service.notesHi || "",
        icon: service.icon || "auto_stories",
        imageUrl: service.imageUrl || "",
        itineraryEn: service.itineraryEn || "",
        itineraryHi: service.itineraryHi || "",
        samagriEn: service.samagriEn || "",
        samagriHi: service.samagriHi || "",
        youtubeUrl: service.youtubeUrl || "",
        additionalLinks: normalizeLinks(service.additionalLinks),
        orderIndex: service.orderIndex,
        isActive: service.isActive,
      });
    } else {
      setEditingService(null);
      setServiceForm({
        slug: "",
        titleEn: "",
        titleHi: "",
        taglineEn: "",
        taglineHi: "",
        descriptionEn: "",
        descriptionHi: "",
        highlightsEnText: "",
        highlightsHiText: "",
        notesEn: "",
        notesHi: "",
        icon: "auto_stories",
        imageUrl: "",
        itineraryEn: "",
        itineraryHi: "",
        samagriEn: "",
        samagriHi: "",
        youtubeUrl: "",
        additionalLinks: [],
        orderIndex: services.length + 1,
        isActive: true,
      });
    }
    setServiceModalOpen(true);
  };

  // Save Service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const parsedLinks = serviceForm.additionalLinks.filter((l) => l.url.trim());

      const payload = {
        slug: serviceForm.slug,
        titleEn: serviceForm.titleEn,
        titleHi: serviceForm.titleHi,
        taglineEn: serviceForm.taglineEn || undefined,
        taglineHi: serviceForm.taglineHi || undefined,
        descriptionEn: serviceForm.descriptionEn,
        descriptionHi: serviceForm.descriptionHi,
        highlightsEn: serviceForm.highlightsEnText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        highlightsHi: serviceForm.highlightsHiText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        notesEn: serviceForm.notesEn ? serviceForm.notesEn.trim() : null,
        notesHi: serviceForm.notesHi ? serviceForm.notesHi.trim() : null,
        icon: serviceForm.icon || "auto_stories",
        imageUrl: serviceForm.imageUrl ? serviceForm.imageUrl.trim() : null,
        itineraryEn: serviceForm.itineraryEn ? serviceForm.itineraryEn.trim() : null,
        itineraryHi: serviceForm.itineraryHi ? serviceForm.itineraryHi.trim() : null,
        samagriEn: serviceForm.samagriEn ? serviceForm.samagriEn.trim() : null,
        samagriHi: serviceForm.samagriHi ? serviceForm.samagriHi.trim() : null,
        youtubeUrl: serviceForm.youtubeUrl ? serviceForm.youtubeUrl.trim() : null,
        additionalLinks: parsedLinks.length > 0 ? parsedLinks : null,
        orderIndex: Number(serviceForm.orderIndex),
        isActive: Boolean(serviceForm.isActive),
      };

      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : `/api/admin/services`;
      const method = editingService ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save service");
      }

      if (editingService) {
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? { ...s, ...data.service } : s))
        );
        setSuccessMsg("Service updated successfully.");
      } else {
        setServices((prev) => [...prev, { ...data.service, plans: [], packages: [] }]);
        setSuccessMsg("Service created successfully.");
      }
      setServiceModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving service";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Service active status
  const handleToggleServiceActive = async (service: AdminServiceItem) => {
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, isActive: !s.isActive } : s))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Plan Modal
  const handleOpenPlanModal = (serviceId: string, plan?: AdminPlanItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSelectedServiceForPlan(serviceId);
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        packageId: plan.packageId || "",
        slug: plan.slug,
        titleEn: plan.titleEn,
        titleHi: plan.titleHi,
        descriptionEn: plan.descriptionEn,
        descriptionHi: plan.descriptionHi,
        priceRupees: paiseToRupees(plan.pricePaise),
        originalPriceRupees: plan.originalPricePaise ? paiseToRupees(plan.originalPricePaise) : "",
        deliveryDays: plan.deliveryDays,
        pages: plan.pages || "",
        hasCall: plan.hasCall,
        callDurationMinutes: plan.callDurationMinutes || "",
        featuresEnText: plan.featuresEn.join("\n"),
        featuresHiText: plan.featuresHi.join("\n"),
        isPopular: plan.isPopular,
        orderIndex: plan.orderIndex,
        isActive: plan.isActive,
        programEn: plan.programEn || "",
        programHi: plan.programHi || "",
        preparationEn: plan.preparationEn || "",
        preparationHi: plan.preparationHi || "",
        samagriEn: plan.samagriEn || "",
        samagriHi: plan.samagriHi || "",
        itineraryEn: plan.itineraryEn || "",
        itineraryHi: plan.itineraryHi || "",
        imageUrl: plan.imageUrl || "",
        youtubeUrl: plan.youtubeUrl || "",
        additionalLinks: normalizeLinks(plan.additionalLinks),
      });
    } else {
      setEditingPlan(null);
      const parent = services.find((s) => s.id === serviceId);
      setPlanForm({
        packageId: parent?.packages[0]?.id || "",
        slug: "",
        titleEn: "",
        titleHi: "",
        descriptionEn: "",
        descriptionHi: "",
        priceRupees: 1100,
        originalPriceRupees: "",
        deliveryDays: 3,
        pages: "",
        hasCall: false,
        callDurationMinutes: "",
        featuresEnText: "",
        featuresHiText: "",
        isPopular: false,
        orderIndex: (parent?.plans.length || 0) + 1,
        isActive: true,
        programEn: "",
        programHi: "",
        preparationEn: "",
        preparationHi: "",
        samagriEn: "",
        samagriHi: "",
        itineraryEn: "",
        itineraryHi: "",
        imageUrl: "",
        youtubeUrl: "",
        additionalLinks: [],
      });
    }
    setPlanModalOpen(true);
  };

  // Save Plan
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceForPlan) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        serviceId: selectedServiceForPlan,
        packageId: planForm.packageId || null,
        slug: planForm.slug,
        titleEn: planForm.titleEn,
        titleHi: planForm.titleHi,
        descriptionEn: planForm.descriptionEn,
        descriptionHi: planForm.descriptionHi,
        priceRupees: Number(planForm.priceRupees),
        originalPriceRupees: planForm.originalPriceRupees
          ? Number(planForm.originalPriceRupees)
          : null,
        deliveryDays: Number(planForm.deliveryDays),
        pages: planForm.pages ? Number(planForm.pages) : null,
        hasCall: Boolean(planForm.hasCall),
        callDurationMinutes: planForm.callDurationMinutes
          ? Number(planForm.callDurationMinutes)
          : null,
        featuresEn: planForm.featuresEnText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        featuresHi: planForm.featuresHiText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        isPopular: Boolean(planForm.isPopular),
        orderIndex: Number(planForm.orderIndex),
        isActive: Boolean(planForm.isActive),
        programEn: planForm.programEn ? planForm.programEn.trim() : null,
        programHi: planForm.programHi ? planForm.programHi.trim() : null,
        preparationEn: planForm.preparationEn ? planForm.preparationEn.trim() : null,
        preparationHi: planForm.preparationHi ? planForm.preparationHi.trim() : null,
        samagriEn: planForm.samagriEn ? planForm.samagriEn.trim() : null,
        samagriHi: planForm.samagriHi ? planForm.samagriHi.trim() : null,
        itineraryEn: planForm.itineraryEn ? planForm.itineraryEn.trim() : null,
        itineraryHi: planForm.itineraryHi ? planForm.itineraryHi.trim() : null,
        imageUrl: planForm.imageUrl ? planForm.imageUrl.trim() : null,
        youtubeUrl: planForm.youtubeUrl ? planForm.youtubeUrl.trim() : null,
        additionalLinks: planForm.additionalLinks.filter((l) => l.url.trim()),
      };

      const url = editingPlan
        ? `/api/admin/plans/${editingPlan.id}`
        : `/api/admin/plans`;
      const method = editingPlan ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save plan");
      }

      setServices((prev) =>
        prev.map((s) => {
          if (s.id !== selectedServiceForPlan) return s;
          const updatedPlans = editingPlan
            ? s.plans.map((p) => (p.id === editingPlan.id ? data.plan : p))
            : [...s.plans, data.plan];
          return { ...s, plans: updatedPlans };
        })
      );

      setSuccessMsg(editingPlan ? "Plan updated." : "Plan added.");
      setPlanModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving plan";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Plan active status
  const handleTogglePlanActive = async (serviceId: string, plan: AdminPlanItem) => {
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => {
            if (s.id !== serviceId) return s;
            return {
              ...s,
              plans: s.plans.map((p) =>
                p.id === plan.id ? { ...p, isActive: !p.isActive } : p
              ),
            };
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Remove a service. Services with past orders are switched off instead, so order records stay intact.
  const handleDeleteService = async (service: AdminServiceItem) => {
    if (
      !window.confirm(
        isHindi
          ? `"${service.titleHi}" हटाएँ? इसके सभी संस्करण भी हट जाएँगे।`
          : `Remove "${service.titleEn}"? Its plans are removed too.`
      )
    )
      return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove service");
      if (data.deactivated) {
        setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, isActive: false } : s)));
      } else {
        setServices((prev) => prev.filter((s) => s.id !== service.id));
      }
      setSuccessMsg(data.message || "Service removed.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to remove service");
    }
  };

  // ---- Packages (the level between a service and its plans)
  const slugify = (v: string) =>
    v
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  const [packageModal, setPackageModal] = useState<{ serviceId: string; editing: AdminPackageItem | null } | null>(null);
  const [packageForm, setPackageForm] = useState({
    slug: "",
    titleEn: "",
    titleHi: "",
    descriptionEn: "",
    descriptionHi: "",
    numberOfDays: "" as string | number,
    startDate: "",
    endDate: "",
    seats: "" as string | number,
    itineraryDays: [] as PackageDay[],
    inclusionsEn: "",
    inclusionsHi: "",
    exclusionsEn: "",
    exclusionsHi: "",
    materialsEn: "",
    materialsHi: "",
    youtubeUrl: "",
    imageUrl: "",
    additionalLinks: [] as LinkItem[],
    orderIndex: 0,
    isActive: true,
  });

  const handleOpenPackageModal = (serviceId: string, pkg?: AdminPackageItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const parent = services.find((s) => s.id === serviceId);
    setPackageForm({
      slug: pkg?.slug || "",
      titleEn: pkg?.titleEn || "",
      titleHi: pkg?.titleHi || "",
      descriptionEn: pkg?.descriptionEn || "",
      descriptionHi: pkg?.descriptionHi || "",
      numberOfDays: pkg?.numberOfDays ?? "",
      startDate: pkg?.startDate ? pkg.startDate.slice(0, 10) : "",
      endDate: pkg?.endDate ? pkg.endDate.slice(0, 10) : "",
      seats: pkg?.seats ?? "",
      itineraryDays: toDays(pkg?.itineraryDays),
      inclusionsEn: linesOf(pkg?.inclusionsEn),
      inclusionsHi: linesOf(pkg?.inclusionsHi),
      exclusionsEn: linesOf(pkg?.exclusionsEn),
      exclusionsHi: linesOf(pkg?.exclusionsHi),
      materialsEn: linesOf(pkg?.materialsEn),
      materialsHi: linesOf(pkg?.materialsHi),
      youtubeUrl: pkg?.youtubeUrl || "",
      imageUrl: pkg?.imageUrl || "",
      additionalLinks: normalizeLinks(pkg?.additionalLinks),
      orderIndex: pkg ? pkg.orderIndex : (parent?.packages.length || 0) + 1,
      isActive: pkg ? pkg.isActive : true,
    });
    setPackageModal({ serviceId, editing: pkg || null });
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageModal) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = {
        serviceId: packageModal.serviceId,
        slug: packageForm.slug.trim() || slugify(packageForm.titleEn),
        titleEn: packageForm.titleEn,
        titleHi: packageForm.titleHi,
        descriptionEn: packageForm.descriptionEn.trim() || null,
        descriptionHi: packageForm.descriptionHi.trim() || null,
        numberOfDays: packageForm.numberOfDays === "" ? null : Number(packageForm.numberOfDays),
        startDate: packageForm.startDate || null,
        endDate: packageForm.endDate || null,
        seats: packageForm.seats === "" ? null : Number(packageForm.seats),
        itineraryDays: packageForm.itineraryDays.filter((d) => d.titleEn.trim() || d.titleHi.trim() || d.detailsEn.trim() || d.detailsHi.trim()),
        inclusionsEn: toLines(packageForm.inclusionsEn),
        inclusionsHi: toLines(packageForm.inclusionsHi),
        exclusionsEn: toLines(packageForm.exclusionsEn),
        exclusionsHi: toLines(packageForm.exclusionsHi),
        materialsEn: toLines(packageForm.materialsEn),
        materialsHi: toLines(packageForm.materialsHi),
        youtubeUrl: packageForm.youtubeUrl.trim() || null,
        imageUrl: packageForm.imageUrl.trim() || null,
        additionalLinks: packageForm.additionalLinks.filter((l) => l.url.trim()),
        orderIndex: Number(packageForm.orderIndex),
        isActive: packageForm.isActive,
      };
      const editing = packageModal.editing;
      const res = await fetch(editing ? `/api/admin/packages/${editing.id}` : "/api/admin/packages", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.details ? Object.values(data.details).flat().join(" ") : "";
        throw new Error(data.error ? `${data.error} ${detail}`.trim() : "Failed to save package");
      }
      setServices((prev) =>
        prev.map((s) => {
          if (s.id !== packageModal.serviceId) return s;
          const saved = { ...data.package, booked: editing?.booked ?? 0 };
          const list = editing ? s.packages.map((p) => (p.id === editing.id ? saved : p)) : [...s.packages, saved];
          return { ...s, packages: list.sort((a, b) => a.orderIndex - b.orderIndex) };
        })
      );
      setSuccessMsg(editing ? "Package updated." : "Package added. Now add plans under it.");
      setPackageModal(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error saving package");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (serviceId: string, pkg: AdminPackageItem) => {
    if (!window.confirm(isHindi ? `"${pkg.titleHi}" पैकेज हटाएँ?` : `Remove the package "${pkg.titleEn}"?`)) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove package");
      setServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, packages: s.packages.filter((p) => p.id !== pkg.id) } : s)));
      setSuccessMsg("Package removed.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to remove package");
    }
  };

  const handleDeletePlan = async (serviceId: string, plan: AdminPlanItem) => {
    if (
      !window.confirm(
        isHindi ? `"${plan.titleHi}" संस्करण हटाएँ?` : `Remove the plan "${plan.titleEn}"?`
      )
    )
      return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove plan");
      setServices((prev) =>
        prev.map((s) => {
          if (s.id !== serviceId) return s;
          return {
            ...s,
            plans: data.deactivated
              ? s.plans.map((p) => (p.id === plan.id ? { ...p, isActive: false } : p))
              : s.plans.filter((p) => p.id !== plan.id),
          };
        })
      );
      setSuccessMsg(data.message || "Plan removed.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to remove plan");
    }
  };

  return (
    <div className="w-full flex flex-col text-left space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-secondary">
            {isHindi ? "वैदिक सेवा एवं संस्करण प्रबंधन" : "Services & Plans Catalog"}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            {isHindi
              ? "शास्त्रसम्मत सेवाएँ, परामर्श योजनाएँ एवं दक्षिणा दरें नियंत्रित करें। (रुपये में प्रविष्टि, पैसे में संग्रहण)"
              : "Manage bilingual services, consultation plans, and dakshina rates. (Entered in Rupees, saved in Paise)"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenServiceModal()}
          className="min-h-[44px] px-4 py-2 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? "नई सेवा जोड़ें" : "Add Service"}</span>
        </button>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="p-3 bg-surface rounded border border-tertiary-fixed text-xs text-secondary font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-tertiary" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-surface rounded border border-error text-xs text-on-error-container font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Services List Accordion */}
      <div className="space-y-4">
        {services.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-low rounded border border-outline-variant/50 text-on-surface-variant text-sm">
            {isHindi ? "कोई सेवा प्रविष्टि उपलब्ध नहीं है।" : "No services created yet."}
          </div>
        ) : (
          services.map((service) => {
            const isExpanded = expandedServiceId === service.id;
            return (
              <div
                key={service.id}
                className="rounded-lg border border-outline-variant/60 bg-surface overflow-hidden shadow-sm"
              >
                {/* Service Row Header */}
                <div
                  onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                  className="p-4 bg-surface-container-low/70 hover:bg-surface-container-low flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      className="p-1 text-secondary"
                      aria-label="Toggle plans"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif font-bold text-base text-secondary">
                          {isHindi ? service.titleHi : service.titleEn}
                        </span>
                        <span className="text-xs font-mono text-on-surface-variant bg-surface px-2 py-0.5 rounded border border-outline-variant/40">
                          /{service.slug}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            service.isActive
                              ? "bg-tertiary-fixed text-on-tertiary-fixed"
                              : "bg-surface-container-high text-outline"
                          }`}
                        >
                          {service.isActive ? (isHindi ? "सक्रिय" : "Active") : isHindi ? "निष्क्रिय" : "Inactive"}
                        </span>
                      </div>
                      <div className="text-xs text-on-surface-variant mt-0.5">
                        {service.plans.length} {isHindi ? "संस्करण योजनाएँ" : "Plans"} • {service._count?.orders ?? 0} {isHindi ? "ऐतिहासिक आदेश" : "Orders"}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex flex-wrap items-center gap-2 lg:shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleServiceActive(service)}
                      className="min-h-[38px] px-2.5 py-1 text-xs border border-outline-variant rounded hover:bg-surface transition-colors"
                    >
                      {service.isActive ? (isHindi ? "अक्षम करें" : "Deactivate") : isHindi ? "सक्रिय करें" : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenServiceModal(service)}
                      className="min-h-[38px] px-2.5 py-1 text-xs bg-surface border border-secondary text-secondary rounded hover:bg-brand-hover hover:text-on-brand transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isHindi ? "संपादित करें" : "Edit"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteService(service)}
                      className="min-h-[38px] px-2.5 py-1 text-xs bg-surface border border-error text-on-error-container rounded hover:bg-error-container transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isHindi ? "हटाएँ" : "Remove"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenPlanModal(service.id)}
                      className="min-h-[38px] px-3 py-1 text-xs bg-brand hover:bg-brand-hover text-on-brand font-semibold rounded transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isHindi ? "संस्करण जोड़ें" : "Add Plan"}</span>
                    </button>
                  </div>
                </div>

                {/* Service Plans Details (Nested) */}
                {isExpanded && (
                  <div className="p-4 border-t border-outline-variant/30 space-y-4 bg-surface">
                    {/* Packages: Service > Package > Plan */}
                    <div className="rounded-lg border border-outline-variant/50 bg-surface-container-low p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-primary">
                          {isHindi ? "पैकेज (जैसे साधारण, मध्यम, उत्तम)" : "Packages (for example Sadharan, Madhyam, Uttam)"}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenPackageModal(service.id)}
                          className="min-h-[36px] px-3 py-1 text-xs bg-brand hover:bg-brand-hover text-on-brand font-semibold rounded flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isHindi ? "पैकेज जोड़ें" : "Add Package"}</span>
                        </button>
                      </div>
                      {service.packages.length === 0 ? (
                        <p className="text-xs text-on-surface-variant">
                          {isHindi
                            ? "अभी कोई पैकेज नहीं है। पैकेज बनाइए, फिर हर पैकेज में प्लान जोड़िए। ग्राहक पहले पैकेज, फिर प्लान चुनेगा।"
                            : "No packages yet. Create a package, then add plans under it. Customers choose the package first, then the plan."}
                        </p>
                      ) : (
                        <ul className="divide-y divide-outline-variant/40">
                          {service.packages.map((pkg) => (
                            <li key={pkg.id} className={`py-2 flex items-center justify-between gap-2 ${pkg.isActive ? "" : "opacity-60"}`}>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-secondary truncate">{isHindi ? pkg.titleHi : pkg.titleEn}</div>
                                <div className="text-[11px] text-on-surface-variant">
                                  {service.plans.filter((p) => p.packageId === pkg.id).length} {isHindi ? "प्लान" : "plan(s)"}
                                  {pkg.numberOfDays ? ` · ${pkg.numberOfDays} ${isHindi ? "दिन" : "days"}` : ""}
                                  {pkg.startDate ? ` · ${pkg.startDate.slice(0, 10)}${pkg.endDate ? " → " + pkg.endDate.slice(0, 10) : ""}` : ""}
                                  {pkg.seats ? ` · ${pkg.booked ?? 0}/${pkg.seats} ${isHindi ? "सीट भरीं" : "seats taken"}` : pkg.booked ? ` · ${pkg.booked} ${isHindi ? "बुकिंग" : "booked"}` : ""}
                                  {!pkg.isActive ? (isHindi ? " · बंद" : " · switched off") : ""}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button type="button" onClick={() => handleOpenPackageModal(service.id, pkg)} className="min-h-[36px] text-xs px-3 py-1 bg-surface border border-secondary text-secondary rounded hover:bg-brand-hover hover:text-on-brand">
                                  {isHindi ? "संपादित करें" : "Edit"}
                                </button>
                                <button type="button" onClick={() => handleDeletePackage(service.id, pkg)} className="min-h-[36px] text-xs px-2 py-1 border border-error text-on-error-container rounded hover:bg-error-container">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="text-xs font-bold uppercase tracking-wider text-primary">
                      {isHindi ? "इस सेवा के अंतर्गत उपलब्ध संस्करण (Plans)" : "Plans (each belongs to a package)"}
                    </div>

                    {service.plans.length === 0 ? (
                      <div className="p-4 text-center bg-surface-container-low rounded border border-dashed border-outline-variant text-xs text-on-surface-variant">
                        {isHindi
                          ? "इस सेवा में अभी कोई संस्करण नहीं है। 'संस्करण जोड़ें' पर क्लिक करें।"
                          : "No plans under this service. Click 'Add Plan' to create one."}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...service.plans]
                          .sort((a, b) => {
                            const oa = service.packages.find((p) => p.id === a.packageId)?.orderIndex ?? 9999;
                            const ob = service.packages.find((p) => p.id === b.packageId)?.orderIndex ?? 9999;
                            return oa - ob || a.orderIndex - b.orderIndex;
                          })
                          .map((plan) => (
                          <div
                            key={plan.id}
                            className={`p-4 rounded-lg border flex flex-col justify-between ${
                              plan.isActive
                                ? "border-outline-variant/60 bg-surface"
                                : "border-outline-variant/30 bg-surface-container-low opacity-60"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                                <span className="text-xs font-serif font-bold text-secondary">
                                  {isHindi ? plan.titleHi : plan.titleEn}
                                  <span className="block text-[10px] font-sans font-semibold text-primary">
                                    {(() => {
                                      const pk = service.packages.find((p) => p.id === plan.packageId);
                                      return pk ? (isHindi ? pk.titleHi : pk.titleEn) : isHindi ? "पैकेज नहीं चुना" : "No package chosen";
                                    })()}
                                  </span>
                                </span>
                                {plan.isPopular && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand text-on-brand">
                                    {isHindi ? "लोकप्रिय" : "Popular"}
                                  </span>
                                )}
                              </div>

                              <div className="mt-3 flex items-baseline gap-2">
                                <span className="font-serif text-2xl font-bold text-secondary">
                                  {formatPaiseToInr(plan.pricePaise)}
                                </span>
                                {plan.originalPricePaise && (
                                  <span className="text-xs line-through text-outline">
                                    {formatPaiseToInr(plan.originalPricePaise)}
                                  </span>
                                )}
                              </div>

                              <div className="mt-3 space-y-1.5 text-xs text-on-surface-variant">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-secondary" />
                                  <span>{plan.deliveryDays} {isHindi ? "कार्यदिवस" : "days delivery"}</span>
                                </div>
                                {plan.pages && (
                                  <div className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-secondary" />
                                    <span>{plan.pages} {isHindi ? "पृष्ठ" : "Pages"}</span>
                                  </div>
                                )}
                                {plan.hasCall && (
                                  <div className="flex items-center gap-1.5 text-primary font-medium">
                                    <PhoneCall className="w-3.5 h-3.5" />
                                    <span>{plan.callDurationMinutes} {isHindi ? "मिनट परामर्श" : "mins call"}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => handleTogglePlanActive(service.id, plan)}
                                className="min-h-[36px] text-xs px-2 py-1 border border-outline-variant rounded hover:bg-surface-container"
                              >
                                {plan.isActive ? (isHindi ? "अक्षम करें" : "Deactivate") : isHindi ? "सक्रिय करें" : "Activate"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenPlanModal(service.id, plan)}
                                className="min-h-[36px] text-xs px-3 py-1 bg-surface border border-secondary text-secondary font-medium rounded hover:bg-brand-hover hover:text-on-brand transition-colors"
                              >
                                {isHindi ? "संपादित करें" : "Edit Plan"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeletePlan(service.id, plan)}
                                className="min-h-[36px] text-xs px-2 py-1 border border-error text-on-error-container rounded hover:bg-error-container flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                {isHindi ? "हटाएँ" : "Remove"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Service Form */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-[70] bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-surface rounded-lg border border-secondary/30 shadow-xl max-w-2xl w-full p-6 text-left max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <h2 className="font-serif text-lg font-bold text-secondary">
                {editingService
                  ? isHindi
                    ? "सेवा संपादित करें"
                    : "Edit Service"
                  : isHindi
                  ? "नई सेवा जोड़ें"
                  : "Add New Service"}
              </h2>
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="p-1 text-on-surface-variant hover:text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Slug (URL Key) *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceForm.slug}
                    onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })}
                    placeholder="e.g. complete-janampatri"
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Order Index (क्रम)
                  </label>
                  <input
                    type="number"
                    value={serviceForm.orderIndex}
                    onChange={(e) => setServiceForm({ ...serviceForm, orderIndex: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceForm.titleEn}
                    onChange={(e) => setServiceForm({ ...serviceForm, titleEn: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    शीर्षक (हिन्दी) *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceForm.titleHi}
                    onChange={(e) => setServiceForm({ ...serviceForm, titleHi: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Tagline (English)
                  </label>
                  <input
                    type="text"
                    value={serviceForm.taglineEn}
                    onChange={(e) => setServiceForm({ ...serviceForm, taglineEn: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    टैगलाइन (हिन्दी)
                  </label>
                  <input
                    type="text"
                    value={serviceForm.taglineHi}
                    onChange={(e) => setServiceForm({ ...serviceForm, taglineHi: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-secondary mb-1">
                  Description (English) *
                </label>
                <LinkTextarea rows={3} value={serviceForm.descriptionEn} onChange={(v) => setServiceForm({ ...serviceForm, descriptionEn: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" required />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-secondary mb-1">
                  विवरण (हिन्दी) *
                </label>
                <LinkTextarea rows={3} value={serviceForm.descriptionHi} onChange={(v) => setServiceForm({ ...serviceForm, descriptionHi: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" required />
              </div>

              {/* Bilingual Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Highlights (English, one per line)
                  </label>
                  <LinkTextarea rows={3} value={serviceForm.highlightsEnText} onChange={(v) => setServiceForm({ ...serviceForm, highlightsEnText: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Natal chart audit&#10;Dasha transition timeline" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    मुख्य सेवा विशेषताएँ (हिन्दी, प्रति पंक्ति एक)
                  </label>
                  <LinkTextarea rows={3} value={serviceForm.highlightsHiText} onChange={(v) => setServiceForm({ ...serviceForm, highlightsHiText: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="लग्न एवं नवम भाव सूक्ष्म विचार&#10;दशा महादशा क्रम" />
                </div>
              </div>

              {/* Optional Editorial / Scriptural Notes Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Editorial Notes / Sanskrit Verse (English)
                  </label>
                  <LinkTextarea rows={2} value={serviceForm.notesEn} onChange={(v) => setServiceForm({ ...serviceForm, notesEn: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Optional editorial notes or quote..." />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    संपादकीय टिप्पणी / श्लोक (हिन्दी)
                  </label>
                  <LinkTextarea rows={2} value={serviceForm.notesHi} onChange={(v) => setServiceForm({ ...serviceForm, notesHi: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="वैकल्पिक शास्त्रीय सूत्र अथवा टिप्पणी..." />
                </div>
              </div>

              {/* Media: Image & YouTube URL (#17, #47) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Featured Image
                  </label>
                  <input
                    type="text"
                    value={serviceForm.imageUrl}
                    onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                    placeholder="Paste an image link, or upload a file below"
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                        e.target.value = "";
                      }}
                      className="text-xs"
                    />
                    {uploadingImage && <span className="text-xs text-on-surface-variant">Uploading...</span>}
                  </div>
                  {serviceForm.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={serviceForm.imageUrl}
                      alt="Service preview"
                      className="mt-2 h-24 w-auto rounded border border-outline-variant/60 object-cover"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Video link: YouTube, Vimeo, Google Drive or a direct .mp4 link
                  </label>
                  <input
                    type="url"
                    value={serviceForm.youtubeUrl}
                    onChange={(e) => setServiceForm({ ...serviceForm, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              {/* Itinerary (#12) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Itinerary / Step-by-Step Schedule (English)
                  </label>
                  <LinkTextarea rows={3} value={serviceForm.itineraryEn} onChange={(v) => setServiceForm({ ...serviceForm, itineraryEn: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono" placeholder="Day 1: Sankalp & Pooja&#10;Day 2: Havan & Abhishek" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    यात्रा क्रम / दैनिक कार्ययोजना (हिन्दी)
                  </label>
                  <LinkTextarea rows={3} value={serviceForm.itineraryHi} onChange={(v) => setServiceForm({ ...serviceForm, itineraryHi: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono" placeholder="दिन १: संकल्प एवं गणेश पूजन&#10;दिन २: रुद्राभिषेक एवं हवन" />
                </div>
              </div>

              {/* Samagri List (#12) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Puja Samagri / Required Materials (English)
                  </label>
                  <LinkTextarea rows={3} value={serviceForm.samagriEn} onChange={(v) => setServiceForm({ ...serviceForm, samagriEn: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Gangajal, Roli, Akshat, Belpatra, Dhoop..." />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    पूजन सामग्री / आवश्यक द्रव्य (हिन्दी)
                  </label>
                  <LinkTextarea rows={3} value={serviceForm.samagriHi} onChange={(v) => setServiceForm({ ...serviceForm, samagriHi: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="गंगाजल, रोली, अक्षत, बिल्वपत्र, धूप, दीप..." />
                </div>
              </div>

              {/* Additional Links (#47) */}
              <LinksEditor
                links={serviceForm.additionalLinks}
                onChange={(additionalLinks) => setServiceForm({ ...serviceForm, additionalLinks })}
                label="Additional links (Hindi and English labels)"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="serviceActive"
                  checked={serviceForm.isActive}
                  onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="serviceActive" className="text-xs font-medium text-secondary">
                  {isHindi ? "सेवा सक्रिय रखें (Is Active)" : "Service is Active"}
                </label>
              </div>

              <div className="sticky bottom-0 z-10 bg-surface -mx-6 -mb-6 px-6 py-3 border-t border-outline-variant/40 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 border border-outline-variant rounded text-xs font-medium uppercase tracking-wider"
                >
                  {isHindi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[44px] px-6 py-2 bg-brand hover:bg-brand-hover text-on-brand rounded text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {loading ? (isHindi ? "सहेज रहे हैं..." : "Saving...") : isHindi ? "सहेजें" : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Package Form */}
      {packageModal && (
        <div className="fixed inset-0 z-[70] bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-surface rounded-lg border border-secondary/30 shadow-xl max-w-3xl w-full p-6 text-left max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <h2 className="font-serif text-lg font-bold text-secondary">
                {packageModal.editing ? (isHindi ? "पैकेज संपादित करें" : "Edit Package") : isHindi ? "नया पैकेज" : "Add Package"}
              </h2>
              <button type="button" onClick={() => setPackageModal(null)} className="p-1 text-on-surface-variant hover:text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePackage} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">Package name (English) *</label>
                  <input type="text" required value={packageForm.titleEn} onChange={(e) => setPackageForm({ ...packageForm, titleEn: e.target.value })} placeholder="e.g. Sadharan" className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[44px]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">पैकेज का नाम (हिन्दी) *</label>
                  <input type="text" required value={packageForm.titleHi} onChange={(e) => setPackageForm({ ...packageForm, titleHi: e.target.value })} placeholder="जैसे साधारण" className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[44px]" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">Details / Description (English)</label>
                  <textarea rows={4} value={packageForm.descriptionEn} onChange={(e) => setPackageForm({ ...packageForm, descriptionEn: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">विवरण (हिन्दी)</label>
                  <textarea rows={4} value={packageForm.descriptionHi} onChange={(e) => setPackageForm({ ...packageForm, descriptionHi: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs" />
                </div>
              </div>
              {/* Days, dates and seats */}
              <div className="rounded-lg border border-outline-variant/50 bg-surface-container-low p-3 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  {isHindi ? "दिन, तारीख और उपलब्धता" : "Days, dates and availability"}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-secondary mb-1">Number of days</label>
                    <input type="number" min={1} value={packageForm.numberOfDays} onChange={(e) => setPackageForm({ ...packageForm, numberOfDays: e.target.value })} className="w-full bg-surface border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[44px]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-secondary mb-1">Start date</label>
                    <input type="date" value={packageForm.startDate} onChange={(e) => setPackageForm({ ...packageForm, startDate: e.target.value })} className="w-full bg-surface border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[44px]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-secondary mb-1">End date</label>
                    <input type="date" value={packageForm.endDate} onChange={(e) => setPackageForm({ ...packageForm, endDate: e.target.value })} className="w-full bg-surface border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[44px]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-secondary mb-1">Seats (empty = no limit)</label>
                    <input type="number" min={1} value={packageForm.seats} onChange={(e) => setPackageForm({ ...packageForm, seats: e.target.value })} className="w-full bg-surface border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[44px]" />
                  </div>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  {isHindi
                    ? "बुकिंग तब तक खुली रहती है जब तक आरंभ तिथि नहीं आती और सीटें बची हैं। समाप्ति तिथि के बाद पैकेज बंद हो जाता है। असफल या समाप्त ऑर्डर सीट नहीं रोकते।"
                    : "Booking stays open until the start date passes and while seats remain. The package closes after its end date. Failed, expired or refunded orders do not hold a seat."}
                </p>
              </div>

              {/* Day by day itinerary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">
                    {isHindi ? "दिन-वार कार्यक्रम (Itinerary)" : "Day by day itinerary"}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPackageForm({ ...packageForm, itineraryDays: [...packageForm.itineraryDays, emptyDay()] })}
                    className="min-h-[36px] px-3 py-1 text-xs bg-brand hover:bg-brand-hover text-on-brand font-semibold rounded flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isHindi ? "दिन जोड़ें" : "Add day"}
                  </button>
                </div>
                {packageForm.itineraryDays.map((d, i) => (
                  <div key={i} className="rounded border border-outline-variant/60 p-3 space-y-2 bg-surface">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-secondary">{isHindi ? `दिन ${i + 1}` : `Day ${i + 1}`}</span>
                      <button
                        type="button"
                        onClick={() => setPackageForm({ ...packageForm, itineraryDays: packageForm.itineraryDays.filter((_, k) => k !== i) })}
                        className="text-on-error-container hover:underline text-xs"
                      >
                        {isHindi ? "हटाएँ" : "Remove"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="text" placeholder="Title (English)" value={d.titleEn} onChange={(e) => setPackageForm({ ...packageForm, itineraryDays: packageForm.itineraryDays.map((x, k) => (k === i ? { ...x, titleEn: e.target.value } : x)) })} className="bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[40px]" />
                      <input type="text" placeholder="शीर्षक (हिन्दी)" value={d.titleHi} onChange={(e) => setPackageForm({ ...packageForm, itineraryDays: packageForm.itineraryDays.map((x, k) => (k === i ? { ...x, titleHi: e.target.value } : x)) })} className="bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[40px]" />
                      <textarea rows={3} placeholder="What happens this day (English)" value={d.detailsEn} onChange={(e) => setPackageForm({ ...packageForm, itineraryDays: packageForm.itineraryDays.map((x, k) => (k === i ? { ...x, detailsEn: e.target.value } : x)) })} className="bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs" />
                      <textarea rows={3} placeholder="इस दिन का कार्यक्रम (हिन्दी)" value={d.detailsHi} onChange={(e) => setPackageForm({ ...packageForm, itineraryDays: packageForm.itineraryDays.map((x, k) => (k === i ? { ...x, detailsHi: e.target.value } : x)) })} className="bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Inclusions, exclusions and materials: one item per line */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(
                  [
                    ["inclusionsEn", "Inclusions (English), one per line"],
                    ["inclusionsHi", "सम्मिलित (हिन्दी), हर पंक्ति में एक"],
                    ["exclusionsEn", "Exclusions (English), one per line"],
                    ["exclusionsHi", "सम्मिलित नहीं (हिन्दी), हर पंक्ति में एक"],
                    ["materialsEn", "Material list (English), one per line"],
                    ["materialsHi", "सामग्री सूची (हिन्दी), हर पंक्ति में एक"],
                  ] as const
                ).map(([key, lab]) => (
                  <div key={key}>
                    <label className="block text-xs font-bold uppercase text-secondary mb-1">{lab}</label>
                    <textarea rows={4} value={packageForm[key]} onChange={(e) => setPackageForm({ ...packageForm, [key]: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs" />
                  </div>
                ))}
              </div>

              {/* Image, video and links */}
              <ImageUrlField
                label="Package image"
                value={packageForm.imageUrl}
                onChange={(url) => setPackageForm({ ...packageForm, imageUrl: url })}
                folder="services"
              />
              <YouTubeUrlField value={packageForm.youtubeUrl} onChange={(v) => setPackageForm({ ...packageForm, youtubeUrl: v })} />
              <LinksEditor
                links={packageForm.additionalLinks}
                onChange={(additionalLinks) => setPackageForm({ ...packageForm, additionalLinks })}
                label="Additional links (Hindi and English labels)"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">Slug (URL key, auto if empty)</label>
                  <input type="text" value={packageForm.slug} onChange={(e) => setPackageForm({ ...packageForm, slug: e.target.value })} placeholder="auto from the English name" className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[44px]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">Order</label>
                  <input type="number" min={0} value={packageForm.orderIndex} onChange={(e) => setPackageForm({ ...packageForm, orderIndex: Number(e.target.value) })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[44px]" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-secondary">
                <input type="checkbox" checked={packageForm.isActive} onChange={(e) => setPackageForm({ ...packageForm, isActive: e.target.checked })} className="w-4 h-4 rounded" />
                {isHindi ? "पैकेज सक्रिय रखें" : "Package is active (visible to customers)"}
              </label>
              <div className="flex items-center gap-2 pt-2">
                <button type="submit" disabled={loading} className="min-h-[44px] px-5 bg-brand hover:bg-brand-hover text-on-brand text-xs font-bold uppercase tracking-wider rounded disabled:opacity-60">
                  {loading ? "…" : isHindi ? "सहेजें" : "Save package"}
                </button>
                <button type="button" onClick={() => setPackageModal(null)} className="min-h-[44px] px-4 border border-outline-variant text-xs font-bold uppercase tracking-wider rounded text-on-surface-variant">
                  {isHindi ? "रद्द करें" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Plan Form */}
      {planModalOpen && (
        <div className="fixed inset-0 z-[70] bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-surface rounded-lg border border-secondary/30 shadow-xl max-w-2xl w-full p-6 text-left max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <h2 className="font-serif text-lg font-bold text-secondary">
                {editingPlan
                  ? isHindi
                    ? "संस्करण संपादित करें"
                    : "Edit Plan"
                  : isHindi
                  ? "नया संस्करण जोड़ें"
                  : "Add New Plan Tier"}
              </h2>
              <button
                type="button"
                onClick={() => setPlanModalOpen(false)}
                className="p-1 text-on-surface-variant hover:text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-secondary mb-1">
                  {isHindi ? "पैकेज *" : "Package *"}
                </label>
                <select
                  value={planForm.packageId}
                  onChange={(e) => setPlanForm({ ...planForm, packageId: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[44px]"
                >
                  <option value="">{isHindi ? "— पैकेज चुनें —" : "— Choose a package —"}</option>
                  {(services.find((sv) => sv.id === selectedServiceForPlan)?.packages ?? []).map((pk) => (
                    <option key={pk.id} value={pk.id}>{isHindi ? pk.titleHi : pk.titleEn}</option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-on-surface-variant">
                  {isHindi ? "पैकेज न दिखे तो पहले सेवा में 'पैकेज जोड़ें' दबाएँ।" : "If no package is listed, first use 'Add Package' on the service."}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Slug (URL Key) *
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.slug}
                    onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })}
                    placeholder="e.g. samanya, vishesh, rajasi"
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Order Index (क्रम)
                  </label>
                  <input
                    type="number"
                    value={planForm.orderIndex}
                    onChange={(e) => setPlanForm({ ...planForm, orderIndex: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Plan Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.titleEn}
                    onChange={(e) => setPlanForm({ ...planForm, titleEn: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    संस्करण शीर्षक (हिन्दी) *
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.titleHi}
                    onChange={(e) => setPlanForm({ ...planForm, titleHi: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              {/* Price fields (Entered in Rupees, converted to paise at boundary) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-container-low p-3 rounded border border-outline-variant/40">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    दक्षिणा दर (₹ Rupees) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={planForm.priceRupees}
                    onChange={(e) => setPlanForm({ ...planForm, priceRupees: Number(e.target.value) })}
                    placeholder="e.g. 1100"
                    className="w-full bg-surface border border-outline-variant/80 rounded px-3 py-2 text-xs font-bold text-secondary focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                  <span className="text-[10px] text-on-surface-variant">
                    = {(Number(planForm.priceRupees) * 100).toLocaleString()} paise
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Original Price (₹ Cut-off)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={planForm.originalPriceRupees}
                    onChange={(e) => setPlanForm({ ...planForm, originalPriceRupees: e.target.value })}
                    placeholder="e.g. 1500"
                    className="w-full bg-surface border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Delivery Days (दिन) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={planForm.deliveryDays}
                    onChange={(e) => setPlanForm({ ...planForm, deliveryDays: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Pages (कुल पृष्ठ)
                  </label>
                  <input
                    type="number"
                    value={planForm.pages}
                    onChange={(e) => setPlanForm({ ...planForm, pages: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Call Duration (मिनट)
                  </label>
                  <input
                    type="number"
                    value={planForm.callDurationMinutes}
                    onChange={(e) => setPlanForm({ ...planForm, callDurationMinutes: e.target.value, hasCall: Number(e.target.value) > 0 })}
                    placeholder="e.g. 30"
                    className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Features (English, one per line)
                  </label>
                  <LinkTextarea rows={3} value={planForm.featuresEnText} onChange={(v) => setPlanForm({ ...planForm, featuresEnText: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="18-Page PDF&#10;D1 + D9 Charts" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    विशेषताएँ (हिन्दी, प्रति पंक्ति एक)
                  </label>
                  <LinkTextarea rows={3} value={planForm.featuresHiText} onChange={(v) => setPlanForm({ ...planForm, featuresHiText: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="१८ पृष्ठ PDF&#10;D1 + D9 चक्र" />
                </div>
              </div>

              {/* Plan Program Details (#12) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Program / Ritual Details (English)
                  </label>
                  <LinkTextarea rows={2} value={planForm.programEn} onChange={(v) => setPlanForm({ ...planForm, programEn: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Detailed order of rituals, mantra japa count..." />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    अनुष्ठान / कार्यक्रम विवरण (हिन्दी)
                  </label>
                  <LinkTextarea rows={2} value={planForm.programHi} onChange={(v) => setPlanForm({ ...planForm, programHi: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="अनुष्ठान प्रक्रिया, मंत्र जप संख्या, आहुति विधान..." />
                </div>
              </div>

              {/* Plan Preparation Instructions (#12) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Preparation Instructions for Devotee (English)
                  </label>
                  <LinkTextarea rows={2} value={planForm.preparationEn} onChange={(v) => setPlanForm({ ...planForm, preparationEn: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Fasting guidelines, dress code, purity rules..." />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    यजमान हेतु पूर्व तैयारी निर्देश (हिन्दी)
                  </label>
                  <LinkTextarea rows={2} value={planForm.preparationHi} onChange={(v) => setPlanForm({ ...planForm, preparationHi: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="व्रत नियम, शुद्ध वस्त्र, शुचिता विधान..." />
                </div>
              </div>

              {/* Plan-specific Samagri (#12) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Tier Samagri (English)
                  </label>
                  <LinkTextarea rows={2} value={planForm.samagriEn} onChange={(v) => setPlanForm({ ...planForm, samagriEn: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Tier-specific samagri kit included..." />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    संस्करण पूजन सामग्री (हिन्दी)
                  </label>
                  <LinkTextarea rows={2} value={planForm.samagriHi} onChange={(v) => setPlanForm({ ...planForm, samagriHi: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="इस संस्करण में सम्मिलित विशेष पूजन सामग्री..." />
                </div>
              </div>

              {/* Plan-specific Itinerary (#12) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Tier Schedule / Timeline (English)
                  </label>
                  <LinkTextarea rows={2} value={planForm.itineraryEn} onChange={(v) => setPlanForm({ ...planForm, itineraryEn: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Specific delivery timeline or ritual schedule..." />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    संस्करण समय-सारणी (हिन्दी)
                  </label>
                  <LinkTextarea rows={2} value={planForm.itineraryHi} onChange={(v) => setPlanForm({ ...planForm, itineraryHi: v })} className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="इस संस्करण की विशेष समय-सारणी..." />
                </div>
              </div>

              <ImageUrlField
                label="Plan image (optional)"
                value={planForm.imageUrl}
                onChange={(imageUrl) => setPlanForm({ ...planForm, imageUrl })}
              />
              <YouTubeUrlField
                value={planForm.youtubeUrl}
                onChange={(youtubeUrl) => setPlanForm({ ...planForm, youtubeUrl })}
              />
              <LinksEditor
                links={planForm.additionalLinks}
                onChange={(additionalLinks) => setPlanForm({ ...planForm, additionalLinks })}
                label="Additional links for this plan"
              />

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="planPopular"
                    checked={planForm.isPopular}
                    onChange={(e) => setPlanForm({ ...planForm, isPopular: e.target.checked })}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="planPopular" className="text-xs font-medium text-secondary">
                    {isHindi ? "सर्वाधिक लोकप्रिय (Most Popular)" : "Mark as Popular Tier"}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="planActive"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="planActive" className="text-xs font-medium text-secondary">
                    {isHindi ? "सक्रिय रखें (Is Active)" : "Plan is Active"}
                  </label>
                </div>
              </div>

              <div className="sticky bottom-0 z-10 bg-surface -mx-6 -mb-6 px-6 py-3 border-t border-outline-variant/40 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 border border-outline-variant rounded text-xs font-medium uppercase tracking-wider"
                >
                  {isHindi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[44px] px-6 py-2 bg-brand hover:bg-brand-hover text-on-brand rounded text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {loading ? (isHindi ? "सहेज रहे हैं..." : "Saving...") : isHindi ? "सहेजें" : "Save Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
