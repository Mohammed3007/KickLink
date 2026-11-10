-- CreateTable
CREATE TABLE "OrganizerLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "club" TEXT NOT NULL DEFAULT '',
    "sport" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizerLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizerLead_createdAt_idx" ON "OrganizerLead"("createdAt");
