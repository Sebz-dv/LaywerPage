<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ArticleResource extends JsonResource
{
    public function toArray($request): array
    {
        $diskUrl  = $this->cover_path ? Storage::disk('public')->url($this->cover_path) : null;
        $coverUrl = $diskUrl ? $this->absoluteFromRequestHost($diskUrl, $request->getSchemeAndHttpHost()) : null;

        // Armamos autor solo si viene cargado
        $authorArr = null;
        $authorName = null;

        if ($this->relationLoaded('author') && $this->author) {
            $a = $this->author;

            // Nombre tolerante con fallback por slug
            $authorName =
                $a->display_name
                ?? $a->name
                ?? $a->full_name
                ?? trim(($a->first_name ?? '') . ' ' . ($a->last_name ?? ''))
                ?? $a->nombre
                ?? $a->titulo
                ?? $a->alias
                ?? (isset($a->slug) && $a->slug ? ucwords(str_replace('-', ' ', $a->slug)) : 'Anónimo');

            // Avatar
            $avatarUrl = $a->avatar_url ?? null;
            if (!$avatarUrl) {
                $candidatePath =
                    $a->avatar_path ?? $a->photo_path ?? $a->foto_path ?? $a->image_path ?? $a->profile_photo_path ?? null;
                if ($candidatePath) {
                    $disk = Storage::disk('public');
                    $url  = $disk->exists($candidatePath) ? $disk->url($candidatePath) : $candidatePath;
                    $avatarUrl = $this->absoluteFromRequestHost($url, $request->getSchemeAndHttpHost());
                }
            }

            $authorArr = [
                'id'           => $a->id,
                'display_name' => $authorName, // 👈 siempre con valor
                'name'         => $authorName, // 👈 alias para el front
                'slug'         => $a->slug ?? null,
                'avatar_url'   => $avatarUrl,
            ];
        }


        return [
            'id'                   => $this->id,
            'category'             => $this->whenLoaded('category', fn() => [
                'id'   => $this->category?->id,
                'name' => $this->category?->name,
                'slug' => $this->category?->slug,
            ]),
            'author'               => $authorArr,
            'author_name'          => $authorName, // útil en listados rápidos
            'article_category_id'  => $this->article_category_id,
            'author_id'            => $this->author_id,
            'title'                => $this->title,
            'slug'                 => $this->slug,
            'cover_url'            => $coverUrl,
            'excerpt'              => $this->excerpt,
            'body'                 => $this->body,
            'featured'             => (bool) $this->featured,
            'is_published'         => (bool) $this->is_published,
            'published_at'         => $this->published_at?->toIso8601String(),
            'meta'                 => $this->meta ?? (object)[],
            'pdf_url'              => $this->pdf_path
                ? $this->absoluteFromRequestHost(Storage::disk('public')->url($this->pdf_path), $request->getSchemeAndHttpHost())
                : null,
            'external_url'         => $this->external_url,
            'created_at'           => $this->created_at?->toIso8601String(),
            'updated_at'           => $this->updated_at?->toIso8601String(),
        ];
    }

    private function absoluteFromRequestHost(string $pathOrUrl, string $schemeHost): string
    {
        $base = rtrim($schemeHost, '/');
        if (str_starts_with($pathOrUrl, 'http://') || str_starts_with($pathOrUrl, 'https://')) {
            $p = parse_url($pathOrUrl) ?: [];
            $path = ($p['path'] ?? '/')
                . (isset($p['query']) ? ('?' . $p['query']) : '')
                . (isset($p['fragment']) ? ('#' . $p['fragment']) : '');
            return $base . $path;
        }
        $path = str_starts_with($pathOrUrl, '/') ? $pathOrUrl : ('/' . $pathOrUrl);
        return $base . $path;
    }
}
