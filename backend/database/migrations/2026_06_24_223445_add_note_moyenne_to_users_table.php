<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table("users", function (Blueprint $table) {
            $table->decimal("note_moyenne", 3, 1)->default(0)->after("is_active");
            $table->integer("nb_avis")->default(0)->after("note_moyenne");
            $table->boolean("verifie")->default(false)->after("nb_avis");
        });
    }
    public function down(): void {
        Schema::table("users", function (Blueprint $table) {
            $table->dropColumn(["note_moyenne", "nb_avis", "verifie"]);
        });
    }
};
