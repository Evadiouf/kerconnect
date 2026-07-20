<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Paramètres plateforme
        Setting::set('commission_taux',    '5',     'Taux de commission plateforme (%)');
        Setting::set('commission_active',  '1',     'Activer la commission automatique (1=oui, 0=non)');
        Setting::set('frais_inscription',  '10000', 'Frais d\'inscription bailleur/propriétaire (FCFA)');
        Setting::set('plateforme_nom',     'KerConnect', 'Nom de la plateforme');
        Setting::set('plateforme_email',   'contact@naratechvision.com', 'Email contact');

        // Compte administrateur Hawoly (Naratechvision)
        User::updateOrCreate(
            ['email' => 'demehawoly@gmail.com'],
            [
                'name'              => 'Hawoly Admin',
                'password'          => bcrypt('KerConnect2026!'),
                'role'              => 'admin',
                'email_verified_at' => now(),
                'is_active'         => true,
            ]
        );
    }
}
