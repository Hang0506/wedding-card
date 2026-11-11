-- CreateTable
CREATE TABLE "Wedding" (
    "id" TEXT NOT NULL,
    "adminToken" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "groomName" TEXT NOT NULL DEFAULT '',
    "brideName" TEXT NOT NULL DEFAULT '',
    "groomShort" TEXT,
    "brideShort" TEXT,
    "groomTitle" TEXT NOT NULL DEFAULT 'Chú Rể',
    "brideTitle" TEXT NOT NULL DEFAULT 'Cô Dâu',
    "displayOrder" TEXT NOT NULL DEFAULT 'groom_first',
    "coverPhotoUrl" TEXT,
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "galleryStyle" TEXT NOT NULL DEFAULT 'grid',
    "groomFamily" JSONB,
    "brideFamily" JSONB,
    "announcement" TEXT,
    "events" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "reception" JSONB,
    "rsvpConfig" JSONB,
    "dressCode" JSONB,
    "guestbook" BOOLEAN NOT NULL DEFAULT true,
    "bankAccounts" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "thankYouMsg" TEXT,
    "bgMusicUrl" TEXT,
    "envelopeStyle" TEXT NOT NULL DEFAULT 'default',
    "sharePhotoUrl" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "greeting" TEXT NOT NULL DEFAULT 'Thân Mời',
    "message" TEXT,
    "group" TEXT,
    "rsvpStatus" TEXT NOT NULL DEFAULT 'pending',
    "rsvpCount" INTEGER,
    "answeredAt" TIMESTAMP(3),
    "rsvpAnswers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestbookEntry" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestbookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wedding_adminToken_key" ON "Wedding"("adminToken");

-- CreateIndex
CREATE UNIQUE INDEX "Wedding_slug_key" ON "Wedding"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_weddingId_slug_key" ON "Guest"("weddingId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_guestId_questionId_key" ON "Answer"("guestId", "questionId");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestbookEntry" ADD CONSTRAINT "GuestbookEntry_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
