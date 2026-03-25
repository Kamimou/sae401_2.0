<?php

namespace App\Entity;

use App\Repository\StatistiqueLogementRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: StatistiqueLogementRepository::class)]
class StatistiqueLogement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['logement', 'departement', 'region'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['logement', 'departement', 'region'])]
    private ?float $construction = null;

    #[ORM\Column]
    #[Groups(['logement', 'departement', 'region'])]
    private ?int $nombreLogement = null;

    #[ORM\ManyToOne(inversedBy: 'statistiqueLogements')]
    #[ORM\JoinColumn(name: 'departement_code', referencedColumnName: 'code')]
    #[Groups(['logement'])]
    private ?Departement $departement = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['logement', 'departement', 'region'])]
    private ?int $logementsMisEnLocation = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['logement', 'departement', 'region'])]
    private ?float $tauxPauvrete = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['logement', 'departement', 'region'])]
    private ?float $tauxChomage = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['logement', 'departement', 'region'])]
    private ?float $densitePopulation = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['logement', 'departement', 'region'])]
    private ?float $nombreHabitants = null;

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

    public function getTauxPauvrete(): ?float
    {
        return $this->tauxPauvrete;
    }

    public function setTauxPauvrete(?float $tauxPauvrete): static
    {
        $this->tauxPauvrete = $tauxPauvrete;

        return $this;
    }

    public function getTauxChomage(): ?float
    {
        return $this->tauxChomage;
    }

    public function setTauxChomage(?float $tauxChomage): static
    {
        $this->tauxChomage = $tauxChomage;

        return $this;
    }

    public function getDensitePopulation(): ?float
    {
        return $this->densitePopulation;
    }

    public function setDensitePopulation(?float $densitePopulation): static
    {
        $this->densitePopulation = $densitePopulation;

        return $this;
    }

    public function getNombreHabitants(): ?float
    {
        return $this->nombreHabitants;
    }

    public function setNombreHabitants(?float $nombreHabitants): static
    {
        $this->nombreHabitants = $nombreHabitants;

        return $this;
    }
}