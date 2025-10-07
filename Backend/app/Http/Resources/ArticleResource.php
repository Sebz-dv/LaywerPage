<?php
// app/Http/Resources/ArticleResource.php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ArticleResource extends JsonResource
{
    public function toArray($request): array
    {
        // ---- Cover absoluta con host/puerto del request ----
        $diskUrl  = $this->cover_path ? Storage::disk('public')->url($this->cover_path) : null;
        $coverUrl = $diskUrl ? $this->absoluteFromRequestHost($diskUrl, $request->getSchemeAndHttpHost()) : null;

        return [
            'id'           => $this->id,

            // Categoría (si viene cargada)
            'category'     => $this->whenLoaded('category', fn() => [
                'id'   => $this->category?->id,
                'name' => $this->category?->name,
                'slug' => $this->category?->slug,
            ]),

            // Autor (TeamMember) tolerante a esquema real de team_members
            'author'       => $this->whenLoaded('author', function () use ($request) {
                $a = $this->author;

                // Nombre “display” con fallbacks típicos de team_members
                $display = $a->name
                    ?? $a->full_name
                    ?? trim(($a->first_name ?? '').' '.($a->last_name ?? ''))
                    ?? $a->nombre
                    ?? $a->titulo
                    ?? $a->alias
                    ?? null;

                // Avatar: usa accessor si existe; si no, intenta varias columnas comunes
                $avatarUrl = null;
                if (method_exists($a, 'getAvatarUrlAttribute')) {
                    $avatarUrl = $a->avatar_url;
                } else {
                    $candidatePath =
                        $a->avatar_path
                        ?? $a->photo_path
                        ?? $a->foto_path
                        ?? $a->image_path
                        ?? $a->profile_photo_path
                        ?? null;

                    if ($candidatePath) {
                        $diskUrl = Storage::disk('public')->exists($candidatePath)
                            ? Storage::disk('public')->url($candidatePath)
                            : $candidatePath; // por si ya viene absoluto
                        $avatarUrl = $this->absoluteFromRequestHost($diskUrl, $request->getSchemeAndHttpHost());
                    }
                }

                return [
                    'id'         => $a->id,
                    'name'       => $display,
                    'slug'       => $a->slug ?? null,
                    'avatar_url' => $avatarUrl,
                ];
            }),

            'title'        => $this->title,
            'slug'         => $this->slug,
            'cover_url'    => $coverUrl,
            'excerpt'      => $this->excerpt,
            'body'         => $this->body,
            'featured'     => (bool) $this->featured,
            'is_published' => (bool) $this->is_published,
            'published_at' => $this->published_at?->toIso8601String(),
            'meta'         => $this->meta ?? (object)[],
            'created_at'   => $this->created_at?->toIso8601String(),
            'updated_at'   => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Normaliza cualquier URL/Path para que use el mismo scheme://host:port del request.
     */
    private function absoluteFromRequestHost(string $pathOrUrl, string $schemeHost): string
    {
        $base = rtrim($schemeHost, '/');

        // Si ya es http(s), reemplaza host/puerto por los del request
        if (str_starts_with($pathOrUrl, 'http://') || str_starts_with($pathOrUrl, 'https://')) {
            $p = parse_url($pathOrUrl) ?: [];
            $path = ($p['path'] ?? '/')
                . (isset($p['query']) ? ('?' . $p['query']) : '')
                . (isset($p['fragment']) ? ('#' . $p['fragment']) : '');
            return $base . $path;
        }

        // Si es relativo (o path de Storage), conviértelo a absoluto con el host del request
        $path = str_starts_with($pathOrUrl, '/') ? $pathOrUrl : ('/' . $pathOrUrl);
        return $base . $path;
    }
}
