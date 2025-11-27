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

            // Front usa `icon`
            'icon'       => $icon,
            'icon_url'   => $this->icon_url,
            'icon_path'  => $this->icon_path,

            // Siempre arrays para evitar null-checks feos en el front
            'bullets'    => $this->bullets ?? [],
            'scope'      => $this->scope ?? [],
            'faqs'       => $this->faqs ?? [],
            'docs'       => $this->docs ?? [],

            'featured'   => (bool) $this->featured,
            'active'     => (bool) $this->active,
            'order'      => (int) ($this->order ?? 0),

            'created_at' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),

            'category'      => $this->category,
            'pricing_type'  => $this->pricing_type,
            'from_price'    => $this->from_price,
            'eta'           => $this->eta,
        ];
    }
}
