<?php

namespace App\Console\Commands;

use App\Mail\RappelPaiementMail;
use App\Models\Contrat;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class EnvoyerRappelPaiement extends Command
{
    protected $signature   = 'paiements:rappel {--jours=3 : Nombre de jours avant l\'échéance}';
    protected $description = 'Envoie un e-mail de rappel de loyer aux locataires J-{jours} avant la date d\'échéance';

    public function handle(): int
    {
        $joursAvant = (int) $this->option('jours');
        $dateRappel = Carbon::today()->addDays($joursAvant);

        $this->info("Recherche des contrats dont l'échéance tombe le {$dateRappel->format('d/m/Y')} (J-{$joursAvant})...");

        // Contrats de bail actifs (signés ou validés)
        $contrats = Contrat::with(['locataire', 'bien', 'bailleur'])
            ->whereIn('statut', ['signe', 'valide'])
            ->where('type', 'bail')
            ->whereNotNull('date_debut')
            ->get();

        $envoyes = 0;

        foreach ($contrats as $contrat) {
            $jourEcheance = (int) Carbon::parse($contrat->date_debut)->format('d');

            // Calculer la prochaine date d'échéance
            $prochaine = $this->prochaineDateEcheance($jourEcheance);

            if ($prochaine->isSameDay($dateRappel)) {
                // Montant que le client paie (loyer + 5% commission)
                $montantDu = round((float) $contrat->montant * 1.05, 2);
                $dateFormatee = $prochaine->locale('fr')->isoFormat('dddd D MMMM YYYY');

                try {
                    Mail::to($contrat->locataire->email)
                        ->send(new RappelPaiementMail($contrat, $dateFormatee, $montantDu));

                    $this->line("  ✓ Rappel envoyé à {$contrat->locataire->email} ({$contrat->bien->titre})");
                    $envoyes++;
                } catch (\Throwable $e) {
                    $this->error("  ✗ Erreur pour {$contrat->locataire->email} : {$e->getMessage()}");
                }
            }
        }

        $this->info($envoyes === 0
            ? 'Aucun rappel à envoyer aujourd\'hui.'
            : "{$envoyes} rappel(s) envoyé(s) avec succès.");

        return self::SUCCESS;
    }

    private function prochaineDateEcheance(int $jour): Carbon
    {
        $aujourd = Carbon::today();
        $annee   = (int) $aujourd->format('Y');
        $mois    = (int) $aujourd->format('n');

        // Clamp le jour au dernier jour du mois courant (ex: 31 en février → 28)
        $dernierJourMois = (int) Carbon::createFromDate($annee, $mois, 1)->endOfMonth()->format('d');
        $jourReel = min($jour, $dernierJourMois);

        $echeanceCeMois = Carbon::createFromDate($annee, $mois, $jourReel);

        // Si l'échéance de ce mois est strictement passée, on prend le mois suivant
        if ($echeanceCeMois->lt($aujourd)) {
            $moisSuivant = $aujourd->copy()->addMonth();
            $dernierJourSuivant = (int) $moisSuivant->copy()->endOfMonth()->format('d');
            $jourReel = min($jour, $dernierJourSuivant);
            return Carbon::createFromDate((int) $moisSuivant->format('Y'), (int) $moisSuivant->format('n'), $jourReel);
        }

        return $echeanceCeMois;
    }
}
