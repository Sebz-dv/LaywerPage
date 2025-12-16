<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use App\Http\Requests\StoreArticleRequest;
use App\Http\Requests\UpdateArticleRequest;
use App\Http\Resources\ArticleResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    public function index(Request $req)
    {
        $rid = (string) Str::uuid();
        try {

            $q = Article::query()
                ->with(['category:id,name,slug', 'author']);

            $q = $this->applyFilters($q, $req);
            $q = $this->applySort($q, $req);

            $perPage   = min(max((int) $req->integer('per_page', 12), 1), 100);
            $paginator = $q->paginate($perPage)->appends($req->query());

            return ArticleResource::collection($paginator);
        } catch (\Throwable $e) {
            Log::error('Articles index failed', [
                'rid'   => $rid,
                'msg'   => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'query' => $req->query(),
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function show(Article $article, Request $req)
    {
        $rid = (string) Str::uuid();
        try {
            $article->load(['category:id,name,slug', 'author']); // ✅

            $withBody = filter_var($req->input('with_body', 'true'), FILTER_VALIDATE_BOOLEAN);
            if (!$withBody) {
                $article->setHidden(array_merge($article->getHidden(), ['body']));
            }

            return new ArticleResource($article);
        } catch (\Throwable $e) {
            Log::error('Article show failed', [
                'rid'   => $rid,
                'id'    => $article->id ?? null,
                'msg'   => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function store(StoreArticleRequest $req)
    {
        $rid = (string) Str::uuid();
        try {
            $data = $req->validated();

            // cover (imagen)
            if ($req->hasFile('cover')) {
                $data['cover_path'] = $req->file('cover')->store('articles/covers', 'public');
            }

            // pdf
            if ($req->hasFile('pdf')) {
                $data['pdf_path'] = $req->file('pdf')->store('articles/pdfs', 'public');
            }

            $article = Article::create($data);

            // Carga relaciones
            $article->load(['category:id,name,slug', 'author']); // ✅ 

            return (new ArticleResource($article))
                ->response()
                ->setStatusCode(201);
        } catch (ValidationException $ve) {
            Log::warning('Article store: validation failed', [
                'rid'    => $rid,
                'errors' => $ve->errors(),
            ]);
            throw $ve;
        } catch (\Throwable $e) {
            Log::error('Article store failed', [
                'rid'     => $rid,
                'msg'     => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
                'payload' => $this->safePayloadForLog($req->all()),
                'files'   => $this->filesMeta($req),
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function update(UpdateArticleRequest $req, Article $article)
    {
        $rid = (string) Str::uuid();
        try {
            $data = $req->validated();

            if ($req->hasFile('cover')) {
                $this->deleteIfExists($article->cover_path);
                $data['cover_path'] = $req->file('cover')->store('articles/covers', 'public');
            }

            if ($req->hasFile('pdf')) {
                $this->deleteIfExists($article->pdf_path);
                $data['pdf_path'] = $req->file('pdf')->store('articles/pdfs', 'public');
            }

            $article->update($data);

            $article->load(['category:id,name,slug', 'author']); // ✅ 

            return new ArticleResource($article);
        } catch (\Throwable $e) {
            Log::error('Article update failed', [
                'rid'     => $rid,
                'article_id' => $article->id,
                'msg'     => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
                'payload' => $this->safePayloadForLog($req->all()),
                'files'   => $this->filesMeta($req),
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function destroy(Article $article)
    {
        $rid = (string) Str::uuid();
        try {
            $this->deleteIfExists($article->cover_path);
            $this->deleteIfExists($article->pdf_path);

            $article->delete();
            return response()->noContent();
        } catch (\Throwable $e) {
            Log::error('Article destroy failed', [
                'rid'   => $rid,
                'article_id' => $article->id,
                'msg'   => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function togglePublish(Article $article)
    {
        $rid = (string) Str::uuid();
        try {
            $before = $article->is_published;
            $article->is_published = !$article->is_published;
            $article->published_at = $article->is_published ? now() : null;
            $article->save();
            $article->load(['category:id,name,slug', 'author']); // ✅
            return new ArticleResource($article);
        } catch (\Throwable $e) {
            Log::error('Article togglePublish failed', [
                'rid'   => $rid,
                'article_id' => $article->id,
                'msg'   => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function toggleFeatured(Article $article)
    {
        $rid = (string) Str::uuid();
        try {
            $before = $article->featured;
            $article->featured = !$article->featured;
            $article->save();
            $article->load(['category:id,name,slug', 'author']); // ✅
            return new ArticleResource($article);
        } catch (\Throwable $e) {
            Log::error('Article toggleFeatured failed', [
                'rid'   => $rid,
                'article_id' => $article->id,
                'msg'   => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /* ======================= Privates ======================= */

    /** Log-friendly: evita volcar body completo y datos grandes. */
    private function safePayloadForLog(array $in): array
    {
        $out = $in;

        foreach (['body', 'excerpt'] as $k) {
            if (isset($out[$k]) && is_string($out[$k])) {
                $len = mb_strlen($out[$k]);
                $out[$k] = "[len={$len}]";
            }
        }

        if (isset($out['meta'])) {
            $out['meta'] = is_array($out['meta']) ? array_keys($out['meta']) : $out['meta'];
        }

        // No loggear archivos aquí (van en filesMeta)
        unset($out['cover'], $out['pdf']);

        return $out;
    }

    /** Metadatos de archivos para log. */
    private function filesMeta(Request $req): array
    {
        $meta = [];
        if ($req->hasFile('cover')) {
            $f = $req->file('cover');
            $meta['cover'] = [
                'orig' => $f->getClientOriginalName(),
                'mime' => $f->getMimeType(),
                'size' => $f->getSize(),
                'ext'  => $f->getClientOriginalExtension(),
            ];
        }
        if ($req->hasFile('pdf')) {
            $f = $req->file('pdf');
            $meta['pdf'] = [
                'orig' => $f->getClientOriginalName(),
                'mime' => $f->getMimeType(),
                'size' => $f->getSize(),
                'ext'  => $f->getClientOriginalExtension(),
            ];
        }
        return $meta;
    }

    private function applyFilters(Builder $q, Request $req): Builder
    {
        // Lee el valor crudo (puede no venir)
        $rawPublished = $req->query('published_only', null);
        $rawFeatured  = $req->query('featured', null);
        $rawCategory  = $req->query('category_id', $req->query('category', null));
        $rawSearch    = $req->query('search', null);

        // Normaliza a bool SOLO si vino el parámetro
        $publishedOnly = ($rawPublished !== null)
            ? filter_var($rawPublished, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : null;

        $featured = ($rawFeatured !== null)
            ? filter_var($rawFeatured, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            : null;

        // Aplica filtros SOLO cuando no es null (cuando el usuario pidió filtrar)
        if ($publishedOnly !== null) {
            $q->where('is_published', $publishedOnly);
        }

        if ($featured !== null) {
            $q->where('featured', $featured);
        }

        if ($rawCategory !== null && $rawCategory !== '') {
            if (is_numeric($rawCategory)) {
                $q->where('article_category_id', (int) $rawCategory);
            } else {
                // por slug
                $q->whereHas('category', function ($c) use ($rawCategory) {
                    $c->where('slug', $rawCategory);
                });
            }
        }

        if (is_string($rawSearch) && ($s = trim($rawSearch)) !== '') {
            $q->where(function ($w) use ($s) {
                $w->where('title', 'like', "%{$s}%")
                    ->orWhere('excerpt', 'like', "%{$s}%")
                    ->orWhere('body', 'like', "%{$s}%");
            });
        }

        return $q;
    }

    private function applySort(Builder $q, Request $req): Builder
    {
        $sort = $req->input('sort', '-published_at,id');
        $allowed = ['published_at', 'created_at', 'title', 'featured', 'id'];

        foreach (explode(',', $sort) as $ord) {
            $dir = str_starts_with($ord, '-') ? 'desc' : 'asc';
            $col = ltrim($ord, '-');
            if (in_array($col, $allowed, true)) {
                $q->orderBy($col, $dir);
            }
        }

        return $q;
    }

    private function deleteIfExists(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function boolOrNull($value): ?bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    }
}
