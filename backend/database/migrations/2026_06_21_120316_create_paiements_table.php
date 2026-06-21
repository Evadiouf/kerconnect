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
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrat_id')->constrained()->onDelete('cascade');
            $table->foreignId('payeur_id')->constrained('users')->onDelete('cascade');
            $table->string('reference')->unique();
            $table->decimal('montant', 15, 2);
            $table->enum('mode', ['espece', 'cheque', 'wave', 'orange_money', 'carte']);
            $table->enum('statut', ['en_attente', 'confirme', 'echoue', 'rembourse'])->default('en_attente');
            $table->string('transaction_id')->nullable();
            $table->string('libelle')->nullable();
            $table->date('periode')->nullable();
            $table->timestamp('paye_at')->nullable();
            $table->string('recu_pdf')->nullable();
            $table->timestamps();
            $table->index(['contrat_id', 'statut']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
