<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Str;

class CarouselController extends Controller
{
    /**
     * GET /api/carrusel
     */
    public function index()
    {
        $disk  = Storage::disk('public');
        $files = collect($disk->files('carrusel'))
            ->filter(fn($p) => preg_match('/\.(png|jpe?g|webp|avif)$/i', $p))
            ->sort()
            ->values();

        // Log básico
        Log::info('Carousel.index', [
            'count' => $files->count(),
        ]);

        $items = $files->map(function ($path) use ($disk) {
            // ✅ Fuerza ruta relativa, sin APP_URL ni schema
            $rel  = '/storage/' . str_replace('\\', '/', ltrim($path, '/'));
            $name = pathinfo($path, PATHINFO_FILENAME);

            // Dimensiones y bytes para inspección (no obligatorio)
            $abs = $disk->path($path);
            [$w, $h] = @getimagesize($abs) ?: [null, null];
            $bytes = $disk->size($path);

            return [
                'src'    => $rel,
                'alt'    => preg_replace('/[-_]+/', ' ', $name),
                'width'  => $w,
                'height' => $h,
                'bytes'  => $bytes,
            ];
        });

        return response()->json($items);
    }

    /**
     * POST /api/carrusel
     */
    public function store(Request $request)
    {
        // Lee límite dinámico desde env. 0 = sin regla "max" en validación.
        // Por defecto 20 MB (20480 KB).
        $maxKb = (int) env('CAROUSEL_MAX_KB', 20480);

        // Logs previos: útil si el request entra (si hay 413 por server, no llega aquí)
        Log::info('Carousel.store:start', [
            'ip'               => $request->ip(),
            'ua'               => substr($request->userAgent() ?? '', 0, 160),
            'content_length'   => $request->header('Content-Length'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size'       => ini_get('post_max_size'),
            'memory_limit'        => ini_get('memory_limit'),
            'env_max_kb'          => $maxKb,
        ]);

        // Reglas de validación
        $rules = [
            'image'  => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp,avif'],
            'prefix' => ['sometimes', 'string', 'regex:/^[a-zA-Z0-9_-]+$/'],
            'pad'    => ['sometimes', 'integer', 'min:0', 'max:6'],
        ];
        if ($maxKb > 0) {
            $rules['image'][] = "max:{$maxKb}";
        }

        $validated = $request->validate($rules);

        $disk   = Storage::disk('public');
        $dir    = 'carrusel';
        $prefix = $request->input('prefix', 'imagen'); // default: "imagen"
        $pad    = (int) $request->input('pad', 0);     // default: sin padding

        // Asegurar directorio
        if (!$disk->exists($dir)) {
            $disk->makeDirectory($dir);
        }

        $file = $request->file('image');
        $ext  = Str::lower($file->extension() ?: $file->getClientOriginalExtension() ?: 'jpg');

        // Log de archivo entrante
        Log::info('Carousel.store:file', [
            'original_name' => $file->getClientOriginalName(),
            'client_mime'   => $file->getClientMimeType(),
            'server_mime'   => $file->getMimeType(),
            'size_bytes'    => $file->getSize(),
            'ext'           => $ext,
            'prefix'        => $prefix,
            'pad'           => $pad,
        ]);

        // 1) Buscar el mayor índice existente para el prefijo
        $files = $disk->files($dir);
        $max   = 0;

        // regex: ^{prefix}_{numero}.{ext}  (la ext valida la usamos al guardar)
        $regex = '/^' . preg_quote($prefix, '/') . '_(\d+)\.(?:jpe?g|png|webp|avif)$/i';

        foreach ($files as $path) {
            $base = pathinfo($path, PATHINFO_BASENAME);
            if (preg_match($regex, $base, $m)) {
                $n = (int) $m[1];
                if ($n > $max) $max = $n;
            }
        }

        // 2) Siguiente índice
        $idx = $max + 1;

        // 3) Guardar evitando colisiones (concurrencia)
        $maxAttempts = 20; // evita loops infinitos
        $savedAs = null;

        for ($i = 0; $i < $maxAttempts; $i++) {
            $num     = $pad > 0 ? str_pad((string) $idx, $pad, '0', STR_PAD_LEFT) : (string) $idx;
            $name    = "{$prefix}_{$num}.{$ext}";
            $relPath = "{$dir}/{$name}";

            if (!$disk->exists($relPath)) {
                // putFileAs es atómico a nivel de Filesystem
                $disk->putFileAs($dir, $file, $name);
                $savedAs = $name;
                break;
            }

            $idx++;
        }

        if (!$savedAs) {
            Log::error('Carousel.store:unique_name_failed', [
                'dir' => $dir,
                'prefix' => $prefix,
                'attempts' => $maxAttempts,
            ]);
            return response()->json(['message' => 'No se pudo generar un nombre único'], 500);
        }

        // Ruta relativa para front
        $rel = '/storage/' . str_replace('\\', '/', "{$dir}/{$savedAs}");

        // Datos finales (bytes reales, dimensiones)
        $storedPath = "{$dir}/{$savedAs}";
        $abs        = $disk->path($storedPath);
        [$w, $h]    = @getimagesize($abs) ?: [null, null];
        $bytes      = $disk->size($storedPath);
        $mime       = $disk->mimeType($storedPath) ?? 'image/*';

        Log::info('Carousel.store:done', [
            'saved_as'   => $savedAs,
            'rel'        => $rel,
            'bytes'      => $bytes,
            'width'      => $w,
            'height'     => $h,
            'mime'       => $mime,
        ]);

        return response()->json([
            'src'    => $rel,
            'alt'    => preg_replace('/[-_]+/', ' ', pathinfo($savedAs, PATHINFO_FILENAME)), // "imagen 001"
            'name'   => $savedAs,
            'width'  => $w,
            'height' => $h,
            'bytes'  => $bytes,
            'mime'   => $mime,
        ], 201);
    }

    /**
     * GET /api/carrusel/{filename}/download
     */
    public function download(string $filename): StreamedResponse
    {
        $filename = basename($filename);

        if (!preg_match('/\.(png|jpe?g|webp|avif)$/i', $filename)) {
            abort(400, 'Extensión no permitida');
        }

        $disk = Storage::disk('public');
        $path = "carrusel/{$filename}";

        if (!$disk->exists($path)) {
            abort(404, 'No encontrado');
        }

        $mime = $disk->mimeType($path) ?? 'application/octet-stream';

        // Content-Disposition robusto (RFC 5987)
        $disposition = 'attachment; filename="' . addslashes($filename) . '"; filename*=UTF-8\'\'' . rawurlencode($filename);

        Log::info('Carousel.download', [
            'filename' => $filename,
            'mime'     => $mime,
            'bytes'    => $disk->size($path),
        ]);

        return $disk->download($path, $filename, [
            'Content-Type'        => $mime,
            'Content-Disposition' => $disposition,
            'Cache-Control'       => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma'              => 'no-cache',
        ]);
    }

    /**
     * DELETE /api/carrusel/{filename}
     */
    public function destroy(string $filename)
    {
        $filename = basename($filename); // evitar path traversal
        $path = "carrusel/{$filename}";
        $disk = Storage::disk('public');

        if (!$disk->exists($path)) {
            Log::warning('Carousel.destroy:not_found', ['filename' => $filename]);
            return response()->json(['message' => 'No encontrado'], 404);
        }

        $disk->delete($path);
        Log::info('Carousel.destroy:deleted', ['filename' => $filename]);

        return response()->json(['ok' => true]);
    }

    /**
     * (Opcional) GET /api/carrusel/limits
     * Útil para diagnosticar 413 (cuando store() no corre).
     * Agrega la ruta: Route::get('/carrusel/limits', [CarouselController::class, 'limits']);
     */
    public function limits()
    {
        $data = [
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size'       => ini_get('post_max_size'),
            'memory_limit'        => ini_get('memory_limit'),
            'env.CAROUSEL_MAX_KB' => env('CAROUSEL_MAX_KB', 20480),
        ];
        Log::info('Carousel.limits', $data);
        return response()->json($data);
    }
}
