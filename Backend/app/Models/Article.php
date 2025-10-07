<?php
// app/Models/Article.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'featured'      => 'boolean',
        'is_published'  => 'boolean',
        'published_at'  => 'datetime',
        'meta'          => 'array',
    ];

    // Exponer cover_url como atributo calculado
    protected $appends = ['cover_url'];

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

    /** Categoría del artículo */
    public function category(): BelongsTo
    {
        // Ajusta el FQCN si tu modelo se llama distinto
        return $this->belongsTo(\App\Models\ArticleCategory::class, 'article_category_id');
    }

    /** Autor (team member) */
    public function author(): BelongsTo
    {
        // Ajusta el FQCN si tu modelo se llama distinto
        return $this->belongsTo(\App\Models\team_members::class, 'author_id');
    }

    /** URL pública de la portada (deja host/puerto a Resource) */
    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover_path ? Storage::url($this->cover_path) : null;
    }
}
