-- CreateTable
CREATE TABLE `chambres` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_id` INTEGER NULL,
    `numero` VARCHAR(191) NOT NULL,
    `categorie` VARCHAR(191) NOT NULL,
    `capacite` INTEGER NOT NULL,
    `prix_nuit` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `disponible` BOOLEAN NOT NULL DEFAULT true,

    INDEX `chambres_hotel_id_idx`(`hotel_id`),
    UNIQUE INDEX `chambres_hotel_id_numero_key`(`hotel_id`, `numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `etoiles` INTEGER NOT NULL,
    `adresse` VARCHAR(191) NOT NULL,
    `code_postal` VARCHAR(191) NOT NULL,
    `ville` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `gerant` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `hotels_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comptes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mot_de_passe_clair` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `hotel_id` INTEGER NULL,
    `telephone` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,

    UNIQUE INDEX `comptes_email_key`(`email`),
    INDEX `comptes_hotel_id_idx`(`hotel_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voyageur_id` INTEGER NOT NULL,
    `chambre_id` INTEGER NOT NULL,
    `date_arrivee` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_depart` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `nb_personnes` INTEGER NOT NULL,
    `statut` VARCHAR(191) NOT NULL,
    `demande_speciale` VARCHAR(191) NULL,

    INDEX `reservations_voyageur_id_idx`(`voyageur_id`),
    INDEX `reservations_chambre_id_date_arrivee_date_depart_idx`(`chambre_id`, `date_arrivee`, `date_depart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chambres` ADD CONSTRAINT `chambres_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comptes` ADD CONSTRAINT `comptes_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_chambre_id_fkey` FOREIGN KEY (`chambre_id`) REFERENCES `chambres`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
