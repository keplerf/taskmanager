-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_created_by_id_fkey`;

-- AlterTable
ALTER TABLE `items` MODIFY `created_by_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
