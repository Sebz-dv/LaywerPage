<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArticleCategoryRequest;
use App\Http\Requests\UpdateArticleCategoryRequest;
use App\Models\ArticleCategories;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ArticleCategoryController extends Controller
{
    public function index(Request $req)
    {
        $rid = (string) Str::uuid();

        try {
            $q = ArticleCategories::query();

            // Filtro por "active"
            if ($req->has('active')) {
                $active = filter_var(
                    $req->query('active'),
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                );
                if (!is_null($active)) {
                    $q->where('active', $active);
                }
            }

            // Búsqueda por nombre/slug
            if ($search = trim((string) $req->query('search', ''))) {
                $q->where(function ($w) use ($search) {
                    $w->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            }

            // Orden
            $sort = $req->query('sort', 'name');
            $allowed = ['name', 'slug', 'created_at', 'id', '-name', '-created_at', '-id', '-slug'];

            if (!in_array($sort, $allowed, true)) {
                $sort = 'name';
            }

            foreach (explode(',', $sort) as $ord) {
                $dir = str_starts_with($ord, '-') ? 'desc' : 'asc';
                $col = ltrim($ord, '-');
                $q->orderBy($col, $dir);
            }

            // Paginación
            $perPage = (int) $req->integer('per_page', 50);
            $perPage = min(max($perPage, 1), 200);

            $paginator = $q->paginate($perPage)->appends($req->query());

            // Devolvemos el paginator tal cual ({ data, meta, links })
            return response()->json($paginator);
        } catch (\Throwable $e) {
            Log::error('ArticleCategory index failed', [
                'rid'   => $rid,
                'msg'   => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'query' => $req->query(),
            ]);

            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function store(StoreArticleCategoryRequest $req)
    {
        $rid = (string) Str::uuid();

        try {
            $data = $req->validated();

            $cat = ArticleCategories::create($data);

            return response()->json($cat, 201);
        } catch (\Throwable $e) {
            Log::error('ArticleCategory store failed', [
                'rid'     => $rid,
                'msg'     => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
                'payload' => $req->all(),
            ]);

            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function update(UpdateArticleCategoryRequest $req, $id)
    {
        $rid = (string) Str::uuid();

        try {
            $cat = ArticleCategories::findOrFail($id);
            $data = $req->validated();

            $cat->update($data);

            return response()->json($cat);
        } catch (\Throwable $e) {
            Log::error('ArticleCategory update failed', [
                'rid'   => $rid,
                'id'    => $id,
                'msg'   => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'body'  => $req->all(),
            ]);

            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function destroy($id)
    {
        $rid = (string) Str::uuid();

        try {
            $cat = ArticleCategories::findOrFail($id);
            $cat->delete(); // soft delete

            return response()->noContent();
        } catch (\Throwable $e) {
            Log::error('ArticleCategory destroy failed', [
                'rid'   => $rid,
                'id'    => $id,
                'msg'   => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['message' => 'Server error'], 500);
        }
    }
}
