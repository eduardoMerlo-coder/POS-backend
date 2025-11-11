-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_businessTypeId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "businessTypeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "public"."BusinessType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
