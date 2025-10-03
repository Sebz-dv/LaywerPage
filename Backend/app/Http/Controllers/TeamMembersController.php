<?php

namespace App\Http\Controllers;

use App\Models\team_members;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TeamMembersController extends Controller
{

    public function index(Request $req)
    {
        $perPage = min((int) $req->integer('per_page', 9), 50);
        $q = team_members::query();

        // Filtros
        if ($tab = (string) $req->string('tab')->lower()) {
            if (in_array($tab, ['juridico', 'no-juridico'])) $q->where('tipo', $tab);
        }
        if ($nombre = (string) $req->string('nombre')) {
            $q->where('nombre', 'LIKE', '%' . $nombre . '%');
        }
        foreach (['cargo', 'area', 'ciudad'] as $f) {
            if ($v = (string) $req->string($f)) $q->where($f, $v);
        }

        // 👇 Nuevo: orden
        $sort = (string) $req->query('sort', 'latest'); // latest | nombre
        if ($sort === 'latest') {
            $q->orderByDesc('id'); // o created_at desc
        } else {
            $q->orderBy('nombre');
        }

        $page = $q->paginate($perPage)->appends($req->query());

        $facets = [
            'cargos'   => team_members::select('cargo')->distinct()->orderBy('cargo')->pluck('cargo'),
            'areas'    => team_members::select('area')->distinct()->orderBy('area')->pluck('area'),
            'ciudades' => team_members::select('ciudad')->distinct()->orderBy('ciudad')->pluck('ciudad'),
        ];

        return response()->json([
            'data' => $page->items(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'per_page'     => $page->perPage(),
                'last_page'    => $page->lastPage(),
                'total'        => $page->total(),
                'facets'       => $facets,
            ],
        ]);
    }

    // Binding por slug gracias a getRouteKeyName()
    public function show(string $slug)
    {
        $m = team_members::where('slug', $slug)->with('profile')->firstOrFail();
        return response()->json(['data' => $m]);
    }

    public function store(Request $req)
    {
        $validated = $req->validate([
            'nombre'   => 'required|string|max:255',
            'cargo'    => 'required|string|max:255',
            'area'     => 'required|string|max:255',
            'ciudad'   => 'required|string|max:255',
            'tipo'     => ['required', Rule::in(['juridico', 'no-juridico'])],
            'foto'     => 'nullable|image',
        ]);

        // 👇 NO guardes 'foto' como columna
        $data = collect($validated)->except('foto')->all();

        if ($req->hasFile('foto')) {
            $path = $req->file('foto')->store('team', 'public');
            $data['foto_url'] = asset(Storage::url($path));
        }

        $m = team_members::create($data);
        return response()->json(['data' => $m], 201);
    }

    public function update(Request $req, string $slug)
    {
        $m = team_members::where('slug', $slug)->firstOrFail();

        $validated = $req->validate([
            'nombre'   => 'sometimes|required|string|max:255',
            'cargo'    => 'sometimes|required|string|max:255',
            'area'     => 'sometimes|required|string|max:255',
            'ciudad'   => 'sometimes|required|string|max:255',
            'tipo'     => ['sometimes', 'required', Rule::in(['juridico', 'no-juridico'])],
            'foto'     => 'nullable|image',
        ]);

        // 👇 NO guardes 'foto' como columna
        $data = collect($validated)->except('foto')->all();

        if ($req->hasFile('foto')) {
            if ($m->foto_url) {
                $prev = Str::after($m->foto_url, '/storage/');
                Storage::disk('public')->delete($prev);
            }
            $path = $req->file('foto')->store('team', 'public');
            $data['foto_url'] = Storage::url($path);
        }

        $m->update($data);
        return response()->json(['data' => $m]);
    }

    public function destroy(string $slug)
    {
        $m = team_members::where('slug', $slug)->firstOrFail();
        if ($m->foto_url) {
            $prev = Str::after($m->foto_url, '/storage/');
            Storage::disk('public')->delete($prev);
        }
        $m->delete();
        return response()->noContent();
    }
}
