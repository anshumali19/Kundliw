-- The Kendra's real services, plans, FAQ and contact details (from the client's own site).
-- Idempotent. Nothing is deleted: the old sample services are only switched off.

INSERT INTO "Service" ("id","slug","titleEn","titleHi","taglineEn","taglineHi","descriptionEn","descriptionHi","highlightsEn","highlightsHi","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('service:janam-kundli'), $q$janam-kundli$q$, $q$Janam Kundli$q$, $q$जन्म कुंडली$q$, $q$Birth Kundli plans$q$, $q$जन्म कुंडली योजनाएँ$q$, $q$Professionally prepared birth chart based on accurate birth details and traditional Vedic principles. Choose a plan according to the depth of report and consultation required.$q$, $q$सही जन्म विवरण और पारंपरिक वैदिक सिद्धांतों पर आधारित व्यावसायिक जन्म कुंडली। रिपोर्ट और परामर्श की गहराई के अनुसार योजना चुनें।$q$, ARRAY[$q$Basic analysis$q$,$q$Digital summary$q$,$q$Consultation guidance$q$]::text[], ARRAY[$q$मूल विश्लेषण$q$,$q$डिजिटल सारांश$q$,$q$परामर्श मार्गदर्शन$q$]::text[], 1, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","taglineEn"=EXCLUDED."taglineEn","taglineHi"=EXCLUDED."taglineHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","highlightsEn"=EXCLUDED."highlightsEn","highlightsHi"=EXCLUDED."highlightsHi","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "Plan" ("id","serviceId","slug","titleEn","titleHi","descriptionEn","descriptionHi","pricePaise","deliveryDays","hasCall","featuresEn","featuresHi","isPopular","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('plan:janam-kundli/basic-kundli'), (SELECT "id" FROM "Service" WHERE "slug"=$q$janam-kundli$q$), $q$basic-kundli$q$, $q$Basic Kundli$q$, $q$बेसिक कुंडली$q$, $q$Professionally prepared birth chart based on accurate birth details and traditional Vedic principles. Choose a plan according to the depth of report and consultation required.$q$, $q$सही जन्म विवरण और पारंपरिक वैदिक सिद्धांतों पर आधारित व्यावसायिक जन्म कुंडली। रिपोर्ट और परामर्श की गहराई के अनुसार योजना चुनें।$q$, 50100, 3, false, ARRAY[$q$Basic analysis$q$,$q$Digital summary$q$,$q$Consultation guidance$q$]::text[], ARRAY[$q$मूल विश्लेषण$q$,$q$डिजिटल सारांश$q$,$q$परामर्श मार्गदर्शन$q$]::text[], false, 0, true, NOW())
ON CONFLICT ("serviceId","slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","pricePaise"=EXCLUDED."pricePaise","featuresEn"=EXCLUDED."featuresEn","featuresHi"=EXCLUDED."featuresHi","isPopular"=EXCLUDED."isPopular","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "Plan" ("id","serviceId","slug","titleEn","titleHi","descriptionEn","descriptionHi","pricePaise","deliveryDays","hasCall","featuresEn","featuresHi","isPopular","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('plan:janam-kundli/detailed-kundli'), (SELECT "id" FROM "Service" WHERE "slug"=$q$janam-kundli$q$), $q$detailed-kundli$q$, $q$Detailed Kundli$q$, $q$विस्तृत कुंडली$q$, $q$Professionally prepared birth chart based on accurate birth details and traditional Vedic principles. Choose a plan according to the depth of report and consultation required.$q$, $q$सही जन्म विवरण और पारंपरिक वैदिक सिद्धांतों पर आधारित व्यावसायिक जन्म कुंडली। रिपोर्ट और परामर्श की गहराई के अनुसार योजना चुनें।$q$, 110100, 5, false, ARRAY[$q$Basic analysis$q$,$q$Digital summary$q$,$q$Consultation guidance$q$]::text[], ARRAY[$q$मूल विश्लेषण$q$,$q$डिजिटल सारांश$q$,$q$परामर्श मार्गदर्शन$q$]::text[], true, 1, true, NOW())
ON CONFLICT ("serviceId","slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","pricePaise"=EXCLUDED."pricePaise","featuresEn"=EXCLUDED."featuresEn","featuresHi"=EXCLUDED."featuresHi","isPopular"=EXCLUDED."isPopular","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "Plan" ("id","serviceId","slug","titleEn","titleHi","descriptionEn","descriptionHi","pricePaise","deliveryDays","hasCall","featuresEn","featuresHi","isPopular","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('plan:janam-kundli/premium-kundli'), (SELECT "id" FROM "Service" WHERE "slug"=$q$janam-kundli$q$), $q$premium-kundli$q$, $q$Premium Kundli$q$, $q$प्रीमियम कुंडली$q$, $q$Professionally prepared birth chart based on accurate birth details and traditional Vedic principles. Choose a plan according to the depth of report and consultation required.$q$, $q$सही जन्म विवरण और पारंपरिक वैदिक सिद्धांतों पर आधारित व्यावसायिक जन्म कुंडली। रिपोर्ट और परामर्श की गहराई के अनुसार योजना चुनें।$q$, 210100, 7, false, ARRAY[$q$Basic analysis$q$,$q$Digital summary$q$,$q$Consultation guidance$q$]::text[], ARRAY[$q$मूल विश्लेषण$q$,$q$डिजिटल सारांश$q$,$q$परामर्श मार्गदर्शन$q$]::text[], false, 2, true, NOW())
ON CONFLICT ("serviceId","slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","pricePaise"=EXCLUDED."pricePaise","featuresEn"=EXCLUDED."featuresEn","featuresHi"=EXCLUDED."featuresHi","isPopular"=EXCLUDED."isPopular","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "Service" ("id","slug","titleEn","titleHi","taglineEn","taglineHi","descriptionEn","descriptionHi","highlightsEn","highlightsHi","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('service:prashna-kundli'), $q$prashna-kundli$q$, $q$Prashn Kundli$q$, $q$प्रश्न कुंडली$q$, $q$For one clear question$q$, $q$एक स्पष्ट प्रश्न के लिए$q$, $q$Focused astrology consultation for one specific question. Choose the required depth of analysis.$q$, $q$किसी एक विशेष प्रश्न के लिए केंद्रित ज्योतिष परामर्श। आवश्यक गहराई के अनुसार योजना चुनें।$q$, ARRAY[$q$Basic analysis$q$,$q$Digital summary$q$,$q$Consultation guidance$q$]::text[], ARRAY[$q$मूल विश्लेषण$q$,$q$डिजिटल सारांश$q$,$q$परामर्श मार्गदर्शन$q$]::text[], 2, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","taglineEn"=EXCLUDED."taglineEn","taglineHi"=EXCLUDED."taglineHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","highlightsEn"=EXCLUDED."highlightsEn","highlightsHi"=EXCLUDED."highlightsHi","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "Plan" ("id","serviceId","slug","titleEn","titleHi","descriptionEn","descriptionHi","pricePaise","deliveryDays","hasCall","featuresEn","featuresHi","isPopular","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('plan:prashna-kundli/basic-prashn'), (SELECT "id" FROM "Service" WHERE "slug"=$q$prashna-kundli$q$), $q$basic-prashn$q$, $q$Basic Prashn$q$, $q$बेसिक प्रश्न$q$, $q$Focused astrology consultation for one specific question. Choose the required depth of analysis.$q$, $q$किसी एक विशेष प्रश्न के लिए केंद्रित ज्योतिष परामर्श। आवश्यक गहराई के अनुसार योजना चुनें।$q$, 30100, 2, false, ARRAY[$q$Basic analysis$q$,$q$Digital summary$q$,$q$Consultation guidance$q$]::text[], ARRAY[$q$मूल विश्लेषण$q$,$q$डिजिटल सारांश$q$,$q$परामर्श मार्गदर्शन$q$]::text[], false, 0, true, NOW())
ON CONFLICT ("serviceId","slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","pricePaise"=EXCLUDED."pricePaise","featuresEn"=EXCLUDED."featuresEn","featuresHi"=EXCLUDED."featuresHi","isPopular"=EXCLUDED."isPopular","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "Plan" ("id","serviceId","slug","titleEn","titleHi","descriptionEn","descriptionHi","pricePaise","deliveryDays","hasCall","featuresEn","featuresHi","isPopular","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('plan:prashna-kundli/detailed-prashn'), (SELECT "id" FROM "Service" WHERE "slug"=$q$prashna-kundli$q$), $q$detailed-prashn$q$, $q$Detailed Prashn$q$, $q$विस्तृत प्रश्न$q$, $q$Focused astrology consultation for one specific question. Choose the required depth of analysis.$q$, $q$किसी एक विशेष प्रश्न के लिए केंद्रित ज्योतिष परामर्श। आवश्यक गहराई के अनुसार योजना चुनें।$q$, 50100, 3, false, ARRAY[$q$Basic analysis$q$,$q$Digital summary$q$,$q$Consultation guidance$q$]::text[], ARRAY[$q$मूल विश्लेषण$q$,$q$डिजिटल सारांश$q$,$q$परामर्श मार्गदर्शन$q$]::text[], true, 1, true, NOW())
ON CONFLICT ("serviceId","slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","pricePaise"=EXCLUDED."pricePaise","featuresEn"=EXCLUDED."featuresEn","featuresHi"=EXCLUDED."featuresHi","isPopular"=EXCLUDED."isPopular","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "Plan" ("id","serviceId","slug","titleEn","titleHi","descriptionEn","descriptionHi","pricePaise","deliveryDays","hasCall","featuresEn","featuresHi","isPopular","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('plan:prashna-kundli/premium-prashn'), (SELECT "id" FROM "Service" WHERE "slug"=$q$prashna-kundli$q$), $q$premium-prashn$q$, $q$Premium Prashn$q$, $q$प्रीमियम प्रश्न$q$, $q$Focused astrology consultation for one specific question. Choose the required depth of analysis.$q$, $q$किसी एक विशेष प्रश्न के लिए केंद्रित ज्योतिष परामर्श। आवश्यक गहराई के अनुसार योजना चुनें।$q$, 110100, 5, false, ARRAY[$q$Basic analysis$q$,$q$Digital summary$q$,$q$Consultation guidance$q$]::text[], ARRAY[$q$मूल विश्लेषण$q$,$q$डिजिटल सारांश$q$,$q$परामर्श मार्गदर्शन$q$]::text[], false, 2, true, NOW())
ON CONFLICT ("serviceId","slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","pricePaise"=EXCLUDED."pricePaise","featuresEn"=EXCLUDED."featuresEn","featuresHi"=EXCLUDED."featuresHi","isPopular"=EXCLUDED."isPopular","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "Service" ("id","slug","titleEn","titleHi","taglineEn","taglineHi","descriptionEn","descriptionHi","highlightsEn","highlightsHi","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('service:kundli-matching'), $q$kundli-matching$q$, $q$Kundli Matching$q$, $q$कुंडली मिलान$q$, $q$Compatibility for marriage planning$q$, $q$विवाह के लिए अनुकूलता विश्लेषण$q$, $q$Traditional compatibility analysis for marriage planning (Ashtakoot Guna Milan, Manglik and Nadi considerations).$q$, $q$विवाह की योजना के लिए पारंपरिक अनुकूलता विश्लेषण (अष्टकूट गुण मिलान, मांगलिक एवं नाड़ी विचार)।$q$, ARRAY[$q$Basic analysis$q$,$q$Digital summary$q$,$q$Consultation guidance$q$]::text[], ARRAY[$q$मूल विश्लेषण$q$,$q$डिजिटल सारांश$q$,$q$परामर्श मार्गदर्शन$q$]::text[], 3, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","taglineEn"=EXCLUDED."taglineEn","taglineHi"=EXCLUDED."taglineHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","highlightsEn"=EXCLUDED."highlightsEn","highlightsHi"=EXCLUDED."highlightsHi","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "Plan" ("id","serviceId","slug","titleEn","titleHi","descriptionEn","descriptionHi","pricePaise","deliveryDays","hasCall","featuresEn","featuresHi","isPopular","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('plan:kundli-matching/basic-matching'), (SELECT "id" FROM "Service" WHERE "slug"=$q$kundli-matching$q$), $q$basic-matching$q$, $q$Basic Matching$q$, $q$बेसिक मिलान$q$, $q$Traditional compatibility analysis for marriage planning (Ashtakoot Guna Milan, Manglik and Nadi considerations).$q$, $q$विवाह की योजना के लिए पारंपरिक अनुकूलता विश्लेषण (अष्टकूट गुण मिलान, मांगलिक एवं नाड़ी विचार)।$q$, 50100, 3, false, ARRAY[$q$Basic analysis$q$,$q$Digital summary$q$,$q$Consultation guidance$q$]::text[], ARRAY[$q$मूल विश्लेषण$q$,$q$डिजिटल सारांश$q$,$q$परामर्श मार्गदर्शन$q$]::text[], false, 0, true, NOW())
ON CONFLICT ("serviceId","slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","pricePaise"=EXCLUDED."pricePaise","featuresEn"=EXCLUDED."featuresEn","featuresHi"=EXCLUDED."featuresHi","isPopular"=EXCLUDED."isPopular","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "Plan" ("id","serviceId","slug","titleEn","titleHi","descriptionEn","descriptionHi","pricePaise","deliveryDays","hasCall","featuresEn","featuresHi","isPopular","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('plan:kundli-matching/detailed-matching'), (SELECT "id" FROM "Service" WHERE "slug"=$q$kundli-matching$q$), $q$detailed-matching$q$, $q$Detailed Matching$q$, $q$विस्तृत मिलान$q$, $q$Traditional compatibility analysis for marriage planning (Ashtakoot Guna Milan, Manglik and Nadi considerations).$q$, $q$विवाह की योजना के लिए पारंपरिक अनुकूलता विश्लेषण (अष्टकूट गुण मिलान, मांगलिक एवं नाड़ी विचार)।$q$, 110100, 5, false, ARRAY[$q$Basic analysis$q$,$q$Digital summary$q$,$q$Consultation guidance$q$]::text[], ARRAY[$q$मूल विश्लेषण$q$,$q$डिजिटल सारांश$q$,$q$परामर्श मार्गदर्शन$q$]::text[], true, 1, true, NOW())
ON CONFLICT ("serviceId","slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","pricePaise"=EXCLUDED."pricePaise","featuresEn"=EXCLUDED."featuresEn","featuresHi"=EXCLUDED."featuresHi","isPopular"=EXCLUDED."isPopular","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "Plan" ("id","serviceId","slug","titleEn","titleHi","descriptionEn","descriptionHi","pricePaise","deliveryDays","hasCall","featuresEn","featuresHi","isPopular","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('plan:kundli-matching/premium-matching'), (SELECT "id" FROM "Service" WHERE "slug"=$q$kundli-matching$q$), $q$premium-matching$q$, $q$Premium Matching$q$, $q$प्रीमियम मिलान$q$, $q$Traditional compatibility analysis for marriage planning (Ashtakoot Guna Milan, Manglik and Nadi considerations).$q$, $q$विवाह की योजना के लिए पारंपरिक अनुकूलता विश्लेषण (अष्टकूट गुण मिलान, मांगलिक एवं नाड़ी विचार)।$q$, 210100, 7, false, ARRAY[$q$Basic analysis$q$,$q$Digital summary$q$,$q$Consultation guidance$q$]::text[], ARRAY[$q$मूल विश्लेषण$q$,$q$डिजिटल सारांश$q$,$q$परामर्श मार्गदर्शन$q$]::text[], false, 2, true, NOW())
ON CONFLICT ("serviceId","slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","pricePaise"=EXCLUDED."pricePaise","featuresEn"=EXCLUDED."featuresEn","featuresHi"=EXCLUDED."featuresHi","isPopular"=EXCLUDED."isPopular","orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

UPDATE "Service" SET "isActive"=false,"updatedAt"=NOW() WHERE "slug" IN ('complete-janampatri','career-business-raj-yoga');
UPDATE "Plan" SET "isActive"=false,"updatedAt"=NOW() WHERE "slug"='milan-report';

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:puja-services'), $q$puja-services$q$, $q$Puja Services$q$, $q$पूजा सेवाएँ$q$, $q$Traditional Puja arrangements for family and spiritual requirements.$q$, $q$पारिवारिक एवं आध्यात्मिक आवश्यकताओं के लिए पारंपरिक पूजा व्यवस्था।$q$, NULL, NULL, 1, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:paath'), $q$paath$q$, $q$Paath$q$, $q$पाठ$q$, $q$Sacred religious recitation and Paath services.$q$, $q$पवित्र धार्मिक पाठ एवं पाठ सेवाएँ।$q$, NULL, NULL, 2, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:yagya-anushthan'), $q$yagya-anushthan$q$, $q$Yagya Anushthan$q$, $q$यज्ञ अनुष्ठान$q$, $q$Vedic Yagya and Anushthan arranged according to purpose.$q$, $q$उद्देश्य के अनुसार वैदिक यज्ञ एवं अनुष्ठान।$q$, NULL, NULL, 3, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:katha'), $q$katha$q$, $q$Katha$q$, $q$कथा$q$, $q$Sacred Katha and devotional discourse.$q$, $q$पवित्र कथा एवं भक्ति प्रवचन।$q$, NULL, NULL, 4, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:mantra-jap'), $q$mantra-jap$q$, $q$Mantra Jap$q$, $q$मंत्र जप$q$, $q$Traditional mantra chanting with Sankalp and prescribed count.$q$, $q$संकल्प एवं निर्धारित संख्या के साथ पारंपरिक मंत्र जप।$q$, NULL, NULL, 5, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:rudra-mahabhishek'), $q$rudra-mahabhishek$q$, $q$Rudra Mahabhishek$q$, $q$रुद्र महाभिषेक$q$, $q$Sacred Rudra Mahabhishek with Vedic mantras.$q$, $q$वैदिक मंत्रों के साथ पवित्र रुद्र महाभिषेक।$q$, NULL, NULL, 6, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:navratri-anushthan'), $q$navratri-anushthan$q$, $q$Navratri Anushthan$q$, $q$नवरात्रि अनुष्ठान$q$, $q$Special Navratri worship and spiritual observances.$q$, $q$नवरात्रि की विशेष पूजा एवं आध्यात्मिक अनुष्ठान।$q$, NULL, NULL, 7, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:bhagavad-mahapurana-gyan-yagya'), $q$bhagavad-mahapurana-gyan-yagya$q$, $q$Shrimad Bhagavad Mahapurana Gyan Yagya$q$, $q$श्रीमद्भागवत महापुराण ज्ञान यज्ञ$q$, $q$Bhagavad Mahapurana Katha and Gyan Yagya.$q$, $q$भागवत महापुराण कथा एवं ज्ञान यज्ञ।$q$, NULL, NULL, 8, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:valmiki-ramayana'), $q$valmiki-ramayana$q$, $q$Shrimad Valmiki Ramayana$q$, $q$श्रीमद् वाल्मीकि रामायण$q$, $q$Sacred recitation and Katha of Shrimad Valmiki Ramayana.$q$, $q$श्रीमद् वाल्मीकि रामायण का पवित्र पाठ एवं कथा।$q$, NULL, NULL, 9, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:astrology'), $q$astrology$q$, $q$Astrology$q$, $q$ज्योतिष$q$, $q$Personalized Vedic astrology guidance for important life decisions.$q$, $q$जीवन के महत्वपूर्ण निर्णयों के लिए व्यक्तिगत वैदिक ज्योतिष मार्गदर्शन।$q$, $q$/ref/astrology.webp$q$, NULL, 10, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:vastu-shastra'), $q$vastu-shastra$q$, $q$Vastu Shastra$q$, $q$वास्तु शास्त्र$q$, $q$Vastu guidance for homes, offices and commercial spaces.$q$, $q$घर, कार्यालय एवं व्यावसायिक स्थानों के लिए वास्तु मार्गदर्शन।$q$, $q$/ref/vastu.webp$q$, NULL, 11, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:matrimonial-service'), $q$matrimonial-service$q$, $q$Matrimonial Services$q$, $q$वैवाहिक सेवाएँ$q$, $q$Support through the Vindhya Vivah Sanskar platform (matrimonial website and Android application).$q$, $q$विंध्य विवाह संस्कार प्लेटफ़ॉर्म के माध्यम से सहयोग (वैवाहिक वेबसाइट एवं एंड्रॉइड ऐप)।$q$, NULL, $q$https://vindhyavivahsanskar.com$q$, 12, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:bharat-darshan-teerth-yatra'), $q$bharat-darshan-teerth-yatra$q$, $q$Bharat Darshan Teerth Yatra$q$, $q$भारत दर्शन तीर्थ यात्रा$q$, $q$Pilgrimage and religious-tour service support.$q$, $q$तीर्थ यात्रा एवं धार्मिक यात्रा सेवा सहयोग।$q$, NULL, $q$https://bharatdarshanmpcg.org$q$, 13, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:vehicle-service'), $q$vehicle-service$q$, $q$Vehicle Service$q$, $q$वाहन सेवा$q$, $q$Vehicle assistance for local, outstation and pilgrimage travel.$q$, $q$स्थानीय, बाहरी एवं तीर्थ यात्रा के लिए वाहन सहायता।$q$, NULL, NULL, 14, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:driver-service'), $q$driver-service$q$, $q$Driver Service$q$, $q$ड्राइवर सेवा$q$, $q$Driver assistance according to timing and availability.$q$, $q$समय एवं उपलब्धता के अनुसार ड्राइवर सहायता।$q$, NULL, NULL, 15, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "OtherService" ("id","slug","titleEn","titleHi","descriptionEn","descriptionHi","imageUrl","actionUrl","orderIndex","isActive","updatedAt")
VALUES ('cat_' || md5('other:itr-help-desk'), $q$itr-help-desk$q$, $q$Income Tax Return Filing Help Desk$q$, $q$आयकर रिटर्न फाइलिंग हेल्प डेस्क$q$, $q$ITR document coordination and filing assistance help desk.$q$, $q$आईटीआर दस्तावेज़ समन्वय एवं फाइलिंग सहायता डेस्क।$q$, NULL, NULL, 16, true, NOW())
ON CONFLICT ("slug") DO UPDATE SET "titleEn"=EXCLUDED."titleEn","titleHi"=EXCLUDED."titleHi","descriptionEn"=EXCLUDED."descriptionEn","descriptionHi"=EXCLUDED."descriptionHi","imageUrl"=COALESCE(EXCLUDED."imageUrl","OtherService"."imageUrl"),"actionUrl"=COALESCE(EXCLUDED."actionUrl","OtherService"."actionUrl"),"orderIndex"=EXCLUDED."orderIndex","isActive"=true,"updatedAt"=NOW();

INSERT INTO "FaqItem" ("id","questionEn","questionHi","answerEn","answerHi","category","orderIndex","isActive","updatedAt")
SELECT 'cat_' || md5('faq:0'), $q$What details are required for Janam Kundli?$q$, $q$जन्म कुंडली के लिए कौन-सा विवरण चाहिए?$q$, $q$Full name, date of birth, exact time of birth and place of birth are normally required.$q$, $q$पूरा नाम, जन्म तिथि, जन्म का सही समय और जन्म स्थान सामान्यतः आवश्यक होते हैं।$q$, $q$KUNDLI$q$, 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "FaqItem" WHERE "questionEn"=$q$What details are required for Janam Kundli?$q$);

INSERT INTO "FaqItem" ("id","questionEn","questionHi","answerEn","answerHi","category","orderIndex","isActive","updatedAt")
SELECT 'cat_' || md5('faq:1'), $q$How does Prashn Kundli work?$q$, $q$प्रश्न कुंडली कैसे काम करती है?$q$, $q$Choose a plan, submit one clear question and confirm the consultation timing.$q$, $q$योजना चुनें, एक स्पष्ट प्रश्न भेजें और परामर्श का समय पक्का करें।$q$, $q$KUNDLI$q$, 2, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "FaqItem" WHERE "questionEn"=$q$How does Prashn Kundli work?$q$);

INSERT INTO "FaqItem" ("id","questionEn","questionHi","answerEn","answerHi","category","orderIndex","isActive","updatedAt")
SELECT 'cat_' || md5('faq:2'), $q$Can I book through WhatsApp?$q$, $q$क्या मैं व्हाट्सऐप से बुकिंग कर सकता हूँ?$q$, $q$Yes. Booking buttons prepare a WhatsApp enquiry.$q$, $q$हाँ। बुकिंग बटन से व्हाट्सऐप पर पूछताछ तैयार हो जाती है।$q$, $q$GENERAL$q$, 3, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "FaqItem" WHERE "questionEn"=$q$Can I book through WhatsApp?$q$);

INSERT INTO "FaqItem" ("id","questionEn","questionHi","answerEn","answerHi","category","orderIndex","isActive","updatedAt")
SELECT 'cat_' || md5('faq:3'), $q$Are Vehicle and Driver services available?$q$, $q$क्या वाहन और ड्राइवर सेवाएँ उपलब्ध हैं?$q$, $q$Yes, subject to route, timing and availability.$q$, $q$हाँ, मार्ग, समय और उपलब्धता के अनुसार।$q$, $q$GENERAL$q$, 4, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "FaqItem" WHERE "questionEn"=$q$Are Vehicle and Driver services available?$q$);

INSERT INTO "FaqItem" ("id","questionEn","questionHi","answerEn","answerHi","category","orderIndex","isActive","updatedAt")
SELECT 'cat_' || md5('faq:4'), $q$How is payment handled?$q$, $q$भुगतान कैसे होता है?$q$, $q$Confirm the service, schedule and final fee before payment.$q$, $q$भुगतान से पहले सेवा, समय और अंतिम शुल्क की पुष्टि करें।$q$, $q$PAYMENT$q$, 5, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "FaqItem" WHERE "questionEn"=$q$How is payment handled?$q$);

UPDATE "MarqueeItem" SET "textEn"=$q$Vedic Astrology • Janam Kundli • Prashn Kundli • Kundli Matching • Puja • Paath • Yagya • Vastu • Call +91 98279 91224$q$, "textHi"=$q$वैदिक ज्योतिष • जन्म कुंडली • प्रश्न कुंडली • कुंडली मिलान • पूजा • पाठ • यज्ञ • वास्तु • संपर्क +91 98279 91224$q$
WHERE "id" = (SELECT "id" FROM "MarqueeItem" WHERE "textEn" LIKE '%Dashashwamedh%' ORDER BY "createdAt" LIMIT 1);
UPDATE "MarqueeItem" SET "textEn"=$q$Book online or enquire on WhatsApp • Matrimonial and Bharat Darshan services available • Bhilai, Durg, Chhattisgarh$q$, "textHi"=$q$ऑनलाइन बुक करें या व्हाट्सऐप पर पूछें • वैवाहिक एवं भारत दर्शन सेवाएँ उपलब्ध • भिलाई, दुर्ग, छत्तीसगढ़$q$
WHERE "textEn" LIKE '%Surya Siddhanta%';
UPDATE "Banner" SET "isActive"=false WHERE "imageUrl" LIKE '/images/banner-%';
UPDATE "MediaGalleryItem" SET "isActive"=false WHERE "imageUrl" LIKE '/images/gallery-%';
UPDATE "Testimonial" SET "isActive"=false WHERE "authorNameEn" LIKE 'Sample Client%';
UPDATE "Offer" SET "isActive"=false WHERE "code" IN ('SHUBH500','JYOTISH500');
UPDATE "AdminSettings" SET
  "email"='sntiwarigevra61@gmail.com',
  "addressEn"='Bhilai, Durg, Chhattisgarh',
  "addressHi"='भिलाई, दुर्ग, छत्तीसगढ़',
  "city"='Bhilai',
  "latitude"=21.2092,
  "longitude"=81.3784,
  "mapLatitude"=21.2092,
  "mapLongitude"=81.3784,
  "mapLabelEn"='Maharshi Kanad Jyotish Kendra, Bhilai',
  "mapLabelHi"='महर्षि कणाद ज्योतिष केंद्र, भिलाई',
  "updatedAt"=NOW()
WHERE "id"='default' AND "addressEn" LIKE 'Kanad Bhavan%';
