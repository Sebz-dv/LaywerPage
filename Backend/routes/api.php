<?php

use Illuminate\Support\Facades\Route;

use App\Models\PracticeArea;
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
| PATRONES GLOBALES (solo ID numérico)
|--------------------------------------------------------------------------
*/
Route::pattern('practice_area', '[0-9]+');
Route::pattern('article', '[0-9]+');

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/
Route::post('register', [AuthController::class, 'register']);
Route::post('login',    [AuthController::class, 'login']);

Route::post('refresh',  [AuthController::class, 'refresh'])->middleware('jwt.cookie');
Route::post('logout',   [AuthController::class, 'logout'])->middleware('jwt.cookie');

/*
|--------------------------------------------------------------------------
| PRIVADAS (JWT)
|--------------------------------------------------------------------------
*/
Route::middleware(['jwt.cookie', 'auth:api'])->group(function () {
    Route::get('me',               [AuthController::class, 'me']);
    Route::get('profile',          [ProfileController::class, 'show']);
    Route::put('profile',          [ProfileController::class, 'update']);
    Route::put('profile/password', [ProfileController::class, 'updatePassword']);

    Route::apiResource('team', TeamMembersController::class)->only(['store', 'update', 'destroy']);

    Route::match(['post', 'patch'], 'team/{slug}/profile', [TeamMemberProfilesController::class, 'upsertBySlug']);
    Route::delete('team/{slug}/profile',                   [TeamMemberProfilesController::class, 'destroyBySlug']);

    Route::post('carrusel',              [CarouselController::class, 'store']);
    Route::delete('carrusel/{filename}', [CarouselController::class, 'destroy'])
        ->where('filename', '[A-Za-z0-9._-]+');

    Route::apiResource('info-blocks', InfoBlockController::class)->only(['store', 'update', 'destroy']);
    Route::patch('info-blocks/reorder', [InfoBlockController::class, 'reorder']);

    Route::post('settings',        [SettingsController::class, 'update']);
    Route::delete('settings/logo', [SettingsController::class, 'destroyLogo']);

    Route::post('practice-areas',                        [PracticeAreaController::class, 'store'])->name('practice-areas.store');
    Route::put('practice-areas/{practice_area}',         [PracticeAreaController::class, 'update'])->name('practice-areas.update');
    Route::delete('practice-areas/{practice_area}',      [PracticeAreaController::class, 'destroy'])->name('practice-areas.destroy');
    Route::post('practice-areas/{practice_area}/toggle', [PracticeAreaController::class, 'toggle'])->name('practice-areas.toggle');

    // Articles privadas (ID numérico forzado por pattern)
    Route::post('articles',                           [ArticleController::class, 'store']);
    Route::post('articles/{article}/toggle-publish',  [ArticleController::class, 'togglePublish']);
    Route::post('articles/{article}/toggle-featured', [ArticleController::class, 'toggleFeatured']);
    Route::post('articles/{article}',                 [ArticleController::class, 'update']);
    Route::delete('articles/{article}',               [ArticleController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| PÚBLICAS (solo lectura)
|--------------------------------------------------------------------------
*/
Route::middleware([])->group(function () {
    Route::apiResource('team', TeamMembersController::class)->only(['index', 'show']);
    Route::get('team/{slug}/profile', [TeamMemberProfilesController::class, 'showBySlug']);

    Route::get('carrusel',                     [CarouselController::class, 'index']);
    Route::get('carrusel/{filename}/download', [CarouselController::class, 'download'])
        ->where('filename', '[A-Za-z0-9._-]+');

    Route::apiResource('info-blocks', InfoBlockController::class)->only(['index', 'show']);
    Route::get('settings', [SettingsController::class, 'show']);

    Route::get('practice-areas',                 [PracticeAreaController::class, 'index'])->name('practice-areas.index');
    Route::get('practice-areas/{practice_area}', [PracticeAreaController::class, 'show'])->name('practice-areas.show');

    // ARTÍCULOS: listado y detalle SOLO por ID numérico
    Route::get('articles',           [ArticleController::class, 'index']);
    Route::get('articles/{article}', [ArticleController::class, 'show']); // pattern ya fuerza número
});

Route::fallback(fn() => response()->json(['message' => 'Not Found'], 404));
