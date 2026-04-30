/*
  Warnings:

  - You are about to drop the column `auhorId` on the `comments` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_auhorId_fkey";

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "auhorId",
ADD COLUMN     "authorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
