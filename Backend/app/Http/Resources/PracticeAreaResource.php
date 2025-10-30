<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PracticeAreaResource extends JsonResource
{
    public function toArray($request)
    {
        // Prioridad del ícono:
        // - Si hay icon_path (storage local), servimos URL pública
        // - Si no, usamos icon_url externo (si existe)
        $icon = null;

        if ($this->icon_path) {
            $icon = Storage::disk('public')->url($this->icon_path);
        } elseif ($this->icon_url) {
            $icon = $this->icon_url;
        }

        return [
            'id'         => $this->id,
            'slug'       => $this->slug,
            'title'      => $this->title,
            'subtitle'   => $this->subtitle,
            'excerpt'    => $this->excerpt,
            'body'       => $this->body,
            'icon'       => $icon,              // 👈 el frontend usa `icon`
            'icon_url'   => $this->icon_url,    // (transparencia)
            'icon_path'  => $this->icon_path,   // (transparencia)
            'bullets'    => $this->bullets ?? [],  // 👈 siempre array

            'featured'   => (bool) $this->featured,
            'active'     => (bool) $this->active,
            'order'      => (int) ($this->order ?? 0),

            'created_at' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),
        ];
    }
}
