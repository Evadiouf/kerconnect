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
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bien_id')->constrained()->onDelete('cascade');
            $table->foreignId('demandeur_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['location', 'achat', 'visite']);
            $table->enum('statut', ['soumise', 'en_cours', 'acceptee', 'refusee', 'annulee'])->default('soumise');
            $table->string('prenom_nom');
            $table->string('telephone')->nullable();
            $table->text('description')->nullable();
            $table->date('date_emmenagement')->nullable();
            $table->string('duree_souhaitee')->nullable();
            $table->date('date_visite')->nullable();
            $table->time('heure_visite')->nullable();
            $table->string('cni_passeport')->nullable();
            $table->json('documents')->nullable();
            $table->timestamps();
            $table->index(['bien_id', 'statut']);
            $table->index(['demandeur_id', 'statut']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
