<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
 

class Article extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'article_category_id',
        'author_id',
        'title',
        'slug',
        'external_url',
        'cover_path',
        'pdf_path',
        'excerpt',
        'body',
        'featured',
        'is_published',
        'published_at',
        'meta',
    ];

    protected $casts = [
        'featured'      => 'boolean',
        'is_published'  => 'boolean',
        'published_at'  => 'datetime',
        'meta'          => 'array',
    ];

    protected $appends = ['cover_url', 'pdf_url'];

    public function getRouteKeyName(): string
    {
        // Binding explícito por id
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

    /* ========= Relaciones ========= */

    public function category(): BelongsTo
    {
        return $this->belongsTo(ArticleCategories::class, 'article_category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(team_members::class, 'author_id');
    }

    /* ========= Accessors ========= */

    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover_path ? Storage::url($this->cover_path) : null;
    }

    public function getPdfUrlAttribute(): ?string
    {
        return $this->pdf_path ? Storage::url($this->pdf_path) : null;
    }

    /* ========= Scopes útiles ========= */

    public function scopePublished($q, ?bool $only = null)
    {
        if ($only === null) return $q;
        return $q->where('is_published', $only);
    }

    public function scopeFeatured($q, ?bool $only = null)
    {
        if ($only === null) return $q;
        return $q->where('featured', $only);
    }

    public function scopeSearch($q, ?string $s)
    {
        $s = trim((string) $s);
        if ($s === '') return $q;

        return $q->where(function ($w) use ($s) {
            $w->where('title', 'like', "%{$s}%")
                ->orWhere('excerpt', 'like', "%{$s}%")
                ->orWhere('body', 'like', "%{$s}%");
        });
    }

    public function scopeCategory($q, $idOrSlug)
    {
        if (!$idOrSlug && $idOrSlug !== 0) return $q;

        // Permite filtrar por id numérico o por slug de la categoría
        if (is_numeric($idOrSlug)) {
            return $q->where('article_category_id', (int) $idOrSlug);
        }

        return $q->whereHas('category', function ($w) use ($idOrSlug) {
            $w->where('slug', $idOrSlug);
        });
    }
}
