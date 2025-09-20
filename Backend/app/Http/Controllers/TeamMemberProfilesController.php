<?php

namespace App\Http\Controllers;
 
use App\Models\team_members;
use Illuminate\Http\Request;

class TeamMemberProfilesController extends Controller
{
    public function showBySlug(string $slug)
    {
        $m = team_members::where('slug', $slug)->with('profile')->firstOrFail();
        return response()->json(['data' => $m->profile]); // puede ser null
    }

    // Crea o actualiza (upsert) el perfil del miembro
    public function upsertBySlug(Request $req, string $slug)
    {
        $m = team_members::where('slug', $slug)->firstOrFail();

        $data = $req->validate([
            'email' => ['nullable', 'email', 'max:255'],
            'idiomas' => ['nullable', 'array'],
            'idiomas.*' => ['string', 'max:80'],
            'perfil' => ['nullable', 'string'],
            'educacion' => ['nullable', 'array'],
            'educacion.*' => ['string', 'max:500'],
            'experiencia' => ['nullable', 'array'],
            'experiencia.*' => ['string', 'max:500'],
            'reconocimientos' => ['nullable', 'array'],
            'reconocimientos.*' => ['string', 'max:500'],
        ]);

        $p = $m->profile()->updateOrCreate([], $data);
        return response()->json(['data' => $p], 200);
    }

    public function destroyBySlug(string $slug)
    {
        $m = team_members::where('slug', $slug)->firstOrFail();
        $m->profile()?->delete();
        return response()->json(['ok' => true]);
    }
}
