<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Commission sur chaque paiement
        Schema::table('paiements', function (Blueprint $table) {
            $table->decimal('commission_taux', 5, 2)->default(5.00)->after('montant');
            $table->decimal('commission_montant', 15, 2)->default(0)->after('commission_taux');
            $table->decimal('montant_net', 15, 2)->default(0)->after('commission_montant');
        });

        // Table paramètres plateforme (taux de commission, etc.)
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('cle')->unique();
            $table->text('valeur');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Table avis / notes
        Schema::create('avis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrat_id')->constrained()->onDelete('cascade');
            $table->foreignId('auteur_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('cible_id')->constrained('users')->onDelete('cascade');
            $table->tinyInteger('note'); // 1 à 5
            $table->text('commentaire')->nullable();
            $table->enum('type', ['client_note_bailleur', 'bailleur_note_client']);
            $table->timestamps();
        });

        // Alertes biens pour les clients
        Schema::create('alertes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('ville')->nullable();
            $table->string('nature')->nullable(); // location / vente
            $table->decimal('prix_max', 15, 2)->nullable();
            $table->string('type_bien')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alertes');
        Schema::dropIfExists('avis');
        Schema::dropIfExists('settings');
        Schema::table('paiements', function (Blueprint $table) {
            $table->dropColumn(['commission_taux', 'commission_montant', 'montant_net']);
        });
    }
};
