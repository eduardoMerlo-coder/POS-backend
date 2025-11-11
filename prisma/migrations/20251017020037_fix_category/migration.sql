/*
  Warnings:

  - You are about to drop the column `businessTypeId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_businessTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_userId_fkey";

-- DropIndex
DROP INDEX "public"."Category_businessTypeId_userId_name_key";

-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "businessTypeId",
DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "public"."ProductBusinessType" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "businessTypeId" INTEGER NOT NULL,

    CONSTRAINT "ProductBusinessType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductBusinessType_productId_businessTypeId_key" ON "public"."ProductBusinessType"("productId", "businessTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- AddForeignKey
ALTER TABLE "public"."ProductBusinessType" ADD CONSTRAINT "ProductBusinessType_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductBusinessType" ADD CONSTRAINT "ProductBusinessType_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "public"."BusinessType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
