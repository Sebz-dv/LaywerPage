<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePracticeAreaRequest;
use App\Http\Requests\UpdatePracticeAreaRequest;
use App\Http\Resources\PracticeAreaResource;
use App\Models\PracticeArea;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PracticeAreaController extends Controller
{
    // GET /api/practice-areas
    public function index(Request $req)
    {
        $q = PracticeArea::query();

        // Filtros
        if ($s = trim((string) $req->get('search'))) {
            $q->where(function ($x) use ($s) {
                $x->where('title', 'like', "%{$s}%")
                  ->orWhere('subtitle', 'like', "%{$s}%")
                  ->orWhere('excerpt', 'like', "%{$s}%")
                  ->orWhere('slug', 'like', "%{$s}%");
            });
        }
        if ($req->has('featured')) $q->where('featured', (bool) $req->boolean('featured'));
        if ($req->has('active'))   $q->where('active',   (bool) $req->boolean('active'));

        // Orden
        $sort = $req->get('sort', 'order,title');
        foreach (explode(',', $sort) as $colRaw) {
            $colRaw = trim($colRaw);
            if (!$colRaw) continue;
            $dir = str_starts_with($colRaw, '-') ? 'desc' : 'asc';
            $col = ltrim($colRaw, '-');
            if (in_array($col, ['id','order','title','created_at','updated_at','slug'])) {
                $q->orderBy($col, $dir);
            }
        }

        $perPage = min((int) ($req->get('per_page', 12)), 100);
        $page = $q->paginate($perPage)->appends($req->query());

        Log::info('[PracticeAreas] index', [
            'query' => $req->query(),
            'count' => $page->count(),
        ]);

        // Debug por ítem (máx 3) para validar iconos/paths en local
        if (app()->isLocal()) {
            $items = $page->items();
            foreach ($items as $i => $it) {
                if ($i >= 3) break;
                $raw = $it->icon_url;
                $abs = $raw ? (str_starts_with($raw, 'http') ? $raw : url($raw)) : null;
                $relPath = ($raw && str_starts_with($raw, '/storage/'))
                    ? ltrim(str_replace('/storage/', '', $raw), '/')
                    : null;

                Log::info('[PracticeAreas] index:item', [
                    'i'                     => $i,
                    'id'                    => $it->id,
                    'title'                 => $it->title,
                    'icon_url_raw'          => $raw,
                    'icon_abs_for_img'      => $abs,
                    'exists_on_disk'        => $relPath ? Storage::disk('public')->exists($relPath) : null,
                    'public_symlink_exists' => file_exists(public_path('storage')),
                ]);
            }
        }

        return PracticeAreaResource::collection($page);
    }

    // POST /api/practice-areas
    public function store(StorePracticeAreaRequest $req)
    {
        Log::info('[PracticeAreas] store: incoming', [
            'content_type'   => $req->header('Content-Type'),
            'has_file_icon'  => $req->hasFile('icon'),
            'icon_url_input' => $req->input('icon_url'),
            'featured_raw'   => $req->input('featured'),
            'active_raw'     => $req->input('active'),
        ]);

        $data = $req->validated();
        unset($data['icon']); // 'icon' no existe en DB

        // Normaliza booleanos
        $data['featured'] = $req->has('featured') ? $req->boolean('featured') : false;
        $data['active']   = $req->has('active')   ? $req->boolean('active')   : true;

        try {
            $storedPath = null;

            if ($req->hasFile('icon')) {
                $file = $req->file('icon');
                Log::info('[PracticeAreas] store: file meta', [
                    'valid'     => $file->isValid(),
                    'orig_name' => $file->getClientOriginalName(),
                    'mime'      => $file->getMimeType(),
                    'size'      => $file->getSize(),
                ]);

                $storedPath = $file->store('practice-areas', 'public'); // practice-areas/xxx.png
                $data['icon_url'] = Storage::url($storedPath);          // /storage/practice-areas/xxx.png
                $this->logDiskState('store:after-save', $storedPath);
            } else {
                $this->logDiskState('store:no-file', null);
            }

            $area = PracticeArea::create($data);

            Log::info('[PracticeAreas] store: created', [
                'id'       => $area->id,
                'icon_url' => $area->icon_url,
            ]);

            return (new PracticeAreaResource($area))
                ->additional(['message' => 'Área creada correctamente']);

        } catch (\Throwable $e) {
            Log::error('[PracticeAreas] store: error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    // PUT/PATCH /api/practice-areas/{practice_area}
    public function update(UpdatePracticeAreaRequest $req, PracticeArea $practice_area)
    {
        Log::info('[PracticeAreas] update: incoming', [
            'id'            => $practice_area->id,
            'has_file_icon' => $req->hasFile('icon'),
            'icon_url_input'=> $req->input('icon_url'),
            'featured_raw'  => $req->input('featured'),
            'active_raw'    => $req->input('active'),
        ]);

        $data = $req->validated();
        unset($data['icon']);

        if ($req->has('featured')) $data['featured'] = $req->boolean('featured');
        if ($req->has('active'))   $data['active']   = $req->boolean('active');

        try {
            $storedPath = null;

            if ($req->hasFile('icon')) {
                if ($practice_area->icon_url && str_starts_with($practice_area->icon_url, '/storage/')) {
                    $prev = ltrim(str_replace('/storage/', '', $practice_area->icon_url), '/');
                    Storage::disk('public')->delete($prev);
                    Log::info('[PracticeAreas] update: deleted previous icon', ['prev' => $prev]);
                }

                $file = $req->file('icon');
                Log::info('[PracticeAreas] update: file meta', [
                    'valid'     => $file->isValid(),
                    'orig_name' => $file->getClientOriginalName(),
                    'mime'      => $file->getMimeType(),
                    'size'      => $file->getSize(),
                ]);

                $storedPath = $file->store('practice-areas', 'public');
                $data['icon_url'] = Storage::url($storedPath);
                $this->logDiskState('update:after-save', $storedPath);
            } else {
                $this->logDiskState('update:no-file', null);
            }

            $practice_area->update($data);

            Log::info('[PracticeAreas] update: saved', [
                'id'       => $practice_area->id,
                'icon_url' => $practice_area->icon_url,
            ]);

            return (new PracticeAreaResource($practice_area))
                ->additional(['message' => 'Área actualizada correctamente']);

        } catch (\Throwable $e) {
            Log::error('[PracticeAreas] update: error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    // GET /api/practice-areas/{practice_area}
    public function show(PracticeArea $practice_area)
    {
        return new PracticeAreaResource($practice_area);
    }

    // DELETE /api/practice-areas/{practice_area}
    public function destroy(PracticeArea $practice_area)
    {
        if ($practice_area->icon_url && str_starts_with($practice_area->icon_url, '/storage/')) {
            $prev = ltrim(str_replace('/storage/', '', $practice_area->icon_url), '/');
            Storage::disk('public')->delete($prev);
            Log::info('[PracticeAreas] destroy: deleted icon', ['prev' => $prev]);
        }

        $practice_area->delete();
        Log::info('[PracticeAreas] destroy: deleted', ['id' => $practice_area->id]);

        return response()->json(['message' => 'Área eliminada']);
    }

    // POST /api/practice-areas/{practice_area}/toggle?field=active|featured
    public function toggle(PracticeArea $practice_area, Request $req)
    {
        $field = $req->get('field', 'active');
        if (!in_array($field, ['active','featured'])) {
            return response()->json(['message' => 'Campo inválido'], 422);
        }
        $practice_area->{$field} = !$practice_area->{$field};
        $practice_area->save();

        Log::info('[PracticeAreas] toggle', [
            'id'    => $practice_area->id,
            'field' => $field,
            'value' => $practice_area->{$field},
        ]);

        return (new PracticeAreaResource($practice_area))
            ->additional(['message' => "Campo {$field} alternado"]);
    }

    /** ================= Helpers ================= */

    private function logDiskState(string $tag, ?string $storedPath): void
    {
        $disk     = Storage::disk('public');
        $symlink  = public_path('storage');
        $exists   = $storedPath ? $disk->exists($storedPath) : null;
        $relUrl   = $storedPath ? $disk->url($storedPath) : null;   // "/storage/..."
        $absUrl   = $relUrl ? url($relUrl) : null;                  // "http://host/storage/..."

        Log::info('[PracticeAreas] disk-state', [
            'tag'                   => $tag,
            'app_url'               => config('app.url'),
            'public_root'           => config('filesystems.disks.public.root'),
            'public_url_prefix'     => config('filesystems.disks.public.url'),
            'public_symlink_exists' => file_exists($symlink),
            'stored_path'           => $storedPath,
            'stored_exists'         => $exists,
            'rel_url'               => $relUrl,
            'abs_url'               => $absUrl,
        ]);
    }
}
