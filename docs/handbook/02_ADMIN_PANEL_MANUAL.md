---
title: Admin Panel Manual
subtitle: Maharshi Kanad Jyotish Kendra - How to run the website day to day
version: 1.0
audience: Kendra owner and staff (no technical knowledge needed)
---

# 1. About this manual

This manual explains, step by step, how to use the Admin Panel of the Maharshi Kanad Jyotish Kendra website. You do not need to know any programming. Everything below is done by clicking and typing inside the Admin Panel.

How to read it:

- Part 2 shows how to sign in and find your way around.
- Part 3 is a quick "I want to..." list. Use it when you know what you want to do but not where to find it.
- Parts 4 to 9 describe every screen in the order of the left-hand menu.
- Part 10 lists daily, weekly and monthly routines.
- Part 11 explains common problems and what to do.

> Tip: Most screens show Hindi and English side by side. Always fill both languages for text that customers see, so the website looks complete in both.

# 2. Signing in and finding your way

## 2.1 Signing in

1. Open the website and choose Login, then "Super Admin Login".
2. Enter the admin email and password.
3. After signing in, click Admin in the account menu (or open the address /admin).

Rules for safety:

- Use a strong password that nobody else knows. Change it from time to time.
- Never share the admin password. Give staff their own access only if the developer sets it up.
- Always press "Log out" when you finish, especially on a shared computer or phone.
- After five wrong password attempts the account is locked for 15 minutes. This is normal protection.

## 2.2 The Admin Panel layout

On a computer, the menu is on the left. On a phone, press the "Admin menu" button to open it. The menu has five groups:

| Group | What it contains |
|---|---|
| Overview | Dashboard |
| Bookings and money | Orders, Services and plans, Other services, Appointment slots, Promo codes, Enquiries |
| People | Users, Associates, Customer files |
| Website | Website settings, Banners, Scrolling notice, Pages and legal, Articles, Gallery, Reviews, FAQ, Founder, Certificates, Translations, Chatbot |
| System | Business settings, API keys and Analytics, Backups |

The black strip at the top shows who is signed in, a link to the public website ("Public Site") and the Log out button.

# 3. Quick guide: "I want to..."

| I want to... | Go to | Section |
|---|---|---|
| See today's orders and money | Dashboard | 4.1 |
| Confirm that a customer has paid | Orders | 4.2 |
| Tell the customer their Kundli is ready | Orders (change status) | 4.2 |
| Change a price or add a plan | Services and plans | 4.3 |
| Open times for consultation calls | Appointment slots | 4.5 |
| Make a discount code | Promo codes | 4.6 |
| Answer a message from the Contact form | Enquiries | 4.7 |
| Approve a new associate or pay commission | Associates | 5.2 |
| See or add a customer's Kundli file | Customer files | 5.3 |
| Add Facebook, Instagram, YouTube, WhatsApp links | Website settings, Social media | 6.1 |
| Change the heading on the home page | Website settings, Hero content | 6.1 |
| Put a notice or offer at the top or bottom | Scrolling notice | 6.3 |
| Upload GST, MSME, Trademark, ISO certificates | Certificates | 6.9 |
| Change the phone, address, bank or UPI | Business settings | 8.1 |
| Change the map location | Business settings, Location Map | 8.1 |
| Switch Kundli, Matching or Panchang on or off | Website settings, Panchang, Kundli and Matching tools | 6.1 |
| Add Google Analytics | API keys and Analytics | 8.2 |
| Take or download a backup | Backups | 8.3 |

# 4. Bookings and money

## 4.1 Dashboard

The Dashboard is the first screen. It shows, at a glance:

- Total orders, payments waiting to be verified, revenue (paid orders only), customers, associates, open enquiries and active services.
- Recent orders with their payment status.
- Orders grouped by stage (received, in progress, complete and so on).

Use it every morning. If "Payments to verify" is not zero, open Orders and verify them.

## 4.2 Orders

Menu: Bookings and money, Orders.

This is the most important screen. Each booking becomes an order with a number such as MKJK-2026-0004.

### Finding an order

- Use the search box (order number, customer name or phone number).
- Use the filter tabs: All orders, Awaiting verification, Paid, In progress, Completed.

### Verifying a manual payment

Customers pay to the Kendra's UPI or bank account and then enter the payment reference (UTR) on the website. Such an order shows "Awaiting verification".

1. Open your bank or UPI app and check that the money has arrived for that amount.
2. In Orders, click the order.
3. Compare the amount and the reference number the customer entered.
4. Press Approve if the money has arrived. The order becomes Paid and an invoice number is created.
5. Press Reject only if the money has not arrived or the reference is wrong, and write a clear reason. The customer will see the reason and can submit again.

> Important: Never approve a payment only because the customer says they paid. Always check your own bank or UPI statement first.

### Moving the order forward

After payment, update the status so the customer can follow progress in "Track order". A short note is required with each change.

| Status | Meaning | Next step allowed |
|---|---|---|
| Order received | Booking made | Kundli in progress |
| Kundli in progress | Work has started | Kundli complete |
| Kundli complete | Report is ready | Dispatched (physical copy) or Execution complete (digital only) |
| Dispatched | Sent by courier | Delivered |
| Delivered | Customer has it | Execution complete |
| Execution complete | Finished | none |

For a dispatched order, enter the courier name and tracking number. The customer sees them on the tracking page.

You cannot skip steps. This keeps the record honest.

### Appointments

If a plan includes a consultation call, the order shows the chosen date and time. Approve, reject or mark the appointment complete from the order. Rejecting an appointment frees that time for other customers.

### Invoices

Paid orders have an invoice that the customer can download from their account. You can open the same invoice from the order.

## 4.3 Services and plans

Menu: Bookings and money, Services and plans.

A Service is what you offer (for example "Complete Janampatri"). A Plan is a version of it with its own price (for example "Digital PDF" or "Handcrafted Pothi").

### Add a service

1. Press Add Service.
2. Enter the title in English and in Hindi, a short summary and the full description. Use content blocks (text, image, YouTube video, link) instead of one long paragraph.
3. Add a picture or a YouTube link if you have one.
4. Keep "Active" switched on to show it on the website. Switch it off to hide it without deleting.
5. Save.

### Add a plan to a service

1. Click the service row to open its plans.
2. Press Add Plan.
3. Enter the title (English and Hindi) and the price in rupees (for example 1100, not 1,100.00).
4. Optionally enter the "original price" to show a cut-off price.
5. Enter delivery days and number of pages.
6. Tick "includes call" if a consultation call is part of the plan, and enter the call minutes. Such plans ask the customer to choose an appointment slot, so make sure slots exist (section 4.5).
7. Save.

### Editing and removing

- Edit changes any detail. Prices of past orders do not change.
- Deactivate hides a service or plan without losing its history.
- Delete removes it for good. A service with orders should be deactivated instead of deleted.

## 4.4 Other services

Menu: Bookings and money, Other services.

Use this for additional services (for example Vastu, gemstones, pooja) that are shown on the "Other services" page. It works like Services: title, description, image or YouTube link, content blocks, and an Active switch.

## 4.5 Appointment slots

Menu: Bookings and money, Appointment slots.

Slots are the times a customer can pick for a consultation call. Without slots, customers cannot book plans that include a call.

### Adding slots in bulk

1. Choose From date and To date.
2. Tick the weekdays you are available.
3. Enter the daily Start time and End time (for example 11:00 to 13:00).
4. Enter the minutes per slot (for example 30). The screen splits the time automatically: 11:00-13:00 with 30 minutes gives four slots a day.
5. Enter "People per slot" (usually 1).
6. The screen tells you how many slots it will create. Press Add slots.

Slots that already exist for the same day and start time are skipped. Past dates are ignored.

### Managing slots

- The list shows each date with "booked of capacity".
- Switch off hides a slot from customers without deleting it (use this for holidays).
- Delete removes an unused slot. A slot with bookings cannot be deleted; switch it off instead.

> Habit: add slots for the next two or three weeks every Monday.

## 4.6 Promo codes

Menu: Bookings and money, Promo codes.

A promo code gives a customer a discount at booking.

### Creating a code

1. Press Create Offer Code.
2. Code: letters and numbers only, for example NAVRATRI200.
3. Title in English and Hindi (shown to customers).
4. Discount type: Flat (a fixed rupee amount) or Percentage.
5. Value: the rupees off, or the percent.
6. Maximum discount (percentage codes only): the highest rupee amount the discount can reach.
7. Minimum order: the plan price must be at least this much. Leave at 0 for no minimum. Remember that plan prices are often around Rs. 1,100 to Rs. 2,500, so a high minimum will block most customers.
8. Total uses: how many times the code may be used in all.
9. Uses per customer: how many times one customer may use it (1 is usual; 0 means unlimited).
10. Valid for: tick the services it works on. Tick none for all services.
11. Start and end dates, and the Active switch.

### What the customer sees

If a code does not apply, the website says exactly why: "Minimum order value of Rs. X required", "This code is not valid for the selected service", "You have already used this code", or that it has expired or reached its limit.

### Good practice

- Make one code per campaign so you can see how well each worked (the list shows how many times it has been used).
- Switch a code off (do not delete) when a campaign ends.

## 4.7 Enquiries

Menu: Bookings and money, Enquiries.

Messages sent from the Contact page and the chat assistant appear here with the person's name, phone and message. Call or message them, then press the resolved toggle so the dashboard count goes down. Use the filter to see open, resolved or all enquiries. Check this screen at least twice a day.

# 5. People

## 5.1 Users

Menu: People, Users.

Lists all registered customers with phone, email and number of orders. Use search to find a person. Use this to help a customer who cannot find their account.

## 5.2 Associates (referral partners)

Menu: People, Associates.

Associates are partners who share a referral link. When someone books through their link, the associate earns a commission.

### The four tabs

The Associates screen has four tabs:

| Tab | What it is for |
|---|---|
| Associates | The list of partners; approve, reject, view details, notes and own commission |
| Commission rules | The standard commission, either for everything or for a chosen service or plan (a percentage or a fixed rupee amount) |
| Payout requests | Requests from associates to be paid; mark each as Paid or Rejected |
| Settings | The programme rules below |

### Programme rules (Settings tab)

| Setting | Meaning |
|---|---|
| Programme on or off | Turn off to stop new associate sign-ups |
| Approve automatically | If off, you approve each new associate by hand |
| Minimum payout | The least amount an associate may request |
| Referral validity (days) | How long a referral link is remembered |
| Terms (English and Hindi) | Rules shown to associates |

### Approving an associate

1. Open Associates. New requests show "Pending".
2. Open the associate. Check their name, phone, email and payout details.
3. Press Approve, or Reject with a reason.

### Special arrangements

For one associate you can set their own commission (percentage or fixed), write private notes, or switch them off. A commission cannot exceed 100 percent.

### Commission life cycle

| Stage | Meaning |
|---|---|
| Pending | The referred order exists but payment is not yet verified |
| Earned | The order is paid, so the commission is due |
| Paid | You have paid the associate |
| Cancelled | The order was refunded or cancelled |

### Paying commission

1. Associates request a payout when their earned amount reaches the minimum.
2. Open the Payout requests tab. Check the associate's UPI or bank details.
3. Pay them from your bank or UPI app.
4. Mark the request as Paid and enter the payment reference. Use Rejected, with a reason, if you cannot pay it.

> Never mark a payout as Paid before the money has actually been sent.

## 5.3 Customer files (vault)

Menu: People, Customer files.

Customers upload their Kundli and documents. Here you can open any customer's files, and upload a report for them (for example the finished Kundli PDF). Files are private: only that customer and the admin can open them.

- Accepted types: PDF, images, video, audio, Word, Excel, PowerPoint, text. Maximum size 4 MB per file.
- PDFs, images, video, audio and text open on screen. Word and Excel files download.
- Pictures that look like another type (for example a program renamed as .pdf) are refused automatically.

# 6. Website

## 6.1 Website settings

Menu: Website, Website settings.

This is the control centre for the public website. Pick a section on the left and save when done. Changes appear on the website immediately.

| Section | What it controls |
|---|---|
| Logo | Logo image and browser tab icon. Upload an image, then Save. Leave empty to keep the default |
| Home page | The highlight strip under the top banner, and whether the social media row shows on the home page |
| General | Tagline, footer note and copyright line |
| Contact | Working hours and a note shown on the Contact page |
| Social media | Facebook, Instagram, YouTube, WhatsApp, Twitter/X, LinkedIn, Telegram (see below) |
| SEO | The title and description Google shows, keywords, the picture shown when the link is shared, and the Google Search Console code |
| Content | Short "About" text and mission text |
| Features | Show or hide the floating buttons, the certificates link and the blog link |
| Business | Registered business name, owner, MSME number, year started (shown in the footer) |
| Analytics | Allow or stop visitor statistics |
| Legal pages | A short disclaimer in the footer, and a button to open Pages |
| Hero animation | The large Om mark, a soft glow and the colour of the small heading in the home page banner |
| Hero content | The small heading, main heading and introduction on the home page. Leave empty for the standard wording |
| Technology information | A note on the calculation method shown under the Kundli, Matching and Panchang tools |
| Mobile app | Play Store, App Store and APK links and text shown on the App page |
| Panchang, Kundli and Matching tools | Switch each page on or off and change the tool address |
| Admin settings | Private notes for staff (not shown to visitors) |

### Social media (step by step)

1. Open Website settings and choose Social media.
2. For each platform, check the name and paste the full web address (for example https://www.instagram.com/yourpage). For WhatsApp you can type the mobile number; it becomes a link.
3. Set the status to Active to show it or Hide to keep it off the website.
4. Use the small arrow icon to test the link.
5. Press Save social links.

Active links appear as round icons in the top bar, the home page, the Contact page and the footer. No technical keys are needed for these links.

### Switching Kundli, Matching or Panchang off

Choose "Panchang, Kundli and Matching tools". Untick a page and Save. The menu, footer and home links disappear, and anyone who opens the page sees a polite "not available right now" message. Tick it again to bring it back.

### The date and Panchang bar

The top line of the website shows the time, day, date, paksha, tithi, lunar month and Vikram Samvat. It is calculated automatically every day. There is nothing to update.

## 6.2 Banners

Menu: Website, Banners.

Banners are pictures with a title and link shown at the top, bottom, left or right of the home page.

1. Press Add Banner.
2. Choose the position (Top, Bottom, Left, Right) and the type (Single, or Carousel for a slideshow).
3. Upload an image or paste an address, add the titles in both languages, and a link if needed.
4. Set the order and keep Active on.

Use clear, light images. Very large files make the page slow; prefer files under 500 KB.

## 6.3 Scrolling notice (marquee)

Menu: Website, Scrolling notice.

The moving text strip. You can set:

- The text in Hindi and English.
- Where it shows (top or bottom of the page).
- Speed and font size.
- Background colour and text colour. Quick colour buttons are provided (Yellow, Saffron, Maroon, Red, Cream). Choose a dark text on a light background or the reverse so it is easy to read.
- Pause when the pointer is over it, and whether visitors may close it with the X button.

A live preview is shown before you save.

## 6.4 Pages and legal

Menu: Website, Pages and legal.

Edit pages such as About and the legal pages (Privacy Policy, Terms and Conditions, Refund policy, Platform Guidelines, Member Agreement, Rules and Regulations). Each page has an English text and a Hindi text, and can have content blocks.

> Legal wording should be changed only with the approval of the Kendra's lawyer.

## 6.5 Articles

Menu: Website, Articles. Write blog articles with a title, summary, image, text blocks and an optional YouTube video. Use the Active switch to publish or hide an article.

## 6.6 Gallery

Menu: Website, Gallery. Add photos or videos with captions. Remove old items to keep the page quick.

## 6.7 Reviews

Menu: Website, Reviews. Add customer testimonials with name, place, rating and text. Only add genuine reviews with the customer's permission.

## 6.8 FAQ and Founder

- FAQ: add questions and answers in both languages. Keep answers short.
- Founder: edit the founder's name, photo, biography and achievements shown on the Founder page.

## 6.9 Certificates

Menu: Website, Certificates.

Upload GST, MSME, Trademark, ISO and other certificates so visitors can view, download and print them.

1. Press Add document.
2. Choose the kind (GST, MSME, Trademark, ISO, Other).
3. Enter the title in both languages and the certificate number.
4. Upload the PDF or image.
5. Save. Use the Active switch to hide a certificate without deleting.

## 6.10 Translations

Menu: Website, Translations. Change the wording of fixed website text (buttons, labels) in Hindi or English without any programming. Search for the text and edit it.

## 6.11 Chatbot

Menu: Website, Chatbot.

The chat assistant answers questions using the question-and-answer pairs you add here, and an AI helper for other questions.

- Add common questions with keywords, answers in both languages and a short button text.
- Edit the welcome message.
- Switch the chatbot on or off.

> The AI answers are general. Add your own answers for prices, timings and policies so customers always get correct information.

# 7. Important customer-facing tools

These are not edited in the panel but you should know what they do:

- Panchang, Kundli and Matching pages show free tools from AstroSage inside the website. They are free and need no key. If AstroSage changes its page, the tool address can be updated in Website settings.
- Track Order lets customers see their status with the order number and phone number.
- My Documents (vault) lets customers upload their Kundli and see it beside the upload button.
- The Panchang bar and home Panchang are calculated by the website itself.

# 8. System

## 8.1 Business settings

Menu: System, Business settings.

| Block | What to enter |
|---|---|
| Kendra contact and address | Name, phone numbers, email, address, city |
| Panchang coordinates | Latitude and longitude used for sunrise and similar timings (Varanasi is set by default) |
| Location map | Whether to show a map, its zoom, the place (latitude and longitude, or paste a Google Maps embed code) and the label |
| Android app download | The link to the app and a QR code is made automatically |
| Manual payment options | UPI ID, QR code image, bank name, account name, account number and IFSC. These appear at checkout |
| Taxation and billing | GSTIN and the GST rate printed on invoices |

Double-check the UPI ID and bank details. Customers will send money to exactly what is written here.

### Changing the map location

1. Business settings, Location Map.
2. Either type the latitude and longitude of your place, or paste the "Embed a map" code from Google Maps (Share, Embed a map).
3. Press Save. The Contact page and footer update immediately.

## 8.2 API keys and Analytics

Menu: System, API keys and Analytics.

This screen stores the connections to outside services. Secret values are stored encrypted and are shown only as hidden characters.

| Key | Used for | Where to get it |
|---|---|---|
| Razorpay Key ID, Key Secret, Webhook Secret | Online payment | Razorpay dashboard |
| MSG91 Auth Key, Sender ID, Template ID | OTP by SMS | MSG91 account |
| SMTP host, port, user, password, from | Order emails | Gmail App Password or another mail service |
| Google Client ID and Secret | Sign in with Google | Google Cloud Console |
| Google Analytics Measurement ID | Visitor statistics | analytics.google.com |

Entering Google Analytics:

1. In Google Analytics, create a Web property and copy the Measurement ID (it starts with G-).
2. Paste it into "Google Analytics" on this screen and save.
3. Open the website, then check Google Analytics, Realtime. You should see yourself within a minute.

To stop tracking at any time, use Website settings, Analytics.

> Never send these keys on WhatsApp or email in plain text. Enter them here yourself, or give them to the developer in person.

## 8.3 Backups

Menu: System, Backups.

The website keeps copies of your content and records (services, plans, orders, customers' details, settings, certificates and so on). Passwords and secret keys are never included. Uploaded files are stored separately and are not inside the backup.

- Automatic backups: one daily copy, a weekly copy on Sundays and a monthly copy on the 1st (Indian time).
- You choose how many daily, weekly and monthly copies to keep. Older ones are removed automatically.
- Back up now: takes a manual copy immediately. Do this before any large change (for example editing many prices).
- Download: saves a copy to your computer as a readable file. Keep a monthly copy on your own computer or in cloud storage.
- Restore: if something goes wrong, contact the developer. Restoring is done carefully by the developer so that nothing is overwritten by mistake.

# 9. The customer's journey (what happens on the other side)

1. The customer opens a service, chooses a plan, and presses Book.
2. They sign in (OTP, password or Google), fill birth details and, for call plans, pick a slot.
3. They apply a promo code if they have one and see the price with GST.
4. They pay to the Kendra's UPI or bank and enter the payment reference.
5. You verify the payment (4.2). The customer gets an invoice.
6. You move the order through the stages and upload the report to their vault.
7. The customer tracks progress, downloads the report and the invoice.

# 10. Routines

### Every day

- Open the Dashboard. Clear "Payments to verify".
- Check Enquiries and reply.
- Update order statuses for work done.

### Every week

- Add appointment slots for the coming weeks (4.5).
- Review associate requests and payouts (5.2).
- Check banners and the scrolling notice are still current.

### Every month

- Download a backup and keep it safely (8.3).
- Review promo codes that have ended and switch them off.
- Check Google Analytics for visitors, popular pages and busy days.
- Make sure the certificates and legal pages are up to date.

# 11. Common problems

| Problem | What to do |
|---|---|
| A customer says they paid but the order is still "Awaiting verification" | Check your bank or UPI statement for that amount and reference, then Approve or Reject |
| A promo code is refused | Read the message shown. Check the minimum order, the services it is valid for, the dates and the per-customer limit in Promo codes |
| Customers cannot choose a consultation time | Add slots in Appointment slots (4.5) |
| I changed something but the website still shows the old version | Refresh the page (press Ctrl and F5 on a computer). Changes in Website settings are immediate |
| The map shows the wrong place | Business settings, Location Map. Check the latitude and longitude, or paste a fresh Google embed code |
| A Kundli, Matching or Panchang page is empty | The outside tool may be down. Try again later, or switch the page off in Website settings until it returns |
| I forgot my password | Contact the developer to reset it |
| I deleted something by mistake | Contact the developer at once. Downloaded backups can help |
| Mobile OTP is not arriving | The SMS service (MSG91) must be set up with its keys and template. Until then use email and password or Google login |

# 12. Do and do not

Do:

- Check payments in your own bank or UPI before approving.
- Fill both Hindi and English text.
- Keep slots, banners and the scrolling notice up to date.
- Download a backup every month.
- Log out when you finish.

Do not:

- Share the admin password or the API keys.
- Approve a payment without checking the money.
- Delete services or plans that already have orders. Deactivate them.
- Change legal text without the lawyer's approval.
- Upload very large pictures.

# 13. Getting help

For technical help, restore from backup, or new features, contact the developer. Please have ready: what you were doing, what you expected, what happened, and the date and time. A screenshot helps.
