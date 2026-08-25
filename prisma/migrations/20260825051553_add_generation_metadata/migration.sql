-- AlterTable
ALTER TABLE `Idea` ADD COLUMN `generationPrompt` TEXT NULL,
    ADD COLUMN `generationRules` TEXT NULL;

-- AlterTable
ALTER TABLE `Script` ADD COLUMN `generationPrompt` TEXT NULL,
    ADD COLUMN `generationRules` TEXT NULL;

-- AlterTable
ALTER TABLE `Thumbnail` ADD COLUMN `generationPrompt` TEXT NULL,
    ADD COLUMN `generationRules` TEXT NULL;
