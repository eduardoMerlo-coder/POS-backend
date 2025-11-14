/*
  Warnings:

  - You are about to drop the column `packaging_type` on the `Product` table. All the data in the column will be lost.
  - Added the required column `packagingTypeId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "packaging_type",
ADD COLUMN     "packagingTypeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."PackagingType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(100) NOT NULL,

    CONSTRAINT "PackagingType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_packagingTypeId_fkey" FOREIGN KEY ("packagingTypeId") REFERENCES "public"."PackagingType"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
