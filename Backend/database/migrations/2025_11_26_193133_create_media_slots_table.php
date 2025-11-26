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
        Schema::create('media_slots', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // p.ej. team_hero, about_hero, etc.
            $table->string('path');          // storage path en el disk
            $table->string('alt')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_slots');
    }
};
