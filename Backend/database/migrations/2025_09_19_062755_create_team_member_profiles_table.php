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
        Schema::create('team_member_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_member_id')->constrained('team_members')->cascadeOnDelete();
            $table->string('email')->nullable();
            $table->json('idiomas')->nullable();          // ["Español","Inglés"]
            $table->longText('perfil')->nullable();        // texto largo
            $table->json('educacion')->nullable();         // ["Abogado, ...", "..."]
            $table->json('experiencia')->nullable();
            $table->json('reconocimientos')->nullable();
            $table->timestamps();
            $table->unique('team_member_id'); // relación 1–1
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_member_profiles');
    }
};
