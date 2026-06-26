-- Upgrade chart_image and notes from TEXT (64KB max) to MEDIUMTEXT (16MB max)
-- Base64-encoded chart screenshots can easily exceed 64KB
ALTER TABLE `analysis_records` MODIFY COLUMN `chart_image` MEDIUMTEXT;
ALTER TABLE `analysis_records` MODIFY COLUMN `notes` MEDIUMTEXT;
