<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260326134940 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE statistique_logement ADD taux_chomage DOUBLE PRECISION DEFAULT NULL, ADD densite_population DOUBLE PRECISION DEFAULT NULL, ADD taux_logement_vacants DOUBLE PRECISION DEFAULT NULL, ADD annee_publication DOUBLE PRECISION DEFAULT NULL, ADD logement_en_location DOUBLE PRECISION DEFAULT NULL, DROP logements_mis_en_location, CHANGE nombre_habitants nombre_habitants DOUBLE PRECISION DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE statistique_logement ADD logements_mis_en_location INT DEFAULT NULL, DROP taux_chomage, DROP densite_population, DROP taux_logement_vacants, DROP annee_publication, DROP logement_en_location, CHANGE nombre_habitants nombre_habitants INT DEFAULT NULL');
    }
}
