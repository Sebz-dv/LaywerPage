<?php

namespace App\Http\Controllers;

use App\Models\Settings;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    public function show()
    {
        $settings = Settings::query()->first() ?? Settings::create([]);
        // Opcional: devolver URL absoluta del logo
        if ($settings->logo_path) {
            $settings->logo_url = Settings::url($settings->logo_path);
        }
        return response()->json($settings);
    }


    public function update(Request $req)
    {
        $settings = Settings::query()->first() ?? Settings::create([]);

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

        // Reglas: usa "sometimes" para no exigir campos cuando no existen
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

            'logo'          => ['sometimes', 'nullable', 'file', 'mimes:png,jpg,jpeg,webp,svg', 'max:2048'],
        ]);

        if ($req->hasFile('logo')) {
            if ($settings->logo_path) Storage::delete($settings->logo_path);
            $data['logo_path'] = $req->file('logo')->store('public/logos');
        }

        $data['updated_by'] = $req->user()?->id;
        $settings->fill($data)->save();

        if ($settings->logo_path) $settings->logo_url = Storage::url($settings->logo_path);

        return response()->json($settings->refresh());
    }

    public function destroyLogo()
    {
        $s = Settings::query()->first() ?? abort(404);
        if ($s->logo_path) Storage::delete($s->logo_path);
        $s->logo_path = null;
        $s->save();
        return response()->json(['ok' => true]);
    }
}
