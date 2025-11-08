<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class team_members extends Model
{
    protected $table = 'team_members';
    protected $guarded = [];

    // Se serializan automáticamente en JSON
    protected $appends = ['display_name', 'avatar_url'];

    protected $casts = [
        'areas' => 'array',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /* ========== Accessors para front ========== */

    // app/Models/team_members.php
    public function getDisplayNameAttribute(): ?string
    {
        $name =
            $this->attributes['display_name']
            ?? $this->attributes['name']
            ?? $this->attributes['full_name']
            ?? trim(($this->attributes['first_name'] ?? '') . ' ' . ($this->attributes['last_name'] ?? ''))
            ?? $this->attributes['nombre']
            ?? $this->attributes['titulo']
            ?? $this->attributes['alias']
            ?? null;

        if (is_string($name) && trim($name) !== '') {
            return trim($name);
        }

        // ⬇️ Fallback por slug: "camilo-blanco" -> "Camilo Blanco"
        $slug = $this->attributes['slug'] ?? null;
        if (is_string($slug) && trim($slug) !== '') {
            $fromSlug = ucwords(str_replace('-', ' ', trim($slug)));
            return $fromSlug;
        }

        return null; // último recurso
    }


    public function getAvatarUrlAttribute(): ?string
    {
        $candidate =
            $this->attributes['avatar_path']
            ?? $this->attributes['photo_path']
            ?? $this->attributes['foto_path']
            ?? $this->attributes['image_path']
            ?? $this->attributes['profile_photo_path']
            ?? null;

        if (!$candidate) return null;

        // Si el archivo está en disk public, genera URL; si ya es absoluta, respétala
        if (Storage::disk('public')->exists($candidate)) {
            return Storage::disk('public')->url($candidate);
        }
        return $candidate;
    }

    /* ========== Mutator areas ========== */

    public function setAreasAttribute($value)
    {
        $arr = collect(is_array($value) ? $value : [$value])
            ->filter(fn($v) => is_string($v) && trim($v) !== '')
            ->map(fn($v) => trim($v))
            ->unique()
            ->values()
            ->all();

        $this->attributes['areas'] = json_encode($arr);
    }

    /* ========== Slug auto por nombre ==========
       Ajusta los campos fuente si tu tabla usa 'nombre' u otros
    */
    protected static function booted(): void
    {
        static::creating(function ($m) {
            $base = $m->nombre
                ?? $m->name
                ?? $m->full_name
                ?? trim(($m->first_name ?? '') . ' ' . ($m->last_name ?? ''))
                ?? 'miembro';
            if (empty($m->slug)) $m->slug = self::uniqueSlug($base);
        });

        static::updating(function ($m) {
            if ($m->isDirty('nombre') || $m->isDirty('name') || $m->isDirty('full_name') || $m->isDirty('first_name') || $m->isDirty('last_name')) {
                $base = $m->nombre
                    ?? $m->name
                    ?? $m->full_name
                    ?? trim(($m->first_name ?? '') . ' ' . ($m->last_name ?? ''))
                    ?? 'miembro';
                $m->slug = self::uniqueSlug($base, $m->id);
            }
        });
    }

    protected static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;
        while (self::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }

    public function profile()
    {
        return $this->hasOne(\App\Models\team_member_profiles::class, 'team_member_id');
    }
}
