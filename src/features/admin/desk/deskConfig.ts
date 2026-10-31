import type { DeskKind } from "@/lib/admin/desks";

export interface Option {
  value: string;
  en: string;
  hi: string;
}

export interface DeskField {
  key: string;
  en: string;
  hi: string;
  type: "text" | "tel" | "textarea" | "number" | "date" | "select" | "checkbox";
  required?: boolean;
  options?: Option[];
  /** Options come from the list of vehicles passed to the manager */
  fromVehicles?: boolean;
  /** Show this field as a line on the card */
  show?: boolean;
  defaultValue?: string | number | boolean;
}

export interface DeskConfig {
  titleKey: string;
  addEn: string;
  addHi: string;
  /** The field changed by the quick select on every card, and used for the filter tabs */
  statusKey?: string;
  /** One-tap buttons on a card, each sets some fields */
  quick?: Array<{ en: string; hi: string; patch: Record<string, unknown>; when?: { key: string; is: string } }>;
  fields: DeskField[];
}

const STATUS = {
  matrimony: [
    { value: "PENDING", en: "Waiting for approval", hi: "स्वीकृति शेष" },
    { value: "APPROVED", en: "Approved", hi: "स्वीकृत" },
    { value: "REJECTED", en: "Rejected", hi: "अस्वीकृत" },
  ],
  travel: [
    { value: "NEW", en: "New", hi: "नया" },
    { value: "CONFIRMED", en: "Confirmed", hi: "पक्का" },
    { value: "ONGOING", en: "On the trip", hi: "यात्रा जारी" },
    { value: "COMPLETED", en: "Completed", hi: "पूर्ण" },
    { value: "CANCELLED", en: "Cancelled", hi: "रद्द" },
  ],
  tax: [
    { value: "RECEIVED", en: "Documents received", hi: "दस्तावेज़ मिले" },
    { value: "IN_PROGRESS", en: "In progress", hi: "कार्य जारी" },
    { value: "FILED", en: "Filed", hi: "दाखिल" },
    { value: "ACKNOWLEDGED", en: "Acknowledged", hi: "पावती मिली" },
  ],
} satisfies Record<string, Option[]>;

export const DESK_CONFIG: Record<DeskKind, DeskConfig> = {
  matrimony: {
    titleKey: "name",
    addEn: "Add profile",
    addHi: "प्रोफ़ाइल जोड़ें",
    statusKey: "status",
    quick: [
      { en: "Approve", hi: "स्वीकृत करें", patch: { status: "APPROVED" }, when: { key: "status", is: "PENDING" } },
      { en: "Reject", hi: "अस्वीकृत करें", patch: { status: "REJECTED" }, when: { key: "status", is: "PENDING" } },
    ],
    fields: [
      { key: "name", en: "Name", hi: "नाम", type: "text", required: true },
      { key: "phone", en: "Phone", hi: "फ़ोन", type: "tel", required: true, show: true },
      {
        key: "gender", en: "Gender", hi: "लिंग", type: "select", required: true, show: true, defaultValue: "FEMALE",
        options: [{ value: "FEMALE", en: "Female", hi: "महिला" }, { value: "MALE", en: "Male", hi: "पुरुष" }],
      },
      { key: "dob", en: "Date of birth", hi: "जन्म तिथि", type: "date", show: true },
      { key: "city", en: "City", hi: "शहर", type: "text", show: true },
      { key: "about", en: "About the person", hi: "परिचय", type: "textarea", show: true },
      { key: "status", en: "Approval", hi: "स्वीकृति", type: "select", required: true, options: STATUS.matrimony, defaultValue: "PENDING" },
      { key: "isPaidMember", en: "Paid member", hi: "सशुल्क सदस्य", type: "checkbox", show: true },
      { key: "paidUntil", en: "Membership valid until", hi: "सदस्यता कब तक", type: "date", show: true },
      { key: "notes", en: "Private notes", hi: "निजी टिप्पणी", type: "textarea" },
    ],
  },
  travel: {
    titleKey: "name",
    addEn: "Add travel request",
    addHi: "यात्रा अनुरोध जोड़ें",
    statusKey: "status",
    fields: [
      { key: "name", en: "Name", hi: "नाम", type: "text", required: true },
      { key: "phone", en: "Phone", hi: "फ़ोन", type: "tel", required: true, show: true },
      { key: "destination", en: "Destination", hi: "गंतव्य", type: "text", required: true, show: true },
      { key: "travelDate", en: "Travel date", hi: "यात्रा तिथि", type: "date", show: true },
      { key: "passengers", en: "Passengers", hi: "यात्री", type: "number", required: true, show: true, defaultValue: 1 },
      { key: "vehicleId", en: "Vehicle", hi: "वाहन", type: "select", fromVehicles: true, show: true },
      { key: "status", en: "Booking status", hi: "बुकिंग स्थिति", type: "select", required: true, options: STATUS.travel, defaultValue: "NEW" },
      { key: "notes", en: "Notes", hi: "टिप्पणी", type: "textarea", show: true },
    ],
  },
  vehicles: {
    titleKey: "name",
    addEn: "Add vehicle",
    addHi: "वाहन जोड़ें",
    fields: [
      { key: "name", en: "Vehicle", hi: "वाहन", type: "text", required: true },
      { key: "number", en: "Registration number", hi: "पंजीकरण संख्या", type: "text", required: true, show: true },
      { key: "seats", en: "Seats", hi: "सीटें", type: "number", required: true, show: true, defaultValue: 4 },
      { key: "driverName", en: "Driver", hi: "चालक", type: "text", show: true },
      { key: "driverPhone", en: "Driver phone", hi: "चालक फ़ोन", type: "tel", show: true },
      { key: "isAvailable", en: "Available", hi: "उपलब्ध", type: "checkbox", show: true, defaultValue: true },
    ],
  },
  tax: {
    titleKey: "clientName",
    addEn: "Add tax file",
    addHi: "कर फ़ाइल जोड़ें",
    statusKey: "filingStatus",
    fields: [
      { key: "clientName", en: "Client name", hi: "ग्राहक का नाम", type: "text", required: true },
      { key: "phone", en: "Phone", hi: "फ़ोन", type: "tel", required: true, show: true },
      { key: "assessmentYear", en: "Assessment year (like 2025-26)", hi: "निर्धारण वर्ष (जैसे 2025-26)", type: "text", required: true, show: true },
      { key: "docType", en: "Documents submitted", hi: "जमा दस्तावेज़", type: "text", required: true, show: true },
      { key: "documentUrl", en: "Link to the documents", hi: "दस्तावेज़ का लिंक", type: "text", show: true },
      { key: "filingStatus", en: "Filing status", hi: "फ़ाइलिंग स्थिति", type: "select", required: true, options: STATUS.tax, defaultValue: "RECEIVED" },
      { key: "ackNumber", en: "Acknowledgement number", hi: "पावती संख्या", type: "text", show: true },
      { key: "notes", en: "Notes", hi: "टिप्पणी", type: "textarea", show: true },
    ],
  },
};
