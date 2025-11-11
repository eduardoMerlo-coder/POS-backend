/*
  Warnings:

  - You are about to drop the column `depleted_date` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `entry_date` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `stock_quantity` on the `ProductVariant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[businessTypeId,userId,name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[barcode]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `businessTypeId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessTypeId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MovementType" AS ENUM ('ENTRY', 'SALE', 'ADJUSTMENT', 'RETURN');

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_user_id_fkey";

-- DropIndex
DROP INDEX "public"."Category_name_key";

-- DropIndex
DROP INDEX "public"."Product_user_id_barcode_key";

-- DropIndex
DROP INDEX "public"."Product_user_id_idx";

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "businessTypeId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "depleted_date",
DROP COLUMN "entry_date",
DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "public"."ProductVariant" DROP COLUMN "imageUrl",
DROP COLUMN "price",
DROP COLUMN "stock_quantity";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "businessTypeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."UserProductVariant" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "variantId" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductImage" (
    "id" SERIAL NOT NULL,
    "variantId" INTEGER NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryBatch" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplier" TEXT,
    "note" TEXT,

    CONSTRAINT "InventoryBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryMovement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "batchId" INTEGER,
    "variantId" INTEGER NOT NULL,
    "type" "public"."MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BusinessType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BusinessType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProductVariant_userId_variantId_key" ON "public"."UserProductVariant"("userId", "variantId");

-- CreateIndex
CREATE INDEX "ProductImage_variantId_idx" ON "public"."ProductImage"("variantId");

-- CreateIndex
CREATE INDEX "InventoryMovement_userId_idx" ON "public"."InventoryMovement"("userId");

-- CreateIndex
CREATE INDEX "InventoryMovement_variantId_idx" ON "public"."InventoryMovement"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessType_name_key" ON "public"."BusinessType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_businessTypeId_userId_name_key" ON "public"."Category"("businessTypeId", "userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_key" ON "public"."Product"("barcode");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "public"."BusinessType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProductVariant" ADD CONSTRAINT "UserProductVariant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProductVariant" ADD CONSTRAINT "UserProductVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "public"."BusinessType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductImage" ADD CONSTRAINT "ProductImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryBatch" ADD CONSTRAINT "InventoryBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryMovement" ADD CONSTRAINT "InventoryMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryMovement" ADD CONSTRAINT "InventoryMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryMovement" ADD CONSTRAINT "InventoryMovement_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."InventoryBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
