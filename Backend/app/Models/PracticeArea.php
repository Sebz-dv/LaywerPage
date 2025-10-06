<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PracticeArea extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'slug','title','subtitle','excerpt',
        'icon_url','to_path','bullets',
        'featured','active','order',
    ];

    protected $casts = [
        'bullets'  => 'array',
        'featured' => 'bool',
        'active'   => 'bool',
        'order'    => 'int',
    ];

    // URL absoluta para el icono (si es relativa, la prefijamos con APP_URL)
    public function getIconAbsoluteUrlAttribute(): ?string
    {
        if (!$this->icon_url) return null;
        if (str_starts_with($this->icon_url, 'http')) return $this->icon_url;
        return url($this->icon_url); // ej: http://localhost:8000/storage/...
    }

    // Chequeo de existencia en el disco 'public' cuando icon_url apunta a /storage/*
    public function getIconExistsAttribute(): ?bool
    {
        if (!$this->icon_url) return null;
        if (!str_starts_with($this->icon_url, '/storage/')) return null; // no sabemos el disco
        $rel = ltrim(str_replace('/storage/', '', $this->icon_url), '/'); // practice-areas/xxx.png
        return Storage::disk('public')->exists($rel);
    }

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->title) . '-' . Str::random(4);
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('title') && empty($model->getOriginal('slug'))) {
                $model->slug = Str::slug($model->title) . '-' . Str::random(4);
            }
        });
    }
}
