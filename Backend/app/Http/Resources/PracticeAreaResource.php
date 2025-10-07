<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PracticeAreaResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'        => $this->id,
            'slug'      => $this->slug,
            'title'     => $this->title,
            'subtitle'  => $this->subtitle,
            'excerpt'   => $this->excerpt,
            'body'      => $this->body,
            'icon'      => $this->icon,     // URL final (ver accessor)
            'bullets'   => $this->bullets ?? [],
            'featured'  => $this->featured,
            'active'    => $this->active,
            'order'     => $this->order,
            'created_at'=> $this->created_at,
            'updated_at'=> $this->updated_at,
        ];
    }
}
