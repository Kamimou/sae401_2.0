<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260317164844 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE statistique_logement (id INT AUTO_INCREMENT NOT NULL, construction DOUBLE PRECISION NOT NULL, nombre_logement INT NOT NULL, departement_code VARCHAR(3) DEFAULT NULL, INDEX IDX_57E380456A333750 (departement_code), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE statistique_logement ADD CONSTRAINT FK_57E380456A333750 FOREIGN KEY (departement_code) REFERENCES departement (code)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE statistique_logement DROP FOREIGN KEY FK_57E380456A333750');
        $this->addSql('DROP TABLE statistique_logement');
    }
}
