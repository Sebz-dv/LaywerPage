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
        'slug','title','subtitle','excerpt','body',
        'icon_path','icon_url','bullets',
        'featured','active','order',
    ];

    protected $casts = [
        'bullets'  => 'array',
        'featured' => 'boolean',
        'active'   => 'boolean',
        'order'    => 'integer',
    ];

    protected $appends = ['icon']; // URL resuelta para el front

    // Accessor: icon => URL final (prioriza icon_url, si no usa storage)
    public function getIconAttribute(): ?string
    {
        if ($this->icon_url) return $this->icon_url;
        if ($this->icon_path) return asset('storage/' . ltrim($this->icon_path, '/'));
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
                    $slug = $base.'-'.$i++;
                }
                $m->slug = $slug;
            }
        });
    }

    // Scope de búsqueda simple
    public function scopeSearch(Builder $q, ?string $term): Builder
    {
        if (!$term) return $q;
        $term = trim($term);
        return $q->where(function($qq) use ($term) {
            $qq->where('title', 'like', "%$term%")
               ->orWhere('subtitle', 'like', "%$term%")
               ->orWhere('excerpt', 'like', "%$term%");
        });
    }
}
