<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260326092730 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE statistique_logement DROP logements_mis_en_location, DROP nom_region, DROP nom_departement');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE statistique_logement ADD logements_mis_en_location INT DEFAULT NULL, ADD nom_region DOUBLE PRECISION DEFAULT NULL, ADD nom_departement DOUBLE PRECISION DEFAULT NULL');
    }
}
