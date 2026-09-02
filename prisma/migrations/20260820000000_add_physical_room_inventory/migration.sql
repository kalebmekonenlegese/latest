-- Persist each physical room so capacity and operational status are queryable.
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE');

CREATE TABLE "Room" (
  "id" TEXT NOT NULL,
  "roomNumber" TEXT NOT NULL,
  "roomType" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Room_roomNumber_key" ON "Room"("roomNumber");
CREATE INDEX "Room_roomType_status_idx" ON "Room"("roomType", "status");

ALTER TABLE "Room"
  ADD CONSTRAINT "Room_roomType_fkey"
  FOREIGN KEY ("roomType") REFERENCES "RoomInventory"("roomType")
  ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Room" ("id", "roomNumber", "roomType", "capacity", "updatedAt") VALUES
  ('room_standard_101', '101', 'standard-room', 2, CURRENT_TIMESTAMP),
  ('room_standard_102', '102', 'standard-room', 2, CURRENT_TIMESTAMP),
  ('room_standard_103', '103', 'standard-room', 2, CURRENT_TIMESTAMP),
  ('room_standard_104', '104', 'standard-room', 2, CURRENT_TIMESTAMP),
  ('room_standard_105', '105', 'standard-room', 2, CURRENT_TIMESTAMP),
  ('room_deluxe_201', '201', 'deluxe-room', 2, CURRENT_TIMESTAMP),
  ('room_deluxe_202', '202', 'deluxe-room', 2, CURRENT_TIMESTAMP),
  ('room_deluxe_203', '203', 'deluxe-room', 2, CURRENT_TIMESTAMP),
  ('room_executive_301', '301', 'executive-suite', 3, CURRENT_TIMESTAMP),
  ('room_executive_302', '302', 'executive-suite', 3, CURRENT_TIMESTAMP),
  ('room_family_401', '401', 'family-room', 4, CURRENT_TIMESTAMP),
  ('room_family_402', '402', 'family-room', 4, CURRENT_TIMESTAMP),
  ('room_family_403', '403', 'family-room', 4, CURRENT_TIMESTAMP),
  ('room_family_404', '404', 'family-room', 4, CURRENT_TIMESTAMP);
