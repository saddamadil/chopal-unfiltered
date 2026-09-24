-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'REPORTER', 'AUTHOR') NOT NULL DEFAULT 'AUTHOR',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Session_tokenHash_key`(`tokenHash`),
    INDEX `Session_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Author` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `bio` TEXT NOT NULL,
    `image` VARCHAR(500) NULL,
    `userId` VARCHAR(191) NULL,

    UNIQUE INDEX `Author_slug_key`(`slug`),
    UNIQUE INDEX `Author_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subcategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Subcategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `State` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `State_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `City` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `stateId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `City_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Tag_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticleTag` (
    `articleId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`articleId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Article` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(250) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `featuredImage` VARCHAR(500) NULL,
    `imageAlt` VARCHAR(250) NULL,
    `imageCaption` TEXT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `subcategoryId` VARCHAR(191) NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `stateId` VARCHAR(191) NULL,
    `cityId` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `type` ENUM('NEWS', 'BREAKING', 'GROUND_REPORT', 'INVESTIGATION', 'INTERVIEW', 'OPINION', 'EXPLAINER', 'FACT_CHECK', 'VIDEO') NOT NULL DEFAULT 'NEWS',
    `status` ENUM('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'SCHEDULED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isBreaking` BOOLEAN NOT NULL DEFAULT false,
    `isTrending` BOOLEAN NOT NULL DEFAULT false,
    `isSponsored` BOOLEAN NOT NULL DEFAULT false,
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `views` INTEGER NOT NULL DEFAULT 0,
    `publishedAt` DATETIME(3) NULL,
    `scheduledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `claim` TEXT NULL,
    `verdict` VARCHAR(100) NULL,
    `sources` TEXT NULL,

    UNIQUE INDEX `Article_slug_key`(`slug`),
    INDEX `Article_status_publishedAt_idx`(`status`, `publishedAt`),
    INDEX `Article_status_scheduledAt_idx`(`status`, `scheduledAt`),
    INDEX `Article_categoryId_status_publishedAt_idx`(`categoryId`, `status`, `publishedAt`),
    INDEX `Article_stateId_cityId_idx`(`stateId`, `cityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeoMetadata` (
    `id` VARCHAR(191) NOT NULL,
    `articleId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(250) NULL,
    `description` TEXT NULL,
    `focusKeyword` VARCHAR(191) NULL,
    `canonicalUrl` VARCHAR(500) NULL,
    `ogImage` VARCHAR(500) NULL,
    `schemaType` VARCHAR(40) NOT NULL DEFAULT 'NewsArticle',
    `robotsIndex` BOOLEAN NOT NULL DEFAULT true,
    `robotsFollow` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `SeoMetadata_articleId_key`(`articleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Video` (
    `id` VARCHAR(191) NOT NULL,
    `articleId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `duration` VARCHAR(20) NULL,

    UNIQUE INDEX `Video_articleId_key`(`articleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticleRevision` (
    `id` VARCHAR(191) NOT NULL,
    `articleId` VARCHAR(191) NOT NULL,
    `snapshot` JSON NOT NULL,
    `editedBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ArticleRevision_articleId_createdAt_idx`(`articleId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Media` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `thumbnail` VARCHAR(500) NOT NULL,
    `alt` VARCHAR(250) NOT NULL,
    `caption` TEXT NULL,
    `size` INTEGER NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,
    `uploaderId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Media_url_key`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BreakingNews` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(250) NOT NULL,
    `url` VARCHAR(500) NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `articleId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Comment_articleId_approved_idx`(`articleId`, `approved`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Advertisement` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `image` VARCHAR(500) NOT NULL,
    `alt` VARCHAR(250) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `position` VARCHAR(40) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `id` VARCHAR(191) NOT NULL,
    `value` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscriber` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Subscriber_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(120) NOT NULL,
    `target` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RateLimit` (
    `id` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 1,
    `expiresAt` DATETIME(3) NOT NULL,

    INDEX `RateLimit_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Author` ADD CONSTRAINT `Author_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subcategory` ADD CONSTRAINT `Subcategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `City` ADD CONSTRAINT `City_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `State`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleTag` ADD CONSTRAINT `ArticleTag_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleTag` ADD CONSTRAINT `ArticleTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `Subcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `Author`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `State`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeoMetadata` ADD CONSTRAINT `SeoMetadata_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `Video_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleRevision` ADD CONSTRAINT `ArticleRevision_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_uploaderId_fkey` FOREIGN KEY (`uploaderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

