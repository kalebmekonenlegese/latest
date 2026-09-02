-- Store the authoritative nightly price alongside room inventory.
ALTER TABLE "RoomInventory"
  ADD COLUMN "pricePerNight" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "RoomInventory"
SET "pricePerNight" = CASE "roomType"
  WHEN 'standard-room' THEN 145
  WHEN 'deluxe-room' THEN 195
  WHEN 'executive-suite' THEN 285
  WHEN 'family-room' THEN 250
  ELSE 0
END;