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
        Schema::table('practice_areas', function (Blueprint $table) {
            // Metadatos de UI
            $table->string('category')->nullable()->after('excerpt');
            $table->string('pricing_type')->nullable()->after('category'); // fijo | hora | mixto (lo manejas tú)
            $table->string('from_price')->nullable()->after('pricing_type');
            $table->string('eta')->nullable()->after('from_price'); // “2–5 días hábiles”, etc.

            // JSONs
            $table->json('scope')->nullable()->after('bullets'); // [{label, value}, ...]
            $table->json('faqs')->nullable()->after('scope');    // [{q, a}, ...]
            $table->json('docs')->nullable()->after('faqs');     // ["Contrato...", "Política...", ...]
        });
    }

    public function down(): void
    {
        Schema::table('practice_areas', function (Blueprint $table) {
            $table->dropColumn([
                'category',
                'pricing_type',
                'from_price',
                'eta',
                'scope',
                'faqs',
                'docs',
            ]);
        });
    }
};
