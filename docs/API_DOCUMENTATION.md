# REST API Specification & Endpoint Reference

> **Maharshi Kanad Jyotish Kendra (महर्षि कणाद ज्योतिष केंद्र)**  
> Comprehensive API Documentation for Public, Customer, and Administrative Services

All API routes are served from the `/api` prefix. Standard response envelopes use JSON format.

---

## 1. Authentication & Security Headers

| Header | Description | Required |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` (or `multipart/form-data` for file uploads) | Yes for POST/PUT |
| `Cookie` | Session cookie containing NextAuth JWT (`next-auth.session-token`) | Yes for authenticated routes |
| `X-Forwarded-For` | Client IP address (evaluated when `TRUST_PROXY=true`) | Evaluated by Rate Limiter |

---

## 2. Public Astrological Endpoints

### 2.1 Calculate Janampatri (Kundli)
Calculates planetary longitudes, ascendant sign, nakshatras, and Vimshottari Mahadasha.

- **Route**: `POST /api/astro/kundli`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Arjun Sharma",
  "gender": "male",
  "dob": "1995-10-14",
  "tob": "06:30",
  "pob": "Varanasi, Uttar Pradesh",
  "latitude": 25.3176,
  "longitude": 82.9739,
  "timezone": 5.5
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "isDemo": true,
    "demoNoticeEn": "Sample output, not a real calculation",
    "demoNoticeHi": "नमूना परिणाम, वास्तविक गणना नहीं",
    "ascendant": "Libra (तुला)",
    "ascendantLord": "Venus (शुक्र)",
    "moonRashi": "Gemini (मिथुन)",
    "nakshatra": "Ardra (आर्द्रा)",
    "charan": 3,
    "planetaryPositions": [
      {
        "planet": "Sun (सूर्य)",
        "rashi": "Virgo (कन्या)",
        "degrees": 26.85,
        "isRetrograde": false,
        "house": 12
      }
    ],
    "vimshottariDasha": {
      "currentMahadasha": "Rahu (राहु)",
      "currentAntardasha": "Jupiter (गुरु)",
      "dashaEndDate": "2028-06-18"
    }
  }
}
```

---

### 2.2 Kundli Matching (36-Guna Ashtakoot Milapak)
Evaluates 8 pillars of Vedic compatibility between Bride and Groom.

- **Route**: `POST /api/astro/matching`
- **Access**: Public
- **Request Body**:
```json
{
  "boy": {
    "name": "Devendra",
    "dob": "1994-04-12",
    "tob": "08:15",
    "pob": "Varanasi",
    "latitude": 25.3176,
    "longitude": 82.9739
  },
  "girl": {
    "name": "Priyanka",
    "dob": "1996-09-22",
    "tob": "14:45",
    "pob": "Prayagraj",
    "latitude": 25.4358,
    "longitude": 81.8463
  }
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "isDemo": true,
    "totalScore": 28,
    "maxScore": 36,
    "compatibilityStatus": "Excellent Match (उत्कृष्ट मिलान)",
    "manglikDosha": {
      "boyManglik": false,
      "girlManglik": false,
      "doshaCancelled": true
    },
    "kootas": [
      { "name": "Varna", "obtained": 1, "max": 1, "status": "Pass" },
      { "name": "Vashya", "obtained": 2, "max": 2, "status": "Pass" },
      { "name": "Tara", "obtained": 3, "max": 3, "status": "Pass" },
      { "name": "Yoni", "obtained": 4, "max": 4, "status": "Pass" },
      { "name": "Graha Maitri", "obtained": 4, "max": 5, "status": "Pass" },
      { "name": "Gana", "obtained": 6, "max": 6, "status": "Pass" },
      { "name": "Bhakoot", "obtained": 0, "max": 7, "status": "Dosha" },
      { "name": "Nadi", "obtained": 8, "max": 8, "status": "Pass" }
    ]
  }
}
```

---

### 2.3 Daily Vedic Panchang (Ephemeris)
Retrieves daily solar, lunar, and muhurat coordinates. Cached in PostgreSQL database.

- **Route**: `GET /api/astro/panchang?date=YYYY-MM-DD&city=varanasi`
- **Access**: Public
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "date": "2026-10-24",
    "city": "Varanasi",
    "tithi": "Shukla Paksha Trayodashi (शुक्ल त्रयोदशी)",
    "vaar": "Shanivar (Saturday / शनिवार)",
    "nakshatra": "Uttara Phalguni (उत्तराफाल्गुनी)",
    "yoga": "Vyaghata (व्याघात)",
    "karana": "Kaulava (कौलव)",
    "sunrise": "06:04 AM",
    "sunset": "05:27 PM",
    "abhijitMuhurat": "11:48 AM - 12:36 PM",
    "rahuKaal": "09:00 AM - 10:30 AM",
    "samvat": "Vikram Samvat 2083"
  }
}
```

---

## 3. Booking & Commerce Endpoints

### 3.1 Validate Discount Coupon
- **Route**: `POST /api/offers/validate`
- **Access**: Public / Customer
- **Request Body**:
```json
{
  "code": "VEDIC10",
  "orderAmountPaise": 210000
}
```
- **Success Response (200 OK)**:
```json
{
  "valid": true,
  "discountPaise": 21000,
  "netAmountPaise": 189000,
  "offerTitle": "10% Sanctum Inaugural Discount"
}
```

---

### 3.2 Create Consultation Order
Creates a locked order with sequential identifier (`MKJK-2026-XXXX`).

- **Route**: `POST /api/booking`
- **Access**: Authenticated / Guest
- **Request Body**:
```json
{
  "serviceId": "clxx123...",
  "planId": "clxx456...",
  "offerCode": "VEDIC10",
  "slotId": "clxx789...",
  "jatakaDetails": {
    "name": "Rohan Gupta",
    "phone": "+919876543210",
    "email": "rohan@example.com",
    "gender": "male",
    "dob": "1992-07-28",
    "tob": "11:20",
    "pob": "Varanasi",
    "gotra": "Kashyap",
    "language": "hi",
    "queries": ["Career progression in 2026"]
  },
  "paymentMode": "RAZORPAY"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "orderId": "clord999...",
  "orderNumber": "MKJK-2026-0042",
  "netAmountPaise": 189000,
  "checkoutUrl": "/en/booking/checkout/clord999..."
}
```

---

### 3.3 Public Order Tracking
- **Route**: `POST /api/orders/track`
- **Access**: Public (Strict Rate Limited)
- **Request Body**:
```json
{
  "orderNumber": "MKJK-2026-0042",
  "phone": "+919876543210"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "order": {
    "orderNumber": "MKJK-2026-0042",
    "serviceTitle": "Detailed Kundli Dossier",
    "status": "KUNDLI_IN_PROGRESS",
    "createdAt": "2026-10-24T08:30:00.000Z",
    "courierName": null,
    "trackingNumber": null,
    "timeline": [
      {
        "status": "ORDER_RECEIVED",
        "createdAt": "2026-10-24T08:30:00.000Z",
        "note": "Payment verified via Instant Razorpay"
      },
      {
        "status": "KUNDLI_IN_PROGRESS",
        "createdAt": "2026-10-24T09:15:00.000Z",
        "note": "Mathematical coordinates assigned to Kendra team"
      }
    ]
  }
}
```

---

### 3.4 Download Sequential GST Invoice
Streams authenticated server-generated PDF invoice with Kendra GSTIN and watermark.

- **Route**: `GET /api/invoice/:orderId`
- **Access**: Authenticated (Owner of Order or Admin)
- **Response**: Binary PDF Stream (`application/pdf`) with `Content-Disposition: attachment; filename="Invoice-INV-2026-XXXX.pdf"`.

---

## 4. Customer Vault & Document Streaming

### 4.1 Download Kundli Dossier
Streams authenticated Kundli chart PDF from private storage.

- **Route**: `GET /api/vault/:fileId`
- **Access**: Authenticated (Customer Owner or Admin)
- **Response**: Binary PDF Stream with magic-bytes verification (`%PDF-`).

---

## 5. Administrative CMS Endpoints (`/api/admin/*`)

All `/api/admin/*` endpoints strictly enforce `requireAdmin()` session validation and reject non-admin users with `403 Forbidden`.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/admin/services` | `GET`, `POST` | List all services / Create new service |
| `/api/admin/services/:id` | `GET`, `PUT`, `DELETE` | Read, update, or deactivate a service |
| `/api/admin/plans` | `POST` | Create service pricing tier in Paise |
| `/api/admin/plans/:id` | `PUT`, `DELETE` | Update tier price, delivery days, or call minutes |
| `/api/admin/offers` | `GET`, `POST` | List promotional coupons / Create discount offer |
| `/api/admin/offers/:id` | `PUT`, `DELETE` | Toggle active status or update usage limits |
| `/api/admin/orders/:id/status` | `POST` | Advance lifecycle status (`ORDER_RECEIVED` → `EXECUTION_COMPLETE`) |
| `/api/admin/orders/:id/verify-payment` | `POST` | Approve or reject manual UPI/Bank payments |
| `/api/admin/vault/upload` | `POST` | Upload customer PDF dossier with magic-bytes validation |
| `/api/admin/banners` | `GET`, `POST` | Manage Top/Bottom/Left/Right banners |
| `/api/admin/marquee` | `GET`, `POST` | Update scroll speeds and bilingual ticker notices |
| `/api/admin/settings` | `GET`, `PUT` | Update Kendra phone numbers, VPA, bank details & GSTIN |
| `/api/admin/blogs` | `GET`, `POST` | Publish or edit astrological treatises and essays |
| `/api/admin/testimonials` | `GET`, `POST` | Moderate customer reviews & toggle verified client badge |
| `/api/admin/gallery` | `GET`, `POST` | Upload and order sanctum photographs |
