-- The Kendra will supply its own email and address later. Until then none is shown anywhere on the website.
-- Only the values added by earlier set-up (sample data and the details copied from the first version) are cleared;
-- anything the client typed in themselves is left alone.
UPDATE "AdminSettings"
SET "email" = NULL,
    "addressEn" = NULL,
    "addressHi" = NULL,
    "city" = NULL,
    "mapEnabled" = false,
    "mapLabelEn" = NULL,
    "mapLabelHi" = NULL,
    "updatedAt" = NOW()
WHERE "id" = 'default'
  AND (
    "email" IN ('sntiwarigevra61@gmail.com', 'contact@kanadastro.org')
    OR "addressEn" IN ('Bhilai, Durg, Chhattisgarh')
    OR "addressEn" LIKE 'Kanad Bhavan%'
  );

-- Scrolling notice that mentioned the place
UPDATE "MarqueeItem"
SET "textEn" = 'Book online or enquire on WhatsApp • Matrimonial and Bharat Darshan services available • Call +91 98279 91224',
    "textHi" = 'ऑनलाइन बुक करें या व्हाट्सऐप पर पूछें • वैवाहिक एवं भारत दर्शन सेवाएँ उपलब्ध • संपर्क +91 98279 91224'
WHERE "textEn" LIKE '%Bhilai, Durg, Chhattisgarh%';
