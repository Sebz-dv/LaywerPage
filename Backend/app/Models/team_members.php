<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class team_members extends Model
{
    protected $table = 'team_members';
    protected $guarded = [];

    // Bind por slug en rutas: /team/{slug}
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected static function booted(): void
    {
        static::creating(function ($m) {
            if (empty($m->slug)) $m->slug = self::uniqueSlug($m->nombre);
        });
        static::updating(function ($m) {
            if ($m->isDirty('nombre')) $m->slug = self::uniqueSlug($m->nombre, $m->id);
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
