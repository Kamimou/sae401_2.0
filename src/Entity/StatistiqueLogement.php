<?php

namespace App\Entity;

use App\Repository\StatistiqueLogementRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: StatistiqueLogementRepository::class)]
class StatistiqueLogement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?float $construction = null;

    #[ORM\Column]
    private ?int $nombreLogement = null;

    #[ORM\ManyToOne(inversedBy: 'statistiqueLogements')]
    #[ORM\JoinColumn(name: 'departement_code', referencedColumnName: 'code')]
    private ?Departement $departement = null;

    #[ORM\Column(nullable: true)]
    private ?int $logementsMisEnLocation = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getConstruction(): ?float
    {
        return $this->construction;
    }

    public function setConstruction(float $construction): static
    {
        $this->construction = $construction;

        return $this;
    }

    public function getNombreLogement(): ?int
    {
        return $this->nombreLogement;
    }

    public function setNombreLogement(int $nombreLogement): static
    {
        $this->nombreLogement = $nombreLogement;

        return $this;
    }

    public function getDepartement(): ?Departement
    {
        return $this->departement;
    }

    public function setDepartement(?Departement $departement): static
    {
        $this->departement = $departement;

        return $this;
    }

    public function getLogementsMisEnLocation(): ?int
    {
        return $this->logementsMisEnLocation;
    }

    public function setLogementsMisEnLocation(?int $logementsMisEnLocation): static
    {
        $this->logementsMisEnLocation = $logementsMisEnLocation;

        return $this;
    }
}
