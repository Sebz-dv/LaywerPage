<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('title');
            // JSON flexible para info/text/links/attachments/comments
            $t->json('data')->nullable(); // si quieres default: ->default(json_encode([]))
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
