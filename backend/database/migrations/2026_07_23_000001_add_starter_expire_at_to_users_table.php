<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('starter_expire_at')->nullable()->after('forfait_expire_at');
        });

        // Période de grâce 30 jours pour les starters existants
        \DB::table('users')
            ->where('forfait', 'starter')
            ->where('inscription_payee', true)
            ->whereNull('starter_expire_at')
            ->update(['starter_expire_at' => now()->addDays(30)]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('starter_expire_at');
        });
    }
};
