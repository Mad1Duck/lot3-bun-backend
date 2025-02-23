/*
  Warnings:

  - Added the required column `timeToCook` to the `Foods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Foods" DROP COLUMN "timeToCook",
ADD COLUMN     "timeToCook" INTEGER NOT NULL;
