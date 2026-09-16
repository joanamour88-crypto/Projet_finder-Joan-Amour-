-- CreateTable
CREATE TABLE `Chambres` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_id` INTEGER NULL,
    `numero` VARCHAR(191) NOT NULL,
    `categorie` VARCHAR(191) NOT NULL,
    `capacite` INTEGER NOT NULL,
    `prix_nuit` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `disponible` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hotels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `etoiles` INTEGER NOT NULL,
    `adresse` VARCHAR(191) NOT NULL,
    `code_postal` VARCHAR(191) NOT NULL,
    `ville` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `gerant` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comptes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mot_de_passe_clair` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `hotel_id` INTEGER NULL,
    `telephone` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reservations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voyageur_id` INTEGER NOT NULL,
    `chambre_id` INTEGER NOT NULL,
    `date_arrivee` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_depart` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `nb_personnes` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `demande_speciale` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Chambres` ADD CONSTRAINT `Chambres_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `Hotels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comptes` ADD CONSTRAINT `Comptes_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `Hotels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservations` ADD CONSTRAINT `Reservations_chambre_id_fkey` FOREIGN KEY (`chambre_id`) REFERENCES `Chambres`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
