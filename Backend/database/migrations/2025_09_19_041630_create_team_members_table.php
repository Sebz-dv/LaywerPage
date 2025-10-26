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
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');                      // Ana Cristina Medina
            $table->string('slug')->unique();              // ana-cristina-medina
            $table->string('cargo')->index();              // Socia, Socio, CEO…
            $table->json('areas')->nullable();             // ["Tributario","Corporativo"]
            $table->string('ciudad')->index();             // Bogotá, Medellín...
            $table->string('tipo')->index();               // juridico | no-juridico | otro | lo-que-sea
            $table->string('foto_url')->nullable();
            $table->timestamps();
            $table->index(['tipo','ciudad']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_members');
    }
};
