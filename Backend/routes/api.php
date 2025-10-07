<?php

use Illuminate\Support\Facades\Route;

// Models
use App\Models\PracticeArea;
use App\Models\Article;

// Controllers
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CarouselController;
use App\Http\Controllers\InfoBlockController;
use App\Http\Controllers\PracticeAreaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TeamMemberProfilesController;
use App\Http\Controllers\TeamMembersController;
use App\Http\Controllers\ArticleController;

/*
|--------------------------------------------------------------------------
| BINDINGS (id o slug)
|--------------------------------------------------------------------------
*/

Route::bind('practice_area', function ($value) {
    return PracticeArea::query()
        ->where('id', is_numeric($value) ? $value : -1)
        ->orWhere('slug', $value)
        ->firstOrFail();
});

Route::bind('article', function ($value) {
    return Article::query()
        ->where('id', is_numeric($value) ? $value : -1)
        ->orWhere('slug', $value)
        ->firstOrFail();
});

/*
|--------------------------------------------------------------------------
| AUTH (públicas básicas + protegidas con cookie JWT)
|--------------------------------------------------------------------------
*/

Route::post('register', [AuthController::class, 'register']); // opcional pública
Route::post('login',    [AuthController::class, 'login']);

Route::post('refresh',  [AuthController::class, 'refresh'])->middleware('jwt.cookie');
Route::post('logout',   [AuthController::class, 'logout'])->middleware('jwt.cookie');

/*
|--------------------------------------------------------------------------
| PRIVADAS (requieren JWT en cookie) -> escritura/updates
|--------------------------------------------------------------------------
*/
Route::middleware(['jwt.cookie', 'auth:api'])->group(function () {
    // Perfil propio
    Route::get('me',               [AuthController::class, 'me']);
    Route::get('profile',          [ProfileController::class, 'show']);
    Route::put('profile',          [ProfileController::class, 'update']);
    Route::put('profile/password', [ProfileController::class, 'updatePassword']);

    // Team (solo escritura aquí)
    Route::apiResource('team', TeamMembersController::class)->only(['store', 'update', 'destroy']);

    // Perfil extendido por slug (upsert/delete)
    Route::match(['post', 'patch'], 'team/{slug}/profile', [TeamMemberProfilesController::class, 'upsertBySlug']);
    Route::delete('team/{slug}/profile',                   [TeamMemberProfilesController::class, 'destroyBySlug']);

    // Carrusel (subir/borrar)
    Route::post('carrusel',              [CarouselController::class, 'store']);
    Route::delete('carrusel/{filename}', [CarouselController::class, 'destroy'])
        ->where('filename', '[A-Za-z0-9._-]+');

    // InfoBlocks (CRUD + reorder)
    Route::apiResource('info-blocks', InfoBlockController::class)->only(['store', 'update', 'destroy']);
    Route::patch('info-blocks/reorder', [InfoBlockController::class, 'reorder']);

    // Settings (actualizar y borrar logo)
    Route::post('settings',        [SettingsController::class, 'update']); // multipart
    Route::delete('settings/logo', [SettingsController::class, 'destroyLogo']);

    /*
    |--------------------------------------------------------------------------
    | PRACTICE AREAS (privadas)
    |--------------------------------------------------------------------------
    */
    Route::post('practice-areas',                        [PracticeAreaController::class, 'store'])->name('practice-areas.store');
    Route::put('practice-areas/{practice_area}',         [PracticeAreaController::class, 'update'])->name('practice-areas.update');
    Route::delete('practice-areas/{practice_area}',      [PracticeAreaController::class, 'destroy'])->name('practice-areas.destroy');
    Route::post('practice-areas/{practice_area}/toggle', [PracticeAreaController::class, 'toggle'])->name('practice-areas.toggle');

    /*
    |--------------------------------------------------------------------------
    | ARTICLES (privadas: CRUD + toggles)
    |--------------------------------------------------------------------------
    */
    Route::post('articles',                           [ArticleController::class, 'store']);
    Route::post('articles/{article}/toggle-publish',  [ArticleController::class, 'togglePublish']);
    Route::post('articles/{article}/toggle-featured', [ArticleController::class, 'toggleFeatured']);
    Route::post('articles/{article}',                 [ArticleController::class, 'update']); // POST puro para update (multipart)
    Route::delete('articles/{article}',               [ArticleController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| PÚBLICAS (solo lectura)
|--------------------------------------------------------------------------
*/
Route::middleware([])->group(function () {
    // Team (listing y detalle)
    Route::apiResource('team', TeamMembersController::class)->only(['index', 'show']);

    // Perfil extendido por slug (solo lectura)
    Route::get('team/{slug}/profile', [TeamMemberProfilesController::class, 'showBySlug']);

    // Carrusel (listar + descargar archivos)
    Route::get('carrusel',                     [CarouselController::class, 'index']);
    Route::get('carrusel/{filename}/download', [CarouselController::class, 'download'])
        ->where('filename', '[A-Za-z0-9._-]+');

    // InfoBlocks (listar y ver)
    Route::apiResource('info-blocks', InfoBlockController::class)->only(['index', 'show']);

    // Settings (lectura pública)
    Route::get('settings', [SettingsController::class, 'show']);

    /*
    |--------------------------------------------------------------------------
    | PRACTICE AREAS (públicas)
    |--------------------------------------------------------------------------
    */
    Route::get('practice-areas',                 [PracticeAreaController::class, 'index'])->name('practice-areas.index');
    Route::get('practice-areas/{practice_area}', [PracticeAreaController::class, 'show'])->name('practice-areas.show');

    /*
    |--------------------------------------------------------------------------
    | ARTICLES (públicas)
    |--------------------------------------------------------------------------
    */
    Route::get('articles',                    [ArticleController::class, 'index']);
    Route::get('articles/slug/{slug}',       [ArticleController::class, 'showBySlug'])->where('slug', '[A-Za-z0-9\-]+');
    Route::get('articles/id/{id}',           [ArticleController::class, 'showById'])->whereNumber('id');
    // (Opcional) Genérica por compatibilidad; déjala AL FINAL para no interceptar las anteriores
    // Route::get('articles/{article}',      [ArticleController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| Fallback JSON
|--------------------------------------------------------------------------
*/
Route::fallback(fn() => response()->json(['message' => 'Not Found'], 404));
