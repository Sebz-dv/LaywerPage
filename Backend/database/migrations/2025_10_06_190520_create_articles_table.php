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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('team_members')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('cover_path')->nullable(); // storage path
            $table->string('excerpt', 500)->nullable();
            $table->longText('body')->nullable();     // Markdown/HTML
            $table->boolean('featured')->default(false);
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->json('meta')->nullable(); // SEO {title, description, keywords[]}
            $table->timestamps();
            $table->softDeletes();
            $table->index(['is_published', 'featured', 'published_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
