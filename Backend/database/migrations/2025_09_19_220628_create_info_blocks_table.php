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
        Schema::create('info_blocks', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();                 // ej: mision, vision
            $table->string('title');                         // título visible
            $table->text('body');                            // markdown o html
            $table->unsignedInteger('position')->default(0); // orden
            $table->boolean('published')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('info_blocks');
    }
};
