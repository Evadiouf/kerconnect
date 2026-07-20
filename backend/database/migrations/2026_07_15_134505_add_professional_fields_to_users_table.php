<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table("users", function (Blueprint $table) {
            $table->string("ninea")->nullable()->after("phone");
            $table->string("registre_commerce")->nullable()->after("ninea");
            $table->string("adresse_structure")->nullable()->after("registre_commerce");
            $table->string("type_bien")->nullable()->after("adresse_structure");
            $table->string("contrat_location")->nullable()->after("type_bien");
        });
    }
    public function down(): void {
        Schema::table("users", function (Blueprint $table) {
            $table->dropColumn(["ninea", "registre_commerce", "adresse_structure", "type_bien", "contrat_location"]);
        });
    }
};
