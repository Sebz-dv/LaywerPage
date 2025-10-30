<?php

namespace App\Http\Controllers;

use App\Models\PracticeArea;
use Illuminate\Http\Request;
use App\Http\Requests\PracticeAreaStoreRequest;
use App\Http\Requests\PracticeAreaUpdateRequest;
use App\Http\Resources\PracticeAreaResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PracticeAreaController extends Controller
{
    public function index(Request $req)
    {
        $q        = $req->string('q')->toString();
        $featured = $req->filled('featured') ? $req->boolean('featured') : null;
        $active   = $req->filled('active') ? $req->boolean('active') : null;
        $sort     = $req->string('sort', 'order,title')->toString(); // "order,title" etc.
        $perPage  = (int) $req->input('per_page', 15);

        $query = PracticeArea::query()->search($q);

        if ($featured !== null) $query->where('featured', $featured);
        if ($active !== null)   $query->where('active', $active);

        // Orden múltiple: "order,title,-created_at"
        foreach (explode(',', $sort) as $col) {
            $col = trim($col);
            if (!$col) continue;
            $dir = 'asc';
            if (str_starts_with($col, '-')) {
                $dir = 'desc';
                $col = ltrim($col, '-');
            }
            // Lista blanca rápida
            if (in_array($col, ['order', 'title', 'created_at', 'updated_at'])) {
                $query->orderBy($col, $dir);
            }
        }

        $paginator = $query->paginate($perPage)->appends($req->query());
        return PracticeAreaResource::collection($paginator);
    }

    // ... arriba igual

    private function normalizeBullets(array &$data): void
    {
        if (array_key_exists('bullets', $data)) {
            // Si viene como string "[]", intentamos decodificar
            if (is_string($data['bullets'])) {
                $decoded = json_decode($data['bullets'], true);
                if (is_array($decoded)) {
                    $data['bullets'] = $decoded;
                } else {
                    // Si viene texto plano, lo tratamos como una sola línea
                    $data['bullets'] = trim($data['bullets']) === '' ? [] : [$data['bullets']];
                }
            }
            if (is_array($data['bullets'])) {
                $data['bullets'] = array_values(array_filter(array_map(function ($s) {
                    return is_string($s) ? trim($s) : $s;
                }, $data['bullets']), fn($s) => $s !== '' && $s !== null));
            }
        }
    }

    public function store(PracticeAreaStoreRequest $request)
    {
        $data = $request->validated();

        // Si se sube archivo, prioriza path y anula url
        if ($request->hasFile('icon')) {
            $path = $request->file('icon')->store('practice-areas', 'public');
            $data['icon_path'] = $path;
            unset($data['icon_url']);
        }

        $this->normalizeBullets($data);

        // Slug automático si no viene
        if (empty($data['slug']) && !empty($data['title'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $area = PracticeArea::create($data);
        return new PracticeAreaResource($area);
    }



    public function show(PracticeArea $practice_area)
    {
        return new PracticeAreaResource($practice_area);
    }

    public function update(PracticeAreaUpdateRequest $request, PracticeArea $practice_area)
    {
        $data = $request->validated();

        if ($request->hasFile('icon')) {
            if ($practice_area->icon_path && Storage::disk('public')->exists($practice_area->icon_path)) {
                Storage::disk('public')->delete($practice_area->icon_path);
            }
            $path = $request->file('icon')->store('practice-areas', 'public');
            $data['icon_path'] = $path;
            if (array_key_exists('icon_url', $data)) unset($data['icon_url']);
        }

        $this->normalizeBullets($data); // <- y aquí

        $practice_area->update($data);
        return new PracticeAreaResource($practice_area->fresh()); // fresh para ver el cast aplicado
    }

    public function destroy(PracticeArea $practice_area)
    {
        // Opcional: borrar archivo
        if ($practice_area->icon_path && Storage::disk('public')->exists($practice_area->icon_path)) {
            Storage::disk('public')->delete($practice_area->icon_path);
        }
        $practice_area->delete();
        return response()->json(['message' => 'Eliminado']);
    }

    // Toggles cortos (útiles para admin)
    public function toggle(Request $req, PracticeArea $practice_area)
    {
        $field = $req->string('field')->toString(); // 'active' o 'featured'
        if (!in_array($field, ['active', 'featured'])) {
            return response()->json(['message' => 'Campo no permitido'], 422);
        }
        $practice_area->{$field} = !$practice_area->{$field};
        $practice_area->save();

        return new PracticeAreaResource($practice_area);
    }
}
