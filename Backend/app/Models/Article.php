<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Modelos relacionados
use App\Models\ArticleCategory;
use App\Models\TeamMember;

class Article extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'article_category_id',
        'author_id',
        'title',
        'slug',
        'cover_path',
        'excerpt',
        'body',
        'featured',
        'is_published',
        'published_at',
        'meta',
    ];

    protected $casts = [
        'featured'     => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'meta'         => 'array',
    ];

    protected $appends = ['cover_url'];

    // (opcional) deja claro que el binding es por id
    public function getRouteKeyName(): string
    {
        return 'id';
    }

    protected static function booted(): void
    {
        static::saving(function (self $m) {
            if (empty($m->slug) && !empty($m->title)) {
                $m->slug = Str::slug($m->title);
            }
            if ($m->is_published && empty($m->published_at)) {
                $m->published_at = now();
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ArticleCategories::class, 'article_category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(team_members::class, 'author_id');
    }

    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover_path ? Storage::url($this->cover_path) : null;
    }
}
