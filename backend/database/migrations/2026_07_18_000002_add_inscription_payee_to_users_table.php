<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('inscription_payee')->default(false)->after('is_active');
            $table->timestamp('inscription_at')->nullable()->after('inscription_payee');
        });
    }
    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['inscription_payee', 'inscription_at']);
        });
    }
};
