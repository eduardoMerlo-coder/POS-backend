/*
  Warnings:

  - A unique constraint covering the columns `[barcode,internalCode]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropIndex
DROP INDEX "public"."Product_barcode_key";

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "internalCode" VARCHAR(20),
ADD COLUMN     "status" "public"."ProductStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "barcode" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_internalCode_key" ON "public"."Product"("barcode", "internalCode");
