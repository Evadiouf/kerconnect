<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('forfait', ['starter', 'pro', 'agence'])->default('starter')->after('inscription_payee');
            $table->timestamp('forfait_expire_at')->nullable()->after('forfait');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['forfait', 'forfait_expire_at']);
        });
    }
};
