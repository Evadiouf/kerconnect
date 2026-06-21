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
        Schema::create('biens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('titre');
            $table->string('type'); // appartement, villa, chambre, duplex, studio, terrain
            $table->enum('nature', ['location', 'vente']);
            $table->decimal('prix', 15, 2);
            $table->text('description')->nullable();
            $table->string('adresse');
            $table->string('ville');
            $table->decimal('surface', 8, 2)->nullable();
            $table->integer('chambres')->default(0);
            $table->integer('salles_bain')->default(0);
            $table->json('equipements')->nullable();
            $table->json('images')->nullable();
            $table->string('video')->nullable();
            $table->string('contrat_modele')->nullable();
            $table->enum('statut', ['en_attente', 'publie', 'loue', 'vendu', 'retire'])->default('en_attente');
            $table->boolean('is_new')->default(true);
            $table->timestamps();
            $table->index(['nature', 'statut', 'ville']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('biens');
    }
};
