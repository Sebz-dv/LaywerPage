<?php

namespace App\Http\Controllers;

use App\Models\Settings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SettingsController extends Controller
{
    public function show()
    {
        $settings = Settings::query()->first() ?? Settings::create([]);

        // URL pública ABSOLUTA del logo (si existe)
        $settings->logo_url = $settings->logo_path
            ? url(Storage::url($settings->logo_path))
            : null;

        return response()->json($settings);
    }

    public function update(Request $req)
    {
        $settings = Settings::query()->firstOrCreate([]);
        // Coerce JSON si vino como string (multipart)
        foreach (['social_links', 'footer_blocks'] as $key) {
            $val = $req->input($key);
            if (is_string($val)) {
                $decoded = json_decode($val, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $req->merge([$key => $decoded]);
                }
            }
        }
        // Validación
        $data = $req->validate([
            'site_name'     => ['sometimes', 'nullable', 'string', 'max:120'],
            'email'         => ['sometimes', 'nullable', 'email', 'max:160'],
            'phone'         => ['sometimes', 'nullable', 'string', 'max:60'],
            'address'       => ['sometimes', 'nullable', 'string', 'max:255'],

            'social_links'  => ['sometimes', 'nullable', 'array'],
            'social_links.*.platform' => ['required_with:social_links.*', 'string', 'max:40'],
            'social_links.*.url'      => ['required_with:social_links.*', 'url', 'max:255'],
            'social_links.*.handle'   => ['sometimes', 'nullable', 'string', 'max:80'],

            'footer_blocks' => ['sometimes', 'nullable', 'array'],
            'footer_blocks.*.title' => ['required_with:footer_blocks.*', 'string', 'max:80'],
            'footer_blocks.*.html'  => ['sometimes', 'nullable', 'string'],
            // Aceptamos 'logo' (preferido) y 'logo_path' (compat)
            'logo'          => ['sometimes', 'file', 'mimes:png,jpg,jpeg,webp,svg', 'max:2048'],
            'logo_path'     => ['sometimes', 'file', 'mimes:png,jpg,jpeg,webp,svg', 'max:2048'],
        ]);
        // Manejo de archivo (prioriza 'logo')
        $file = $req->file('logo') ?? $req->file('logo_path');
        if ($file) {
            // Borra anterior en el mismo disco
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }
            // Guarda en disco 'public' dentro de 'logos' -> path: 'logos/archivo.png'
            $stored = $file->store('logos', 'public');
            $data['logo_path'] = $stored;
        } else {
            Log::warning('⚠️ No se recibió archivo "logo" ni "logo_path"');
        }
        unset($data['logo']);
        $data['updated_by'] = $req->user()?->id ?? null;
        $settings->fill($data)->save();
        // Arma logo_url ABSOLUTA y con cache-busting
        $fresh = $settings->fresh();
        $fresh->logo_url = $fresh->logo_path
            ? url(Storage::url($fresh->logo_path)) . '?t=' . now()->timestamp
            : null;
        return response()->json($fresh);
    }

    public function destroyLogo()
    {
        $s = Settings::query()->first() ?? abort(404);
        if ($s->logo_path) {
            Storage::disk('public')->delete($s->logo_path);
            $s->logo_path = null;
            $s->save();
        } else {
            Log::info('No había logo para eliminar');
        }
        return response()->json(['ok' => true]);
    }
}
