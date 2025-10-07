<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use App\Http\Requests\StoreArticleRequest;
use App\Http\Requests\UpdateArticleRequest;
use App\Http\Resources\ArticleResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ArticleController extends Controller
{
    public function index(Request $req)
    {
        try {
            $q = Article::query()->with([
                'category:id,name,slug',
                'author', // no limitar columnas (tu tabla puede no tener "name")
            ]);

            // Filtros robustos
            if ($req->has('published_only')) {
                $val = filter_var($req->input('published_only'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($val !== null) $q->where('is_published', $val);
            }
            if ($req->has('category_id')) {
                $cid = $req->input('category_id');
                if ($cid !== '' && $cid !== null) $q->where('article_category_id', (int) $cid);
            }
            if ($req->has('featured')) {
                $val = filter_var($req->input('featured'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($val !== null) $q->where('featured', $val);
            }
            if (($s = trim((string) $req->input('search'))) !== '') {
                $q->where(function ($w) use ($s) {
                    $w->where('title', 'like', "%{$s}%")
                      ->orWhere('excerpt', 'like', "%{$s}%")
                      ->orWhere('body', 'like', "%{$s}%");
                });
            }

            // Orden permitido
            $sort = $req->input('sort', '-published_at,id');
            foreach (explode(',', $sort) as $ord) {
                $dir = str_starts_with($ord, '-') ? 'desc' : 'asc';
                $col = ltrim($ord, '-');
                if (in_array($col, ['published_at','created_at','title','featured','id'], true)) {
                    $q->orderBy($col, $dir);
                }
            }

            // Paginación
            $perPage   = min(max((int) $req->input('per_page', 12), 1), 100);
            $paginator = $q->paginate($perPage)->appends($req->query());

            return ArticleResource::collection($paginator);
        } catch (\Throwable $e) {
            Log::error('Articles index failed', [
                'msg' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function show(Article $article)
    {
        $article->load(['category', 'author']);
        return new ArticleResource($article);
    }

    public function showBySlug(string $slug)
    {
        $article = Article::with(['category','author'])
            ->where('slug', $slug)
            ->firstOrFail();

        return new ArticleResource($article);
    }

    public function showById(int $id)
    {
        $article = Article::with(['category','author'])->findOrFail($id);
        return new ArticleResource($article);
    }

    public function store(StoreArticleRequest $req)
    {
        try {
            $data = $req->validated();

            if ($req->hasFile('cover')) {
                $data['cover_path'] = $req->file('cover')->store('articles', 'public');
                Log::debug('Article cover stored', [
                    'path' => $data['cover_path'],
                    'exists_in_disk_public' => Storage::disk('public')->exists($data['cover_path']),
                ]);
            }

            $article = Article::create($data);
            $article->load(['category', 'author']);

            return (new ArticleResource($article))->response()->setStatusCode(201);
        } catch (\Throwable $e) {
            Log::error('Article store failed', [
                'msg' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $req->all(),
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function update(UpdateArticleRequest $req, Article $article)
    {
        try {
            $data = $req->validated();

            if ($req->hasFile('cover')) {
                if ($article->cover_path) Storage::disk('public')->delete($article->cover_path);
                $data['cover_path'] = $req->file('cover')->store('articles', 'public');
                Log::debug('Article cover updated', [
                    'path' => $data['cover_path'],
                    'exists_in_disk_public' => Storage::disk('public')->exists($data['cover_path']),
                ]);
            }

            $article->update($data);
            $article->load(['category', 'author']);

            return new ArticleResource($article);
        } catch (\Throwable $e) {
            Log::error('Article update failed', [
                'article_id' => $article->id,
                'msg' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $req->all(),
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function destroy(Article $article)
    {
        try {
            if ($article->cover_path) {
                Storage::disk('public')->delete($article->cover_path);
            }
            $article->delete();
            return response()->noContent();
        } catch (\Throwable $e) {
            Log::error('Article destroy failed', [
                'article_id' => $article->id,
                'msg' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function togglePublish(Article $article)
    {
        try {
            $article->is_published = !$article->is_published;
            $article->published_at = $article->is_published ? now() : null;
            $article->save();

            $article->load(['category', 'author']);
            return new ArticleResource($article);
        } catch (\Throwable $e) {
            Log::error('Article togglePublish failed', [
                'article_id' => $article->id,
                'msg' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function toggleFeatured(Article $article)
    {
        try {
            $article->featured = !$article->featured;
            $article->save();

            $article->load(['category', 'author']);
            return new ArticleResource($article);
        } catch (\Throwable $e) {
            Log::error('Article toggleFeatured failed', [
                'article_id' => $article->id,
                'msg' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Server error'], 500);
        }
    }
}
