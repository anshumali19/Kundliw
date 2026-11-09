-- An "other service" can point to a bookable service, so it uses that service's packages, plans and offers
ALTER TABLE "OtherService" ADD COLUMN "serviceSlug" TEXT;
