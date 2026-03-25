<?php


namespace App\Command;


use App\Entity\Departement;
use App\Entity\StatistiqueLogement;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;


#[AsCommand(
   name: 'app:import:stats-logement',
   description: 'Import des statistiques logement depuis un CSV'
)]
class ImportStatistiqueLogementCommand extends Command
{
   public function __construct(private EntityManagerInterface $em)
   {
       parent::__construct();
   }


   protected function configure(): void
   {
       $this
           ->setDescription('Import des statistiques logement depuis un CSV')
           ->addArgument('file', InputArgument::REQUIRED, 'Chemin du fichier CSV');
   }


   protected function execute(InputInterface $input, OutputInterface $output): int
   {
       $filePath = $input->getArgument('file');


       if (!is_readable($filePath)) {
           $output->writeln('<error>Fichier introuvable ou illisible</error>');
           return Command::FAILURE;
       }


       $handle = fopen($filePath, 'r');
       if (!$handle) {
           $output->writeln('<error>Impossible d’ouvrir le fichier</error>');
           return Command::FAILURE;
       }


       $separator = ';';
       $batchSize = 50;
       $i = 0;


       // HEADER
       $header = fgetcsv($handle, 0, $separator);
       if ($header === false) {
           $output->writeln('<error>CSV vide</error>');
           return Command::FAILURE;
       }


       $header = array_map([$this, 'normalizeHeader'], $header);


       while (($row = fgetcsv($handle, 0, $separator)) !== false) {


           // Ignore lignes vides
           if ($row === [null] || count(array_filter($row)) === 0) {
               continue;
           }


           if (count($row) !== count($header)) {
               $output->writeln('<comment>Ligne ignorée (mauvais nombre de colonnes)</comment>');
               continue;
           }


           $data = array_combine($header, $row);


           if ($data === false) {
               continue;
           }


           $rawCode = trim($data['code_departement'] ?? '');


           if ($rawCode === '') {
               // ligne invalide → on ignore
               continue;
           }


           $code = $this->formatCodeDepartement($rawCode);


           if ($code === null) {
               continue;
           }


           $departement = $this->em
               ->getRepository(Departement::class)
               ->find($code);


           if (!$departement) {
               $output->writeln("<comment>Département absent : $code</comment>");
               continue;
           }



//var_dump($data);exit;
           $stat = new StatistiqueLogement();
           $stat->setDepartement($departement);
           $stat->setConstruction($this->decimal($data['construction']));
           $stat->setNombreLogement($this->int($data['parc_social_nombre_de_logements']));
           $stat->setTauxPauvrete($this->decimal($data['taux_de_pauvret_e_en']));;
           $stat->setTauxChomage($this->decimal($data['taux_de_ch^omage_au_t4_en']));
           $stat->setDensitePopulation($this->decimal($data['densit_e_de_population_au_km^2']));
           $stat->setNombreHabitants($this->decimal($data['nombre_d_habitants']));

           $this->em->persist($stat);


           if (($i % $batchSize) === 0 && $i > 0) {
               $this->em->flush();
               $this->em->clear(StatistiqueLogement::class); // important
           }


           $i++;
       }


       $this->em->flush();
       fclose($handle);


       $output->writeln("<info>Import terminé : $i lignes</info>");


       return Command::SUCCESS;
   }


   private function normalizeHeader(string $value): string
   {
       $value = preg_replace('/^\xEF\xBB\xBF/', '', $value);


       $encoding = mb_detect_encoding($value, ['UTF-8','ISO-8859-1','Windows-1252'], true);
       if ($encoding !== 'UTF-8') {
           $value = mb_convert_encoding($value, 'UTF-8', $encoding);
       }


       $value = trim($value);
       $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
       $value = strtolower($value);


       $value = str_replace(
           [' ', '-', '%', '(', ')', '/', '*', ',', '€', '²', "'"],
           '_',
           $value
       );


       $value = preg_replace('/_+/', '_', $value);


       return trim($value, '_');
   }


   private function decimal($value): ?string
   {
       if ($value === null || $value === '') {
           return null;
       }
       return number_format((float)$value, 16, '.', '');
   }


   private function int($value): ?int
   {
       if ($value === null || $value === '') {
           return null;
       }
       return (int)$value;
   }


   private function formatCodeDepartement(string $code): ?string
   {
       $code = trim($code);
       if ($code === '') {
           return null;
       }
       if (in_array($code, ['2A', '2B'])) {
           return $code;
       }
       if (strlen($code) === 3) {
           return $code;
       }


       return str_pad($code, 2, '0', STR_PAD_LEFT);
   }
}


