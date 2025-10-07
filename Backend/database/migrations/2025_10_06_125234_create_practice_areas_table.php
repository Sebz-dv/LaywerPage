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
            $table->longText('body')->nullable();

            // Imagen / ícono
            $table->string('icon_path')->nullable();  // archivo en storage/app/public/...
            $table->string('icon_url')->nullable();   // opcional: URL externa (si no subes archivo)

            // JSON con bullets
            $table->json('bullets')->nullable();

            // Flags de UI
            $table->boolean('featured')->default(false);
            $table->boolean('active')->default(true);

            $table->unsignedInteger('order')->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Índices útiles para filtros
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
