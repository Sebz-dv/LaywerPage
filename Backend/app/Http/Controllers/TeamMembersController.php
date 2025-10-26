<?php

// app/Http/Controllers/TeamMembersController.php
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
        $perPage = min((int)$req->integer('per_page', 9), 50);
        $q = team_members::query();

        // Filtros
        if ($tab = (string) $req->string('tab')->lower()) {
            // backward compat: si usas 'tab' como 'tipo'
            $q->where('tipo', $tab);
        }
        if ($nombre = (string) $req->string('nombre')) {
            $q->where('nombre', 'LIKE', '%' . $nombre . '%');
        }

        if ($cargo = (string) $req->string('cargo')) {
            $q->where('cargo', $cargo);
        }
        if ($ciudad = (string) $req->string('ciudad')) {
            $q->where('ciudad', $ciudad);
        }

        // Filtro de área (string) contra JSON[]
        if ($area = (string) $req->string('area')) {
            // requiere MySQL 5.7+/8: JSON_CONTAINS
            $q->whereJsonContains('areas', $area);
        }

        // Orden
        $sort = (string) $req->query('sort', 'latest'); // latest | nombre
        $sort === 'latest' ? $q->orderByDesc('id') : $q->orderBy('nombre');

        $page = $q->paginate($perPage)->appends($req->query());

        // Facets
        $rows = team_members::select('cargo', 'areas', 'ciudad')->get();

        $facets = [
            'cargos'   => $rows->pluck('cargo')->filter()->unique()->sort()->values()->all(),
            'areas'    => $rows->pluck('areas')->filter()->flatMap(function ($a) {
                return collect(is_array($a) ? $a : []);
            })->filter()->unique()->sort()->values()->all(),
            'ciudades' => $rows->pluck('ciudad')->filter()->unique()->sort()->values()->all(),
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
            'areas'    => 'required|array|min:1',
            'areas.*'  => 'string|max:255',
            'ciudad'   => 'required|string|max:255',
            'tipo'     => 'required|string|max:50', // libre (incluye 'otro')
            'tipo_otro' => 'nullable|string|max:50',
            'foto'     => 'nullable|image',
        ]);

        $data = collect($validated)->except('foto', 'tipo_otro')->all();

        // Si frente te manda tipo='otro' y tipo_otro='X', usa X
        if (($validated['tipo'] ?? '') === 'otro' && !empty($validated['tipo_otro'])) {
            $data['tipo'] = $validated['tipo_otro'];
        }

        // slug
        $data['slug'] = Str::slug($validated['nombre']);

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
            'areas'    => 'sometimes|required|array|min:1',
            'areas.*'  => 'string|max:255',
            'ciudad'   => 'sometimes|required|string|max:255',
            'tipo'     => 'sometimes|required|string|max:50',
            'tipo_otro' => 'nullable|string|max:50',
            'foto'     => 'nullable|image',
        ]);

        $data = collect($validated)->except('foto', 'tipo_otro')->all();

        if (($validated['tipo'] ?? '') === 'otro' && !empty($validated['tipo_otro'])) {
            $data['tipo'] = $validated['tipo_otro'];
        }

        if (array_key_exists('nombre', $validated) && $validated['nombre'] !== $m->nombre) {
            $data['slug'] = Str::slug($validated['nombre']);
        }

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
