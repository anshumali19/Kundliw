"use client";

import { LinkTextarea } from "@/components/admin/LinkTextarea";
import { useState } from "react";
import { formatPaiseToInr } from "@/lib/billing/gst";
import { paiseToRupees } from "@/lib/billing/money";
import { LinkItem, normalizeLinks } from "@/lib/content/media";
import { ImageUrlField, LinksEditor, VideoField } from "@/components/admin/MediaFields";
import { InfoTip } from "@/components/admin/InfoTip";
import { Link } from "@/i18n/routing";
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

export interface AdminOfferRef {
  id: string;
  code: string;
  titleEn: string;
  titleHi: string;
  serviceSlugs: string[];
  planIds: string[];
  isActive: boolean;
}

export type CatalogueView = "services" | "packages" | "plans";

interface AdminServicesManagerProps {
  initialServices: AdminServiceItem[];
  offers?: AdminOfferRef[];
  view?: CatalogueView;
  locale: string;
}

export function AdminServicesManager({
  initialServices,
  offers = [],
  view = "services",
  locale,
}: AdminServicesManagerProps) {
  const isHindi = locale === "hi";
  const [services, setServices] = useState<AdminServiceItem[]>(initialServices);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(
    services[0]?.id || null
  );

  // Packages and Plans pages: the admin picks the parent first (Service, then Package) before adding a child
  const [pickedServiceId, setPickedServiceId] = useState<string>(initialServices[0]?.id ?? "");
  const [pickedPackageId, setPickedPackageId] = useState<string>("");
  const pickedService = services.find((sv) => sv.id === pickedServiceId) ?? services[0];
  const pickedPackage = pickedService?.packages.find((pk) => pk.id === pickedPackageId) ?? pickedService?.packages[0];

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
  const handleOpenPlanModal = (serviceId: string, plan?: AdminPlanItem, presetPackageId?: string) => {
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
        packageId: presetPackageId ?? "",
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
    const pkgOwner = services.find((sv) => sv.packages.some((pk) => pk.id === planForm.packageId));
    const planServiceId = pkgOwner?.id ?? selectedServiceForPlan;
    if (!planServiceId) {
      setErrorMsg(isHindi ? "पहले पैकेज चुनें।" : "Choose a package first.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        serviceId: planServiceId,
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

      // the plan may have moved to a package under another service, so take it out everywhere first
      setServices((prev) =>
        prev.map((s) => {
          const others = s.plans.filter((p) => p.id !== data.plan.id);
          return s.id === planServiceId ? { ...s, plans: [...others, data.plan] } : { ...s, plans: others };
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

  /** Puts a saved package under its service; when it moved, takes it (and its plans) out of the old one. */
  const applySavedPackage = (saved: AdminPackageItem, toServiceId: string) => {
    setServices((prev) => {
      const plansOf = prev.flatMap((s) => s.plans.filter((p) => p.packageId === saved.id));
      return prev.map((s) => {
        const pkgs = s.packages.filter((p) => p.id !== saved.id);
        const plans = s.plans.filter((p) => p.packageId !== saved.id);
        if (s.id !== toServiceId) return { ...s, packages: pkgs, plans };
        return { ...s, packages: [...pkgs, saved].sort((a, b) => a.orderIndex - b.orderIndex), plans: [...plans, ...plansOf] };
      });
    });
  };

  /** Quick re-assign: move a package (with all its plans) to another service. */
  const handleMovePackage = async (pkg: AdminPackageItem, toServiceId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moveOnly: true, serviceId: toServiceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not move the package");
      applySavedPackage({ ...data.package, booked: pkg.booked ?? 0 }, toServiceId);
      setSuccessMsg(isHindi ? "पैकेज दूसरी सेवा में ले जाया गया।" : "Package moved to the other service, with its plans.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not move the package");
    }
  };

  /** Quick re-assign: put a plan under a different package (and so a different service). */
  const handleMovePlan = async (plan: AdminPlanItem, toPackageId: string) => {
    const owner = services.find((sv) => sv.packages.some((pk) => pk.id === toPackageId));
    if (!owner) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: owner.id, packageId: toPackageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not move the plan");
      setServices((prev) =>
        prev.map((s) => {
          const others = s.plans.filter((p) => p.id !== plan.id);
          return s.id === owner.id ? { ...s, plans: [...others, { ...plan, ...data.plan }] } : { ...s, plans: others };
        })
      );
      setSuccessMsg(isHindi ? "प्लान दूसरे पैकेज में ले जाया गया।" : "Plan moved to the other package.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not move the plan");
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageModal) return;
    if (!packageModal.serviceId) {
      setErrorMsg(isHindi ? "पहले सेवा चुनें।" : "Choose the service this package belongs to.");
      return;
    }
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
      applySavedPackage({ ...data.package, booked: editing?.booked ?? 0 }, packageModal.serviceId);
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
            {view === "services" ? (isHindi ? "1. सेवाएँ" : "1. Services") : view === "packages" ? (isHindi ? "2. पैकेज" : "2. Packages") : isHindi ? "3. प्लान" : "3. Plans"}{" "}
            <InfoTip
              text={
                view === "services"
                  ? isHindi
                    ? "यहाँ केवल सेवाओं की सूची है। किसी सेवा पर क्लिक करके उसका विवरण देखें, और 'संपादित करें' से नाम, चित्र, वीडियो (YouTube), विवरण या लिंक बदलें। सेवाओं की कोई सीमा नहीं।"
                    : "Only the list of services is here. Click a service to open it, and use Edit to change its name, picture, video (YouTube), description or links. There is no limit on services."
                  : view === "packages"
                  ? isHindi
                    ? "पैकेज सेवा का एक रूप है (जैसे साधारण, मध्यम, उत्तम)। हर सेवा के नीचे उसके पैकेज दिखते हैं। 'सेवा' वाले ड्रॉपडाउन से पैकेज को किसी भी सेवा में ले जाएँ; उसके प्लान साथ जाते हैं। पैकेज की कोई सीमा नहीं।"
                    : "A package is a version of a service (for example Sadharan, Madhyam, Uttam). Each service lists its packages. Use the Service dropdown to move a package into any service; its plans go with it. There is no limit on packages."
                  : isHindi
                  ? "प्लान वह है जिसे ग्राहक खरीदता है: कीमत, डिलीवरी और क्या शामिल है। हर प्लान एक पैकेज में रहता है। 'पैकेज' ड्रॉपडाउन से उसे दूसरे पैकेज में ले जाएँ। प्लान की कोई सीमा नहीं; ऑफ़र अगले चरण में जुड़ते हैं।"
                  : "A plan is what the customer buys: price, delivery and what is included. Each plan sits in one package. Use the Package dropdown to move it to another package. There is no limit on plans; offers are attached in the next step."
              }
            />
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            {view === "services"
              ? isHindi ? "सेवाएँ जोड़ें और बदलें। अगला चरण: पैकेज।" : "Add and edit your services. Next step: Packages."
              : view === "packages"
              ? isHindi ? "हर सेवा के पैकेज जोड़ें और बदलें। अगला चरण: प्लान।" : "Add and edit the packages of each service. Next step: Plans."
              : isHindi ? "हर पैकेज के प्लान और कीमतें जोड़ें (रुपये में लिखें)। अगला चरण: ऑफ़र।" : "Add the plans and prices of each package (type rupees). Next step: Offers."}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            view === "packages"
              ? handleOpenPackageModal(pickedService?.id ?? "")
              : view === "plans"
              ? handleOpenPlanModal(pickedService?.id ?? "", undefined, pickedPackage?.id)
              : handleOpenServiceModal()
          }
          disabled={(view === "packages" && !pickedService) || (view === "plans" && !pickedPackage)}
          className="min-h-[44px] px-4 py-2 bg-brand hover:bg-brand-hover text-on-brand font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>
            {view === "packages" ? (isHindi ? "नया पैकेज जोड़ें" : "Add Package") : view === "plans" ? (isHindi ? "नया प्लान जोड़ें" : "Add Plan") : isHindi ? "नई सेवा जोड़ें" : "Add Service"}
          </span>
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

      {(view === "packages" || view === "plans") && services.length > 0 && (
        <div className="rounded-lg border border-gold/60 bg-gold/15 p-4 space-y-3">
          <div className="text-xs font-bold text-secondary">
            {view === "packages"
              ? isHindi ? "पहले सूची से एक सेवा चुनें, फिर उसका पैकेज जोड़ें।" : "First select one service from the list, then add its package."
              : isHindi ? "पहले सेवा चुनें, फिर उसका पैकेज चुनें, फिर प्लान जोड़ें।" : "First select the service, then select its package, then add the plan."}{" "}
            <InfoTip text={isHindi ? "एक सेवा में कई पैकेज और एक पैकेज में कई प्लान हो सकते हैं। नीचे चुनी हुई सेवा (और पैकेज) की ही सूची दिखती है।" : "A service can have many packages and a package can have many plans. The list below shows only the service (and package) you select."} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block text-[11px] font-bold uppercase text-secondary">
              {isHindi ? "1. सेवा" : "1. Service"}
              <select
                value={pickedService?.id ?? ""}
                onChange={(e) => {
                  setPickedServiceId(e.target.value);
                  setPickedPackageId("");
                }}
                className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[44px] mt-1 font-normal normal-case"
              >
                {services.map((sv) => (
                  <option key={sv.id} value={sv.id}>{isHindi ? sv.titleHi : sv.titleEn}</option>
                ))}
              </select>
            </label>
            {view === "plans" && (
              <label className="block text-[11px] font-bold uppercase text-secondary">
                {isHindi ? "2. पैकेज" : "2. Package"}
                <select
                  value={pickedPackage?.id ?? ""}
                  onChange={(e) => setPickedPackageId(e.target.value)}
                  disabled={!pickedService || pickedService.packages.length === 0}
                  className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[44px] mt-1 font-normal normal-case"
                >
                  {(pickedService?.packages ?? []).length === 0 && <option value="">{isHindi ? "इस सेवा में कोई पैकेज नहीं" : "No packages in this service"}</option>}
                  {(pickedService?.packages ?? []).map((pk) => (
                    <option key={pk.id} value={pk.id}>{isHindi ? pk.titleHi : pk.titleEn}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>
      )}

      {/* One list per step: Services, Packages or Plans (the step bar above switches between them) */}
      {view === "services" && (
        <div className="space-y-3">
          {services.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-low rounded border border-outline-variant/50 text-on-surface-variant text-sm">
              {isHindi ? "कोई सेवा नहीं है। 'नई सेवा जोड़ें' दबाएँ।" : "No services yet. Press 'Add Service' to create the first one."}
            </div>
          ) : (
            services.map((service) => {
              const isExpanded = expandedServiceId === service.id;
              return (
                <div key={service.id} className="rounded-lg border border-outline-variant/60 bg-surface overflow-hidden shadow-sm">
                  <div
                    onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                    className="p-4 bg-surface-container-low/70 hover:bg-surface-container-low flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="p-1 text-secondary" aria-hidden="true">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif font-bold text-base text-secondary">{isHindi ? service.titleHi : service.titleEn}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${service.isActive ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-surface-container-high text-outline"}`}>
                            {service.isActive ? (isHindi ? "सक्रिय" : "Active") : isHindi ? "निष्क्रिय" : "Inactive"}
                          </span>
                        </div>
                        <div className="text-xs text-on-surface-variant mt-0.5">
                          {service.packages.length} {isHindi ? "पैकेज" : "packages"} • {service.plans.length} {isHindi ? "प्लान" : "plans"} • {service._count?.orders ?? 0} {isHindi ? "ऑर्डर" : "orders"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 lg:shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => handleToggleServiceActive(service)} className="min-h-[38px] px-2.5 py-1 text-xs border border-outline-variant rounded hover:bg-surface transition-colors">
                        {service.isActive ? (isHindi ? "अक्षम करें" : "Deactivate") : isHindi ? "सक्रिय करें" : "Activate"}
                      </button>
                      <button type="button" onClick={() => handleOpenServiceModal(service)} className="min-h-[38px] px-2.5 py-1 text-xs bg-surface border border-secondary text-secondary rounded hover:bg-brand-hover hover:text-on-brand transition-colors flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isHindi ? "संपादित करें" : "Edit"}</span>
                      </button>
                      <button type="button" onClick={() => handleDeleteService(service)} className="min-h-[38px] px-2.5 py-1 text-xs bg-surface border border-error text-on-error-container rounded hover:bg-error-container transition-colors flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isHindi ? "हटाएँ" : "Remove"}</span>
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="p-4 border-t border-outline-variant/30 bg-surface space-y-3 text-sm">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {service.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={service.imageUrl} alt="" className="h-24 w-24 shrink-0 rounded-lg object-cover border border-outline-variant" />
                        ) : null}
                        <div className="min-w-0 space-y-1 text-xs text-on-surface-variant">
                          <p className="line-clamp-3 text-sm text-on-surface">{(isHindi ? service.descriptionHi : service.descriptionEn) || "—"}</p>
                          <p>/{service.slug}{service.youtubeUrl ? ` • ${isHindi ? "वीडियो जुड़ा है" : "video added"}` : ""}</p>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                          {isHindi ? "इस सेवा के पैकेज" : "Packages in this service"}
                        </div>
                        {service.packages.length === 0 ? (
                          <p className="text-xs text-on-surface-variant">{isHindi ? "अभी कोई पैकेज नहीं।" : "No packages yet."}</p>
                        ) : (
                          <ul className="flex flex-wrap gap-2">
                            {service.packages.map((pk) => (
                              <li key={pk.id} className="rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-xs text-secondary">
                                {isHindi ? pk.titleHi : pk.titleEn} <span className="text-on-surface-variant">({service.plans.filter((p) => p.packageId === pk.id).length} {isHindi ? "प्लान" : "plans"})</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <Link href="/admin/packages" className="mt-2 inline-block text-xs font-bold text-primary hover:underline">
                          {isHindi ? "पैकेज जोड़ें या बदलें →" : "Add or change packages →"}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {view === "packages" && (
        <div className="space-y-5">
          {services.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-low rounded border border-outline-variant/50 text-on-surface-variant text-sm">
              {isHindi ? "पहले 'सेवाएँ' पेज पर एक सेवा बनाएँ।" : "Create a service first on the Services page."}
            </div>
          ) : (
            services.filter((sv) => sv.id === pickedService?.id).map((service) => (
              <section key={service.id} className="rounded-lg border border-outline-variant/60 bg-surface overflow-hidden">
                <header className="flex items-center justify-between gap-2 bg-surface-container-low px-4 py-3">
                  <h2 className="font-serif text-base font-bold text-secondary">{isHindi ? service.titleHi : service.titleEn}</h2>
                  <button type="button" onClick={() => handleOpenPackageModal(service.id)} className="min-h-[36px] px-3 py-1 text-xs bg-brand hover:bg-brand-hover text-on-brand font-semibold rounded flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isHindi ? "पैकेज जोड़ें" : "Add package here"}</span>
                  </button>
                </header>
                {service.packages.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-on-surface-variant">
                    {isHindi ? "इस सेवा में अभी कोई पैकेज नहीं।" : "No packages under this service yet."}
                  </p>
                ) : (
                  <ul className="divide-y divide-outline-variant/40">
                    {service.packages.map((pkg) => (
                      <li key={pkg.id} className={`px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${pkg.isActive ? "" : "opacity-60"}`}>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-secondary">{isHindi ? pkg.titleHi : pkg.titleEn}</div>
                          <div className="text-[11px] text-on-surface-variant">
                            {service.plans.filter((p) => p.packageId === pkg.id).length} {isHindi ? "प्लान" : "plan(s)"}
                            {pkg.numberOfDays ? ` · ${pkg.numberOfDays} ${isHindi ? "दिन" : "days"}` : ""}
                            {pkg.startDate ? ` · ${pkg.startDate.slice(0, 10)}${pkg.endDate ? " → " + pkg.endDate.slice(0, 10) : ""}` : ""}
                            {pkg.seats ? ` · ${pkg.booked ?? 0}/${pkg.seats} ${isHindi ? "सीट भरीं" : "seats taken"}` : pkg.booked ? ` · ${pkg.booked} ${isHindi ? "बुकिंग" : "booked"}` : ""}
                            {!pkg.isActive ? (isHindi ? " · बंद" : " · switched off") : ""}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <label className="flex items-center gap-1 text-[11px] font-bold uppercase text-secondary">
                            {isHindi ? "सेवा" : "Service"}
                            <select
                              aria-label={isHindi ? "पैकेज किस सेवा में है" : "Service this package belongs to"}
                              value={service.id}
                              onChange={(e) => handleMovePackage(pkg, e.target.value)}
                              className="max-w-[180px] bg-surface-container-low border border-outline-variant/80 rounded px-2 py-1 text-xs font-normal normal-case min-h-[36px]"
                            >
                              {services.map((sv) => (
                                <option key={sv.id} value={sv.id}>{isHindi ? sv.titleHi : sv.titleEn}</option>
                              ))}
                            </select>
                          </label>
                          <button type="button" onClick={() => handleOpenPackageModal(service.id, pkg)} className="min-h-[36px] text-xs px-3 py-1 bg-surface border border-secondary text-secondary rounded hover:bg-brand-hover hover:text-on-brand">
                            {isHindi ? "संपादित करें" : "Edit"}
                          </button>
                          <button type="button" onClick={() => handleDeletePackage(service.id, pkg)} aria-label={isHindi ? "हटाएँ" : "Remove"} className="min-h-[36px] text-xs px-2 py-1 border border-error text-on-error-container rounded hover:bg-error-container">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))
          )}
        </div>
      )}

      {view === "plans" && (
        <div className="space-y-6">
          {services.every((s) => s.packages.length === 0) ? (
            <div className="p-8 text-center bg-surface-container-low rounded border border-outline-variant/50 text-on-surface-variant text-sm">
              {isHindi ? "प्लान जोड़ने से पहले 'पैकेज' पेज पर पैकेज बनाएँ।" : "Create a package on the Packages page before adding plans."}
            </div>
          ) : (
            services.filter((sv) => sv.id === pickedService?.id).flatMap((service) =>
              service.packages.filter((pk) => pk.id === pickedPackage?.id).map((pkg) => {
                const plans = service.plans.filter((p) => p.packageId === pkg.id).sort((a, b) => a.orderIndex - b.orderIndex);
                return (
                  <section key={pkg.id} className="rounded-lg border border-outline-variant/60 bg-surface overflow-hidden">
                    <header className="flex items-center justify-between gap-2 bg-surface-container-low px-4 py-3">
                      <h2 className="font-serif text-base font-bold text-secondary">
                        {isHindi ? service.titleHi : service.titleEn} <span className="text-primary">›</span> {isHindi ? pkg.titleHi : pkg.titleEn}
                      </h2>
                      <button type="button" onClick={() => handleOpenPlanModal(service.id, undefined, pkg.id)} className="min-h-[36px] px-3 py-1 text-xs bg-brand hover:bg-brand-hover text-on-brand font-semibold rounded flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isHindi ? "प्लान जोड़ें" : "Add plan here"}</span>
                      </button>
                    </header>
                    {plans.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-on-surface-variant">{isHindi ? "इस पैकेज में अभी कोई प्लान नहीं।" : "No plans in this package yet."}</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {plans.map((plan) => {
                          const linked = offers.filter((o) => o.isActive && (o.planIds.includes(plan.id) || (o.planIds.length === 0 && (o.serviceSlugs.length === 0 || o.serviceSlugs.includes(service.slug)))));
                          return (
                            <div key={plan.id} className={`p-4 rounded-lg border flex flex-col justify-between ${plan.isActive ? "border-outline-variant/60 bg-surface" : "border-outline-variant/30 bg-surface-container-low opacity-60"}`}>
                              <div>
                                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                                  <span className="text-xs font-serif font-bold text-secondary">{isHindi ? plan.titleHi : plan.titleEn}</span>
                                  {plan.isPopular && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand text-on-brand">{isHindi ? "लोकप्रिय" : "Popular"}</span>
                                  )}
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                  <span className="font-serif text-2xl font-bold text-secondary">{formatPaiseToInr(plan.pricePaise)}</span>
                                  {plan.originalPricePaise && <span className="text-xs line-through text-outline">{formatPaiseToInr(plan.originalPricePaise)}</span>}
                                </div>
                                <div className="mt-3 space-y-1.5 text-xs text-on-surface-variant">
                                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-secondary" /><span>{plan.deliveryDays} {isHindi ? "कार्यदिवस" : "days delivery"}</span></div>
                                  {plan.pages && <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-secondary" /><span>{plan.pages} {isHindi ? "पृष्ठ" : "Pages"}</span></div>}
                                  {plan.hasCall && <div className="flex items-center gap-1.5 text-primary font-medium"><PhoneCall className="w-3.5 h-3.5" /><span>{plan.callDurationMinutes} {isHindi ? "मिनट परामर्श" : "mins call"}</span></div>}
                                </div>
                                <div className="mt-3 text-[11px] text-on-surface-variant">
                                  <span className="font-bold uppercase tracking-wider text-primary">{isHindi ? "ऑफ़र:" : "Offers:"}</span>{" "}
                                  {linked.length === 0 ? (isHindi ? "कोई नहीं" : "none") : linked.map((o) => o.code).join(", ")}
                                </div>
                              </div>
                              <div className="mt-4 pt-3 border-t border-outline-variant/30 space-y-2">
                                <label className="flex items-center gap-1 text-[11px] font-bold uppercase text-secondary">
                                  {isHindi ? "पैकेज" : "Package"}
                                  <select
                                    aria-label={isHindi ? "प्लान किस पैकेज में है" : "Package this plan belongs to"}
                                    value={pkg.id}
                                    onChange={(e) => handleMovePlan(plan, e.target.value)}
                                    className="min-w-0 flex-1 bg-surface-container-low border border-outline-variant/80 rounded px-2 py-1 text-xs font-normal normal-case min-h-[36px]"
                                  >
                                    {services.map((sv) => (
                                      <optgroup key={sv.id} label={isHindi ? sv.titleHi : sv.titleEn}>
                                        {sv.packages.map((pk) => (
                                          <option key={pk.id} value={pk.id}>{isHindi ? pk.titleHi : pk.titleEn}</option>
                                        ))}
                                      </optgroup>
                                    ))}
                                  </select>
                                </label>
                                <div className="flex items-center justify-between gap-2">
                                  <button type="button" onClick={() => handleTogglePlanActive(service.id, plan)} className="min-h-[36px] text-xs px-2 py-1 border border-outline-variant rounded hover:bg-surface-container">
                                    {plan.isActive ? (isHindi ? "अक्षम करें" : "Deactivate") : isHindi ? "सक्रिय करें" : "Activate"}
                                  </button>
                                  <button type="button" onClick={() => handleOpenPlanModal(service.id, plan)} className="min-h-[36px] text-xs px-3 py-1 bg-surface border border-secondary text-secondary font-medium rounded hover:bg-brand-hover hover:text-on-brand transition-colors">
                                    {isHindi ? "संपादित करें" : "Edit Plan"}
                                  </button>
                                  <button type="button" onClick={() => handleDeletePlan(service.id, plan)} aria-label={isHindi ? "हटाएँ" : "Remove"} className="min-h-[36px] text-xs px-2 py-1 border border-error text-on-error-container rounded hover:bg-error-container flex items-center gap-1">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })
            )
          )}
        </div>
      )}

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

            <div className="mt-4 rounded-lg border border-gold/60 bg-gold/15 p-3 text-xs text-secondary leading-relaxed">
              <div className="font-bold mb-1">{isHindi ? "पैकेज और प्लान कहाँ जोड़ें" : "Where do packages and plans go?"}{" "}<InfoTip text={isHindi ? "क्रम हमेशा: 1 सेवा, 2 पैकेज, 3 प्लान, 4 ऑफ़र।" : "The order is always: 1 Service, 2 Package, 3 Plan, 4 Offer."} /></div>
              {isHindi
                ? "यह फ़ॉर्म केवल सेवा की जानकारी के लिए है। सेवा सहेजने के बाद 'पैकेज' पेज पर जाकर उसके पैकेज जोड़ें, फिर 'प्लान' पेज पर प्लान, और अंत में 'ऑफ़र' पेज पर ऑफ़र। सेवा, पैकेज, प्लान या ऑफ़र की कोई सीमा नहीं है।"
                : "This form is only for the service itself. Save it, then add its packages on the Packages page, plans on the Plans page and offers on the Offers page. There is no limit on how many services, packages, plans or offers you add."}
            </div>

            <form onSubmit={handleSaveService} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-1">
                    Slug (URL Key) * <InfoTip text={isHindi ? "वेबसाइट के पते में दिखने वाला छोटा नाम, अंग्रेज़ी अक्षरों और - में, जैसे kundli-basic। बाद में न बदलें।" : "The short name used in the web address, in English letters and dashes, like kundli-basic. Avoid changing it later."} />
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
                    Order Index (क्रम) <InfoTip text={isHindi ? "सूची में स्थान। छोटी संख्या पहले दिखती है।" : "Position in the list. A smaller number shows first."} />
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
              <p className="text-xs text-on-surface-variant">
                {isHindi ? "चित्र, वीडियो और लिंक" : "Picture, video and links"}{" "}
                <InfoTip text={isHindi ? "चित्र अपलोड करें या लिंक डालें; YouTube का लिंक चिपकाएँ तो वीडियो पेज पर दिखेगा; अतिरिक्त लिंक में कोई भी पेज जोड़ें।" : "Upload a picture or paste its link. A YouTube link shows as a video on the page. Extra links can point to any page."} />
              </p>
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

                <VideoField value={serviceForm.youtubeUrl} onChange={(v) => setServiceForm({ ...serviceForm, youtubeUrl: v })} />
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
              <div>
                <label className="block text-xs font-bold uppercase text-secondary mb-1">
                  {isHindi ? "किस सेवा के अंतर्गत *" : "Under which service *"}{" "}
                  <InfoTip text={isHindi ? "यह पैकेज जिस सेवा में दिखना चाहिए उसे चुनें। बाद में यहीं से बदलकर इसे (अपने प्लान सहित) दूसरी सेवा में ले जा सकते हैं।" : "Choose the service this package should appear in. You can change it later to move the package, with its plans, to another service."} />
                </label>
                <select
                  required
                  value={packageModal.serviceId}
                  onChange={(e) => setPackageModal({ ...packageModal, serviceId: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[44px]"
                >
                  <option value="">{isHindi ? "— सेवा चुनें —" : "— Choose a service —"}</option>
                  {services.map((sv) => (
                    <option key={sv.id} value={sv.id}>{isHindi ? sv.titleHi : sv.titleEn}</option>
                  ))}
                </select>
              </div>
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
                    <label className="block text-[11px] font-bold uppercase text-secondary mb-1">Seats (empty = no limit) <InfoTip text={isHindi ? "इस पैकेज में अधिकतम बुकिंग। भरने पर पैकेज अपने आप बंद हो जाता है। खाली छोड़ें तो कोई सीमा नहीं।" : "The most bookings this package takes. It closes by itself when full. Leave empty for no limit."} /></label>
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
              <VideoField value={packageForm.youtubeUrl} onChange={(v) => setPackageForm({ ...packageForm, youtubeUrl: v })} />
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
                  {isHindi ? "पैकेज *" : "Package *"}{" "}
                  <InfoTip text={isHindi ? "इस प्लान को किस पैकेज में दिखाना है, वह चुनें। सेवा अपने आप पैकेज से तय हो जाती है। बाद में प्लान को दूसरे पैकेज में भी ले जा सकते हैं।" : "Pick the package this plan belongs to. The service follows from the package. You can move the plan to another package later."} />
                </label>
                <select
                  value={planForm.packageId}
                  onChange={(e) => setPlanForm({ ...planForm, packageId: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/80 rounded px-3 py-2 text-xs min-h-[44px]"
                >
                  <option value="">{isHindi ? "— पैकेज चुनें —" : "— Choose a package —"}</option>
                  {services.map((sv) => (
                    <optgroup key={sv.id} label={isHindi ? sv.titleHi : sv.titleEn}>
                      {sv.packages.map((pk) => (
                        <option key={pk.id} value={pk.id}>{isHindi ? pk.titleHi : pk.titleEn}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-on-surface-variant">
                  {isHindi ? "पैकेज न दिखे तो पहले 'पैकेज' पेज पर पैकेज बनाएँ।" : "If the package you need is not listed, create it first on the Packages page."}
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
                    दक्षिणा दर (₹ Rupees) * <InfoTip text={isHindi ? "ग्राहक यही कीमत चुकाता है, रुपये में लिखें। कटी हुई पुरानी कीमत अलग खाने में डालें।" : "The price the customer pays, typed in rupees. Put a crossed-out old price in the next box if you want to show a saving."} />
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
              <VideoField
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
