<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contrats', function (Blueprint $table) {
            $table->string('fichier_signe_client')->nullable()->after('fichier_contrat');
            $table->timestamp('signe_client_at')->nullable()->after('fichier_signe_client');
            $table->timestamp('valide_bailleur_at')->nullable()->after('signe_client_at');
        });
    }

    public function down(): void
    {
        Schema::table('contrats', function (Blueprint $table) {
            $table->dropColumn(['fichier_signe_client', 'signe_client_at', 'valide_bailleur_at']);
        });
    }
};
