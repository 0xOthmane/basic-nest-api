-- CreateEnum
CREATE TYPE "Enum" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Enum" NOT NULL DEFAULT 'USER';
