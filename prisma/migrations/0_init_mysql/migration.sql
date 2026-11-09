-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `passwordHash` TEXT NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` TEXT NULL,
    `role` ENUM('USER', 'ADMIN', 'ASSOCIATE') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` TEXT NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` MEDIUMTEXT NULL,
    `access_token` MEDIUMTEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` TEXT NULL,
    `scope` TEXT NULL,
    `id_token` MEDIUMTEXT NULL,
    `session_state` TEXT NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OtpVerification` (
    `id` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `otpHash` TEXT NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `consumedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OtpVerification_phone_createdAt_idx`(`phone`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `titleEn` TEXT NOT NULL,
    `titleHi` TEXT NOT NULL,
    `taglineEn` TEXT NULL,
    `taglineHi` TEXT NULL,
    `descriptionEn` MEDIUMTEXT NOT NULL,
    `descriptionHi` MEDIUMTEXT NOT NULL,
    `highlightsEn` JSON NULL,
    `highlightsHi` JSON NULL,
    `notesEn` MEDIUMTEXT NULL,
    `notesHi` MEDIUMTEXT NULL,
    `icon` TEXT NULL,
    `imageUrl` TEXT NULL,
    `itineraryEn` MEDIUMTEXT NULL,
    `itineraryHi` MEDIUMTEXT NULL,
    `samagriEn` MEDIUMTEXT NULL,
    `samagriHi` MEDIUMTEXT NULL,
    `youtubeUrl` TEXT NULL,
    `additionalLinks` JSON NULL,
    `demos` JSON NULL,
    `externalPayUrl` TEXT NULL,
    `externalPayNoteEn` TEXT NULL,
    `externalPayNoteHi` TEXT NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Service_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServicePackage` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `titleEn` TEXT NOT NULL,
    `titleHi` TEXT NOT NULL,
    `descriptionEn` MEDIUMTEXT NULL,
    `descriptionHi` MEDIUMTEXT NULL,
    `numberOfDays` INTEGER NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `seats` INTEGER NULL,
    `itineraryDays` JSON NULL,
    `inclusionsEn` JSON NULL,
    `inclusionsHi` JSON NULL,
    `exclusionsEn` JSON NULL,
    `exclusionsHi` JSON NULL,
    `materialsEn` JSON NULL,
    `materialsHi` JSON NULL,
    `youtubeUrl` TEXT NULL,
    `imageUrl` TEXT NULL,
    `additionalLinks` JSON NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ServicePackage_serviceId_slug_key`(`serviceId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NULL,
    `slug` VARCHAR(191) NOT NULL,
    `titleEn` TEXT NOT NULL,
    `titleHi` TEXT NOT NULL,
    `descriptionEn` MEDIUMTEXT NOT NULL,
    `descriptionHi` MEDIUMTEXT NOT NULL,
    `pricePaise` INTEGER NOT NULL,
    `originalPricePaise` INTEGER NULL,
    `deliveryDays` INTEGER NOT NULL DEFAULT 3,
    `pages` INTEGER NULL,
    `hasCall` BOOLEAN NOT NULL DEFAULT false,
    `callDurationMinutes` INTEGER NULL,
    `featuresEn` JSON NULL,
    `featuresHi` JSON NULL,
    `programEn` MEDIUMTEXT NULL,
    `programHi` MEDIUMTEXT NULL,
    `preparationEn` MEDIUMTEXT NULL,
    `preparationHi` MEDIUMTEXT NULL,
    `samagriEn` MEDIUMTEXT NULL,
    `samagriHi` MEDIUMTEXT NULL,
    `itineraryEn` MEDIUMTEXT NULL,
    `itineraryHi` MEDIUMTEXT NULL,
    `imageUrl` TEXT NULL,
    `youtubeUrl` TEXT NULL,
    `additionalLinks` JSON NULL,
    `isPopular` BOOLEAN NOT NULL DEFAULT false,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Plan_serviceId_slug_key`(`serviceId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Offer` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `titleEn` TEXT NOT NULL,
    `titleHi` TEXT NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'FLAT') NOT NULL DEFAULT 'FLAT',
    `discountValuePaise` INTEGER NOT NULL,
    `maxDiscountPaise` INTEGER NULL,
    `minOrderValuePaise` INTEGER NOT NULL DEFAULT 0,
    `usageLimit` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `perUserLimit` INTEGER NOT NULL DEFAULT 1,
    `serviceSlugs` JSON NULL,
    `planIds` JSON NULL,
    `showOnPlan` BOOLEAN NOT NULL DEFAULT false,
    `autoApply` BOOLEAN NOT NULL DEFAULT false,
    `showInPopup` BOOLEAN NOT NULL DEFAULT true,
    `validFrom` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `validUntil` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Offer_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `serviceId` VARCHAR(191) NULL,
    `planId` VARCHAR(191) NULL,
    `extraPlanIds` JSON NULL,
    `offerId` VARCHAR(191) NULL,
    `offerCode` TEXT NULL,
    `slotId` VARCHAR(191) NULL,
    `requestType` ENUM('SERVICE_BOOKING', 'KUNDLI_REQUEST', 'KUNDLI_MATCHING', 'PRASHNA_KUNDLI') NOT NULL DEFAULT 'SERVICE_BOOKING',
    `status` ENUM('ORDER_RECEIVED', 'KUNDLI_IN_PROGRESS', 'KUNDLI_COMPLETE', 'DISPATCHED', 'DELIVERED', 'EXECUTION_COMPLETE') NOT NULL DEFAULT 'ORDER_RECEIVED',
    `jatakaDetails` JSON NOT NULL,
    `baseAmountPaise` INTEGER NOT NULL,
    `discountAmountPaise` INTEGER NOT NULL DEFAULT 0,
    `taxableAmountPaise` INTEGER NOT NULL,
    `gstRateBasisPoints` INTEGER NOT NULL DEFAULT 1800,
    `gstAmountPaise` INTEGER NOT NULL,
    `netAmountPaise` INTEGER NOT NULL,
    `invoiceNumber` VARCHAR(191) NULL,
    `gstin` TEXT NULL,
    `paymentMode` ENUM('RAZORPAY', 'MANUAL_UPI', 'MANUAL_BANK', 'MANUAL_QR') NOT NULL DEFAULT 'RAZORPAY',
    `paymentStatus` ENUM('PENDING', 'AWAITING_VERIFICATION', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `idempotencyKey` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `rejectionReason` MEDIUMTEXT NULL,
    `razorpayOrderId` TEXT NULL,
    `razorpayPaymentId` TEXT NULL,
    `razorpaySignature` TEXT NULL,
    `manualPaymentProof` TEXT NULL,
    `manualPaymentRef` TEXT NULL,
    `associateId` VARCHAR(191) NULL,
    `appointmentStatus` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') NULL,
    `appointmentNote` MEDIUMTEXT NULL,
    `cancelledAt` DATETIME(3) NULL,
    `cancelReason` MEDIUMTEXT NULL,
    `cancelledBy` TEXT NULL,
    `refundStatus` TEXT NULL,
    `refundAmountPaise` INTEGER NULL,
    `refundedAt` DATETIME(3) NULL,
    `upgradeFromOrderId` VARCHAR(191) NULL,
    `courierName` TEXT NULL,
    `trackingNumber` TEXT NULL,
    `adminNotes` MEDIUMTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    UNIQUE INDEX `Order_invoiceNumber_key`(`invoiceNumber`),
    UNIQUE INDEX `Order_idempotencyKey_key`(`idempotencyKey`),
    INDEX `Order_userId_idx`(`userId`),
    INDEX `Order_status_idx`(`status`),
    INDEX `Order_associateId_idx`(`associateId`),
    INDEX `Order_upgradeFromOrderId_idx`(`upgradeFromOrderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderExtraPlan` (
    `orderId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,

    INDEX `OrderExtraPlan_planId_idx`(`planId`),
    PRIMARY KEY (`orderId`, `planId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderStatusEvent` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `status` ENUM('ORDER_RECEIVED', 'KUNDLI_IN_PROGRESS', 'KUNDLI_COMPLETE', 'DISPATCHED', 'DELIVERED', 'EXECUTION_COMPLETE') NOT NULL,
    `note` TEXT NULL,
    `changedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderStatusEvent_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Slot` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `startTime` TEXT NOT NULL,
    `endTime` TEXT NOT NULL,
    `capacity` INTEGER NOT NULL DEFAULT 1,
    `bookedCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Slot_date_isActive_idx`(`date`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssociateProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `referralCode` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
    `rejectionReason` MEDIUMTEXT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `notes` MEDIUMTEXT NULL,
    `customCommissionType` ENUM('PERCENTAGE', 'FLAT') NULL,
    `customCommissionValue` INTEGER NULL,
    `payoutUpi` TEXT NULL,
    `payoutAccountHolder` TEXT NULL,
    `payoutAccountNumber` TEXT NULL,
    `payoutIfsc` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AssociateProfile_userId_key`(`userId`),
    UNIQUE INDEX `AssociateProfile_referralCode_key`(`referralCode`),
    INDEX `AssociateProfile_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommissionRule` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NULL,
    `planId` VARCHAR(191) NULL,
    `type` ENUM('PERCENTAGE', 'FLAT') NOT NULL,
    `value` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CommissionRule_serviceId_idx`(`serviceId`),
    INDEX `CommissionRule_planId_idx`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commission` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `associateId` VARCHAR(191) NOT NULL,
    `amountPaise` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'EARNED', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `payoutId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Commission_orderId_key`(`orderId`),
    INDEX `Commission_associateId_status_idx`(`associateId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayoutRequest` (
    `id` VARCHAR(191) NOT NULL,
    `associateId` VARCHAR(191) NOT NULL,
    `amountPaise` INTEGER NOT NULL,
    `status` ENUM('REQUESTED', 'PAID', 'REJECTED') NOT NULL DEFAULT 'REQUESTED',
    `note` MEDIUMTEXT NULL,
    `paymentReference` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,

    INDEX `PayoutRequest_associateId_status_idx`(`associateId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Counter` (
    `id` VARCHAR(191) NOT NULL,
    `seq` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcessedWebhookEvent` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `eventType` TEXT NOT NULL,
    `processedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ProcessedWebhookEvent_eventId_key`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VaultFile` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `titleEn` TEXT NOT NULL,
    `titleHi` TEXT NOT NULL,
    `fileName` TEXT NOT NULL,
    `storageKey` TEXT NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL DEFAULT 'application/pdf',
    `uploadedByRole` VARCHAR(191) NOT NULL DEFAULT 'ADMIN',
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VaultFile_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RateLimit` (
    `id` VARCHAR(191) NOT NULL,
    `scope` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 1,
    `windowEnd` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RateLimit_scope_identifier_windowEnd_idx`(`scope`, `identifier`, `windowEnd`),
    UNIQUE INDEX `RateLimit_scope_identifier_key`(`scope`, `identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `siteNameEn` TEXT NULL,
    `siteNameHi` TEXT NULL,
    `phone1` TEXT NULL,
    `phone2` TEXT NULL,
    `email` TEXT NULL,
    `addressEn` MEDIUMTEXT NULL,
    `addressHi` MEDIUMTEXT NULL,
    `city` TEXT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `timezone` TEXT NULL,
    `upiVpa` TEXT NULL,
    `bankAccountName` TEXT NULL,
    `bankAccountNumber` TEXT NULL,
    `bankIfsc` TEXT NULL,
    `bankName` TEXT NULL,
    `qrCodeUrl` TEXT NULL,
    `gstin` TEXT NULL,
    `defaultGstRateBps` INTEGER NULL DEFAULT 1800,
    `socialFacebook` TEXT NULL,
    `socialTwitter` TEXT NULL,
    `socialInstagram` TEXT NULL,
    `socialYoutube` TEXT NULL,
    `socialWhatsapp` TEXT NULL,
    `socialTelegram` TEXT NULL,
    `googleMapEmbedUrl` MEDIUMTEXT NULL,
    `googleAnalyticsId` TEXT NULL,
    `encRazorpayKeyId` TEXT NULL,
    `encRazorpayKeySecret` TEXT NULL,
    `encRazorpayWebhookSecret` TEXT NULL,
    `encMsg91AuthKey` TEXT NULL,
    `encMsg91SenderId` TEXT NULL,
    `encMsg91OtpTemplateId` TEXT NULL,
    `encSmtpHost` TEXT NULL,
    `encSmtpPort` INTEGER NULL,
    `encSmtpUser` TEXT NULL,
    `encSmtpPass` TEXT NULL,
    `encSmtpFrom` TEXT NULL,
    `encGoogleClientId` TEXT NULL,
    `encGoogleClientSecret` TEXT NULL,
    `encFacebookAppId` TEXT NULL,
    `encFacebookAppSecret` TEXT NULL,
    `encAstrosageUserId` TEXT NULL,
    `encAstrosageApiKey` TEXT NULL,
    `encWhatsappAccessToken` TEXT NULL,
    `encWhatsappPhoneNumberId` TEXT NULL,
    `encWhatsappVerifyToken` TEXT NULL,
    `encWhatsappAppSecret` TEXT NULL,
    `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
    `maintenanceMessageEn` TEXT NULL,
    `maintenanceMessageHi` TEXT NULL,
    `astrosageEmbedUrl` VARCHAR(1000) NULL DEFAULT 'https://www.astrosage.com/freekundli/',
    `appDownloadUrl` TEXT NULL,
    `mapEnabled` BOOLEAN NOT NULL DEFAULT true,
    `mapZoom` INTEGER NOT NULL DEFAULT 15,
    `mapLatitude` DOUBLE NULL,
    `mapLongitude` DOUBLE NULL,
    `mapLabelEn` TEXT NULL,
    `mapLabelHi` TEXT NULL,
    `associatesEnabled` BOOLEAN NOT NULL DEFAULT true,
    `associateAutoApprove` BOOLEAN NOT NULL DEFAULT false,
    `associateMinPayoutPaise` INTEGER NOT NULL DEFAULT 50000,
    `associateReferralDays` INTEGER NOT NULL DEFAULT 30,
    `associateTermsEn` MEDIUMTEXT NULL,
    `associateTermsHi` MEDIUMTEXT NULL,
    `backupAutoEnabled` BOOLEAN NOT NULL DEFAULT true,
    `backupKeepDaily` INTEGER NOT NULL DEFAULT 7,
    `backupKeepWeekly` INTEGER NOT NULL DEFAULT 4,
    `backupKeepMonthly` INTEGER NOT NULL DEFAULT 12,
    `chatbotEnabled` BOOLEAN NOT NULL DEFAULT true,
    `chatbotWelcomeEn` MEDIUMTEXT NULL,
    `chatbotWelcomeHi` MEDIUMTEXT NULL,
    `whatsappNumber` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatbotQA` (
    `id` VARCHAR(191) NOT NULL,
    `questionEn` MEDIUMTEXT NOT NULL,
    `questionHi` MEDIUMTEXT NOT NULL,
    `answerEn` MEDIUMTEXT NOT NULL,
    `answerHi` MEDIUMTEXT NOT NULL,
    `keywords` JSON NULL,
    `quickReplyEn` TEXT NULL,
    `quickReplyHi` TEXT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'GENERAL',
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ChatbotQA_category_isActive_idx`(`category`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactEnquiry` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `email` TEXT NULL,
    `phone` TEXT NOT NULL,
    `subject` TEXT NULL,
    `message` MEDIUMTEXT NOT NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'CONTACT_PAGE',
    `isResolved` BOOLEAN NOT NULL DEFAULT false,
    `leadStatus` VARCHAR(191) NOT NULL DEFAULT 'NEW',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ContactEnquiry_isResolved_createdAt_idx`(`isResolved`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MarqueeItem` (
    `id` VARCHAR(191) NOT NULL,
    `textEn` TEXT NOT NULL,
    `textHi` TEXT NOT NULL,
    `speedSec` INTEGER NOT NULL DEFAULT 30,
    `fontSize` INTEGER NOT NULL DEFAULT 13,
    `bgColor` VARCHAR(100) NOT NULL DEFAULT 'var(--secondary)',
    `textColor` VARCHAR(100) NOT NULL DEFAULT 'var(--on-secondary)',
    `position` ENUM('TOP', 'BOTTOM') NOT NULL DEFAULT 'BOTTOM',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `pauseOnHover` BOOLEAN NOT NULL DEFAULT true,
    `allowClose` BOOLEAN NOT NULL DEFAULT true,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Banner` (
    `id` VARCHAR(191) NOT NULL,
    `titleEn` TEXT NOT NULL,
    `titleHi` TEXT NOT NULL,
    `subtitleEn` TEXT NULL,
    `subtitleHi` TEXT NULL,
    `imageUrl` TEXT NOT NULL,
    `linkUrl` TEXT NULL,
    `position` ENUM('TOP', 'BOTTOM', 'LEFT', 'RIGHT') NOT NULL DEFAULT 'RIGHT',
    `type` ENUM('STATIC', 'CAROUSEL') NOT NULL DEFAULT 'STATIC',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPost` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `titleEn` TEXT NOT NULL,
    `titleHi` TEXT NOT NULL,
    `excerptEn` MEDIUMTEXT NULL,
    `excerptHi` MEDIUMTEXT NULL,
    `contentEn` MEDIUMTEXT NOT NULL,
    `contentHi` MEDIUMTEXT NOT NULL,
    `coverImage` TEXT NULL,
    `youtubeUrl` TEXT NULL,
    `additionalLinks` JSON NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OtherService` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `titleEn` TEXT NOT NULL,
    `titleHi` TEXT NOT NULL,
    `taglineEn` TEXT NULL,
    `taglineHi` TEXT NULL,
    `descriptionEn` MEDIUMTEXT NOT NULL,
    `descriptionHi` MEDIUMTEXT NOT NULL,
    `imageUrl` TEXT NULL,
    `actionUrl` TEXT NULL,
    `serviceSlug` TEXT NULL,
    `actionTextEn` VARCHAR(500) NULL DEFAULT 'Visit Portal / Learn More',
    `actionTextHi` VARCHAR(500) NULL DEFAULT 'पोर्टल पर जाएं / विवरण देखें',
    `natureEn` TEXT NULL,
    `natureHi` TEXT NULL,
    `numberOfDays` INTEGER NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `itineraryDays` JSON NULL,
    `facebookUrl` TEXT NULL,
    `whatsappGroupUrl` TEXT NULL,
    `demos` JSON NULL,
    `youtubeUrl` TEXT NULL,
    `additionalLinks` JSON NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OtherService_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Testimonial` (
    `id` VARCHAR(191) NOT NULL,
    `authorNameEn` TEXT NOT NULL,
    `authorNameHi` TEXT NOT NULL,
    `authorTitleEn` TEXT NOT NULL,
    `authorTitleHi` TEXT NOT NULL,
    `cityEn` TEXT NOT NULL,
    `cityHi` TEXT NOT NULL,
    `quoteEn` MEDIUMTEXT NOT NULL,
    `quoteHi` MEDIUMTEXT NOT NULL,
    `rating` INTEGER NOT NULL DEFAULT 5,
    `isVerified` BOOLEAN NOT NULL DEFAULT true,
    `photoUrl` TEXT NULL,
    `youtubeUrl` TEXT NULL,
    `additionalLinks` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaGalleryItem` (
    `id` VARCHAR(191) NOT NULL,
    `titleEn` TEXT NOT NULL,
    `titleHi` TEXT NOT NULL,
    `captionEn` TEXT NULL,
    `captionHi` TEXT NULL,
    `imageUrl` TEXT NOT NULL,
    `videoUrl` TEXT NULL,
    `mediaType` VARCHAR(191) NOT NULL DEFAULT 'IMAGE',
    `externalLink` TEXT NULL,
    `additionalLinks` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FounderProfile` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `nameEn` VARCHAR(500) NOT NULL DEFAULT 'Founder Name',
    `nameHi` VARCHAR(500) NOT NULL DEFAULT 'संस्थापक का नाम',
    `designationEn` VARCHAR(500) NOT NULL DEFAULT 'Founder & Chief Astrologer',
    `designationHi` VARCHAR(500) NOT NULL DEFAULT 'संस्थापक एवं मुख्य ज्योतिषाचार्य',
    `roleEn` VARCHAR(500) NOT NULL DEFAULT 'Vedic Astrological Guidance & Direction',
    `roleHi` VARCHAR(500) NOT NULL DEFAULT 'वैदिक ज्योतिष मार्गदर्शन एवं दिशा-निर्देशन',
    `photoUrl` TEXT NULL,
    `bioEn` MEDIUMTEXT NOT NULL,
    `bioHi` MEDIUMTEXT NOT NULL,
    `youtubeUrl` TEXT NULL,
    `additionalLinks` JSON NULL,
    `blocks` JSON NULL,
    `footerNoteEn` MEDIUMTEXT NULL,
    `footerNoteHi` MEDIUMTEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FaqItem` (
    `id` VARCHAR(191) NOT NULL,
    `questionEn` TEXT NOT NULL,
    `questionHi` TEXT NOT NULL,
    `answerEn` MEDIUMTEXT NOT NULL,
    `answerHi` MEDIUMTEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'GENERAL',
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FaqItem_category_isActive_orderIndex_idx`(`category`, `isActive`, `orderIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StaticPage` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `titleEn` TEXT NOT NULL,
    `titleHi` TEXT NOT NULL,
    `contentEn` MEDIUMTEXT NOT NULL,
    `contentHi` MEDIUMTEXT NOT NULL,
    `blocks` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `showInFooter` BOOLEAN NOT NULL DEFAULT false,
    `showInMenu` BOOLEAN NOT NULL DEFAULT false,
    `metaDescEn` MEDIUMTEXT NULL,
    `metaDescHi` MEDIUMTEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StaticPage_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PanchangCache` (
    `id` VARCHAR(191) NOT NULL,
    `dateString` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `dataJson` JSON NOT NULL,
    `cachedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PanchangCache_dateString_city_key`(`dateString`, `city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TranslationOverride` (
    `id` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `namespace` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` MEDIUMTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TranslationOverride_locale_namespace_idx`(`locale`, `namespace`),
    UNIQUE INDEX `TranslationOverride_locale_namespace_key_key`(`locale`, `namespace`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Credential` (
    `id` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL DEFAULT 'OTHER',
    `titleEn` TEXT NOT NULL,
    `titleHi` TEXT NOT NULL,
    `descriptionEn` MEDIUMTEXT NULL,
    `descriptionHi` MEDIUMTEXT NULL,
    `documentNumber` TEXT NULL,
    `fileUrl` TEXT NOT NULL,
    `fileName` TEXT NOT NULL,
    `mimeType` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BackupRecord` (
    `id` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `tables` INTEGER NOT NULL DEFAULT 0,
    `rows` INTEGER NOT NULL DEFAULT 0,
    `data` LONGBLOB NOT NULL,
    `createdBy` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BackupRecord_kind_createdAt_idx`(`kind`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteConfig` (
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMember` (
    `id` VARCHAR(191) NOT NULL,
    `nameEn` TEXT NOT NULL,
    `nameHi` TEXT NOT NULL,
    `roleEn` TEXT NOT NULL,
    `roleHi` TEXT NOT NULL,
    `bioEn` MEDIUMTEXT NULL,
    `bioHi` MEDIUMTEXT NULL,
    `photoUrl` TEXT NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppMessage` (
    `id` VARCHAR(191) NOT NULL,
    `waMessageId` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NOT NULL,
    `contactName` TEXT NULL,
    `direction` TEXT NOT NULL,
    `body` MEDIUMTEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'RECEIVED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WhatsAppMessage_waMessageId_key`(`waMessageId`),
    INDEX `WhatsAppMessage_contactPhone_createdAt_idx`(`contactPhone`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatrimonyProfile` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `phone` TEXT NOT NULL,
    `gender` VARCHAR(191) NOT NULL DEFAULT 'FEMALE',
    `dob` TEXT NULL,
    `city` TEXT NULL,
    `about` MEDIUMTEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `isPaidMember` BOOLEAN NOT NULL DEFAULT false,
    `paidUntil` DATETIME(3) NULL,
    `notes` MEDIUMTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MatrimonyProfile_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TravelVehicle` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `number` TEXT NOT NULL,
    `seats` INTEGER NOT NULL DEFAULT 4,
    `driverName` TEXT NULL,
    `driverPhone` TEXT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TravelRequest` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `phone` TEXT NOT NULL,
    `destination` TEXT NOT NULL,
    `travelDate` DATETIME(3) NULL,
    `passengers` INTEGER NOT NULL DEFAULT 1,
    `vehicleId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'NEW',
    `notes` MEDIUMTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TravelRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxCase` (
    `id` VARCHAR(191) NOT NULL,
    `clientName` TEXT NOT NULL,
    `phone` TEXT NOT NULL,
    `assessmentYear` TEXT NOT NULL,
    `docType` TEXT NOT NULL,
    `documentUrl` TEXT NULL,
    `filingStatus` VARCHAR(191) NOT NULL DEFAULT 'RECEIVED',
    `ackNumber` TEXT NULL,
    `notes` MEDIUMTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TaxCase_filingStatus_idx`(`filingStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportTicket` (
    `id` VARCHAR(191) NOT NULL,
    `ticketNumber` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `subject` TEXT NOT NULL,
    `orderNumber` TEXT NULL,
    `topic` TEXT NULL,
    `contactName` TEXT NULL,
    `contactEmail` TEXT NULL,
    `contactPhone` TEXT NULL,
    `contactAddress` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SupportTicket_ticketNumber_key`(`ticketNumber`),
    INDEX `SupportTicket_userId_idx`(`userId`),
    INDEX `SupportTicket_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportTicketMessage` (
    `id` VARCHAR(191) NOT NULL,
    `ticketId` VARCHAR(191) NOT NULL,
    `fromAdmin` BOOLEAN NOT NULL DEFAULT false,
    `body` MEDIUMTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SupportTicketMessage_ticketId_createdAt_idx`(`ticketId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicePackage` ADD CONSTRAINT `ServicePackage_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `ServicePackage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `Offer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `Slot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_associateId_fkey` FOREIGN KEY (`associateId`) REFERENCES `AssociateProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderExtraPlan` ADD CONSTRAINT `OrderExtraPlan_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStatusEvent` ADD CONSTRAINT `OrderStatusEvent_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStatusEvent` ADD CONSTRAINT `OrderStatusEvent_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssociateProfile` ADD CONSTRAINT `AssociateProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_associateId_fkey` FOREIGN KEY (`associateId`) REFERENCES `AssociateProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_payoutId_fkey` FOREIGN KEY (`payoutId`) REFERENCES `PayoutRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayoutRequest` ADD CONSTRAINT `PayoutRequest_associateId_fkey` FOREIGN KEY (`associateId`) REFERENCES `AssociateProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VaultFile` ADD CONSTRAINT `VaultFile_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VaultFile` ADD CONSTRAINT `VaultFile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TravelRequest` ADD CONSTRAINT `TravelRequest_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `TravelVehicle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportTicket` ADD CONSTRAINT `SupportTicket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportTicketMessage` ADD CONSTRAINT `SupportTicketMessage_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `SupportTicket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

