<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Rappel de paiement mensuel — tous les jours à 8h00
// Envoie un e-mail au locataire 3 jours avant la date d'échéance de son loyer
Schedule::command('paiements:rappel')->dailyAt('09:00');
