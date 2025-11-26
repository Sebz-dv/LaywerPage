<?php

namespace App\Http\Controllers;

use App\Models\MediaSlots;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaSlotsController extends Controller
{
     // GET /api/media-slots/{key}
    public function show(string $key)
    {
        $slot = MediaSlots::where('key', $key)->first();

        if (!$slot) {
            return response()->json([
                'key' => $key,
                'url' => null,
                'alt' => null,
            ], 404);
        }

        return response()->json([
            'key' => $slot->key,
            'url' => Storage::disk('public')->url($slot->path),
            'alt' => $slot->alt,
        ]);
    }

    // POST /api/media-slots/{key}
    // body: image (file), alt (optional)
    public function store(Request $request, string $key)
    {
        $data = $request->validate([
            'image' => ['required', 'image'], // 5MB
            'alt'   => ['nullable', 'string', 'max:255'],
        ]);

        $file = $data['image'];

        // guardamos en disk public/media_slots
        $path = $file->store('media_slots', 'public');

        $slot = MediaSlots::updateOrCreate(
            ['key' => $key],
            [
                'path' => $path,
                'alt'  => $data['alt'] ?? null,
            ]
        );

        return response()->json([
            'key' => $slot->key,
            'url' => Storage::disk('public')->url($slot->path),
            'alt' => $slot->alt,
        ], 201);
    }
}
