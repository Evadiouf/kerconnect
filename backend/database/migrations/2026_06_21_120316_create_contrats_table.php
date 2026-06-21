<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contrats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained()->onDelete('cascade');
            $table->foreignId('bien_id')->constrained()->onDelete('cascade');
            $table->foreignId('bailleur_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('locataire_id')->constrained('users')->onDelete('cascade');
            $table->string('numero')->unique();
            $table->enum('type', ['bail', 'vente']);
            $table->decimal('montant', 15, 2);
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->string('fichier_contrat')->nullable();
            $table->string('signature_bailleur')->nullable();
            $table->string('signature_locataire')->nullable();
            $table->timestamp('signe_bailleur_at')->nullable();
            $table->timestamp('signe_locataire_at')->nullable();
            $table->enum('statut', ['brouillon', 'en_attente_signature', 'signe', 'valide', 'resilie'])->default('brouillon');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contrats');
    }
};
