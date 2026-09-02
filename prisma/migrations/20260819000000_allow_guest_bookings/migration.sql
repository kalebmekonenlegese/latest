-- Allow bookings to be created without an account.
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";

ALTER TABLE "Booking" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "Booking" ADD COLUMN "rooms" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "RoomInventory" (
  "id" TEXT NOT NULL,
  "roomType" TEXT NOT NULL,
  "totalRooms" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RoomInventory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RoomInventory_roomType_key" ON "RoomInventory"("roomType");

INSERT INTO "RoomInventory" ("id", "roomType", "totalRooms", "updatedAt") VALUES
  ('inventory_standard_room', 'standard-room', 5, CURRENT_TIMESTAMP),
  ('inventory_deluxe_room', 'deluxe-room', 3, CURRENT_TIMESTAMP),
  ('inventory_executive_suite', 'executive-suite', 2, CURRENT_TIMESTAMP),
  ('inventory_family_room', 'family-room', 4, CURRENT_TIMESTAMP);