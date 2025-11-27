<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PracticeArea extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'slug',
        'title',
        'subtitle',
        'excerpt',
        'body',
        'icon_path',
        'icon_url',
        'bullets',
        'featured',
        'active',
        'order',

        // Nuevos
        'category',
        'pricing_type',
        'from_price',
        'eta',
        'scope',
        'faqs',
        'docs',
    ];

    protected $casts = [
        'bullets'  => 'array',
        'featured' => 'boolean',
        'active'   => 'boolean',
        'order'    => 'integer',

        'scope'    => 'array',
        'faqs'     => 'array',
        'docs'     => 'array',
    ];

    protected $appends = ['icon']; // URL resuelta para el front

    // Accessor: icon => URL final (prioriza icon_url, si no usa storage)
    public function getIconAttribute(): ?string
    {
        if ($this->icon_url) {
            return $this->icon_url;
        }

        if ($this->icon_path) {
            return asset('storage/' . ltrim($this->icon_path, '/'));
        }

        return null;
    }

    // Generar slug si no viene
    protected static function booted(): void
    {
        static::creating(function (PracticeArea $m) {
            if (!$m->slug) {
                $base = Str::slug($m->title);
                $slug = $base;
                $i = 1;

                while (static::where('slug', $slug)->withTrashed()->exists()) {
                    $slug = $base . '-' . $i++;
                }

                $m->slug = $slug;
            }
        });
    }

    // Scope de búsqueda simple
    public function scopeSearch($q, ?string $term)
    {
        if (!$term) {
            return $q;
        }

        $t = trim($term);

        return $q->where(function ($qq) use ($t) {
            $qq->where('title', 'like', "%{$t}%")
                ->orWhere('subtitle', 'like', "%{$t}%")
                ->orWhere('excerpt', 'like', "%{$t}%");
        });
    }
}
