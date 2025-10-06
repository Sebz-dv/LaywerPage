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
        Schema::create('practice_areas', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->text('excerpt')->nullable();
            $table->string('icon_url', 512)->nullable();  // ↑ por si usas CDN o firmas
            $table->string('to_path', 512)->nullable();   // ↑ rutas largas sin sustos
            $table->json('bullets')->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('active')->default(true);
            $table->unsignedInteger('order')->default(0); // puedes mantenerlo si no usas SQL crudo
            $table->timestamps();
            $table->softDeletes();
            $table->index(['featured', 'active', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('practice_areas');
    }
};
