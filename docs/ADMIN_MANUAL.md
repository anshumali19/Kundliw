# Administrator Manual & CMS Operations Guide

> **Maharshi Kanad Jyotish Kendra (महर्षि कणाद ज्योतिष केंद्र)**  
> Comprehensive Operating Guide for Kendra Administrators & Staff

The Kendra CMS allows authorized staff to manage services, promotional coupons, order lifecycle stages, customer vault dossiers, promotional banners, marquee announcements, articles, reviews, and banking details.

---

## 1. Accessing the Admin CMS

1. **Sign-in URL**: Navigate to `/en/auth/signin` or `/hi/auth/signin`.
2. **Switch to Admin Tab**: Click the **Admin Login** tab.
3. **Enter Credentials**:
   - **Email**: `admin@kanad-jyotish.in`
   - **Password**: Configured admin password (default: `ChangeMeInAdminSettings@2026`).
4. **Security Notice**: 
   - Admin login is strictly rate-limited. Five consecutive failed attempts lock the email and IP for 15 minutes.
   - Passwords should be updated immediately after the first login via `/admin/settings`.

---

## 2. Managing Vedic Services & Pricing Tiers

Navigate to **Admin** → **Services & Plans** (`/admin/services`):

### 2.1 Creating / Editing a Service
- **Title (Hindi & English)**: e.g. "Detailed Janampatri Dossier" / "सविस्तार जन्मपत्रिका हस्तलिखित पोथी".
- **Description & Notes**: Outline the astrological methodology (Surya Siddhanta mathematical degree calculations).
- **Inclusions List**: Add bullet points highlighting what the client receives (e.g. "Vimshottari Dasha Analysis", "Gemstone Recommendation").

### 2.2 Adding Pricing Plans
- **Price in Rupees**: Input values in whole Rupees (the system automatically converts to Paise internally to prevent floating-point tax rounding errors).
- **Turnaround Days**: Expected days to complete calculations and dispatch.
- **Consultation Call Inclusions**: Check if the plan includes a telephonic consultation with Daivajna and set the call duration (e.g. 30 minutes).

---

## 3. Managing Promotional Coupons (`/admin/offers`)

Create seasonal or festive discounts (e.g. Navratri, Diwali, or Inaugural offers):

- **Coupon Code**: Unique uppercase string (e.g. `VEDIC10`, `KASHI25`).
- **Discount Type**:
  - `FLAT`: Fixed rupee deduction (e.g., ₹500 off).
  - `PERCENTAGE`: Percentage discount (e.g., 10% or 25% off).
- **Max Discount Ceiling**: Optional cap on percentage discounts.
- **Minimum Order Value**: Minimum basket value required to apply.
- **Usage Limits**: Total number of redemptions allowed across the portal.
- **Validity Dates**: Start and expiration timestamps.

---

## 4. Processing Orders & Managing Lifecycle (`/admin/orders`)

Navigate to **Admin** → **Orders Manager** (`/admin/orders`):

### 4.1 Order Review & Birth Details (Jataka)
- Click on any order to inspect full astrological birth details:
  - Client Full Name, Date of Birth, Exact Time of Birth, Place of Birth
  - Geographic Coordinates (Latitude, Longitude)
  - Family Gotra and Specific Questions for Daivajna
  - Billing Information & Sequential Invoice Number (`INV-2026-XXXX`)

### 4.2 Advancing Lifecycle Stages
Select the appropriate next canonical stage from the dropdown and input an audit note:

1. `ORDER_RECEIVED` → `KUNDLI_IN_PROGRESS`: Assign calculation to mathematical team.
2. `KUNDLI_IN_PROGRESS` → `KUNDLI_COMPLETE`: Janampatri calculation completed and dossier verified.
3. `KUNDLI_COMPLETE` → `DISPATCHED`: Physical dossier shipped. Enter **Courier Name** (e.g., BlueDart) and **Tracking Number**.
4. `DISPATCHED` → `DELIVERED`: Confirm delivery at customer address.
5. `DELIVERED` → `EXECUTION_COMPLETE`: Complete telephonic or sanctum consultation.

### 4.3 Verifying Manual Payments
For orders placed via Direct UPI VPA or Bank NEFT:
- Review the uploaded payment screenshot and customer UTR reference.
- Click **Approve Payment** to advance the order to `ORDER_RECEIVED` and issue the official tax invoice.
- Click **Reject Payment** with a reason if the transaction reference is invalid.

---

## 5. Customer Kundli Vault Management (`/admin/vault`)

To deliver digital Janampatri dossiers directly to a customer's private account:

1. Navigate to `/admin/vault`.
2. Select the customer user account and associated order number.
3. Input the document title in Hindi and English (e.g. "Complete Janampatri Dossier 2026–2036").
4. Upload the PDF file:
   - **File Format**: Authenticated PDF only (the system enforces `%PDF-` magic-bytes validation).
   - **File Size Ceiling**: Maximum file size is strictly 10 MB.
5. Once uploaded, the document is immediately available in the customer's `/vault` dashboard.

---

## 6. Homepage Banners & Marquee Tickers

### 6.1 Banners (`/admin/banners`)
- **Slots Available**: `TOP`, `BOTTOM`, `LEFT`, `RIGHT`.
- **Display Modes**:
  - `STATIC`: Single high-resolution banner image.
  - `CAROUSEL`: Touch-friendly rotating banner sequence.
- **Links**: Target route or external link.

### 6.2 Marquee Notices (`/admin/marquee`)
- Update real-time scrolling ticker notices across the top or bottom of the website.
- Configure bilingual message text, scroll speed in seconds, and font size in pixels.

---

## 7. Kendra Settings & Contact Configuration (`/admin/settings`)

Manage official sanctuary contact points and financial parameters:

- **Official Helpline**: Primary (+91-9827991224) and secondary numbers.
- **Sanctum Campus Address**: Physical Dashashwamedh Ghat Varanasi address.
- **Banking Coordinates**: Beneficiary Bank Account Name, Account Number, IFSC Code, Bank Branch, and UPI VPA.
- **QR Code**: Upload scannable Temple UPI QR image.
- **GSTIN**: Kendra GST Registration Number (printed on all PDF invoices).
