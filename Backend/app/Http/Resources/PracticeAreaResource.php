<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PracticeAreaResource extends JsonResource
{
    public function toArray($request)
    {
        $arr = [
            'id'        => $this->id,
            'slug'      => $this->slug,
            'title'     => $this->title,
            'subtitle'  => $this->subtitle,
            'excerpt'   => $this->excerpt,

            // el front espera "icon" y "to"
            'icon'      => $this->icon_absolute_url, // 👈 absoluta
            'to'        => $this->to_path,

            'bullets'   => $this->bullets ?? [],
            'featured'  => (bool) $this->featured,
            'active'    => (bool) $this->active,
            'order'     => (int) $this->order,

            'created_at'=> $this->created_at,
            'updated_at'=> $this->updated_at,
        ];

        // Debug en local (como tu CarouselSlideResource)
        if (app()->isLocal()) {
            // Si guardaste con Storage::url($path), icon_url es "/storage/..."
            $disk = Storage::disk('public');
            $rel  = null;
            if ($this->icon_url && str_starts_with($this->icon_url, '/storage/')) {
                $rel = $this->icon_url; // "/storage/..."
            }

            $arr['debug'] = [
                'app_url'               => config('app.url'),
                'icon_url_raw'          => $this->icon_url,        // lo que hay en BD
                'absolute_url'          => $this->icon_absolute_url, // http://host/storage/...
                'exists_on_disk'        => $this->icon_exists,     // bool|null
                'public_symlink_exists' => file_exists(public_path('storage')),
            ];
        }

        return $arr;
    }
}
