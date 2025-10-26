<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Settings extends Model
{
    protected $guarded =  [];
    protected $fillable = [
        'site_name',
        'logo_path',
        'email',
        'phone',
        'address',
        'social_links',
        'footer_blocks',
        'updated_by',
    ];
    protected $casts = [
        'social_links' => 'array',
        'footer_blocks' => 'array',
    ];

    // Esto hace que siempre salga "logo_url" en la respuesta JSON
    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo_path) return null;

        // Si guardas como 'logos/archivo.png' en disco 'public'
        // Storage::url(...) -> '/storage/...' y url(...) -> absoluto
        return url(Storage::url($this->logo_path));
    }
}
