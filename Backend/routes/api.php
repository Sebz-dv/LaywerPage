<?php

use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CarouselController;
use App\Http\Controllers\InfoBlockController;
use App\Http\Controllers\PracticeAreaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TeamMemberProfilesController;
use App\Http\Controllers\TeamMembersController;

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
    Route::get('me',                    [AuthController::class, 'me']);
    Route::get('profile',               [ProfileController::class, 'show']);
    Route::put('profile',               [ProfileController::class, 'update']);
    Route::put('profile/password',      [ProfileController::class, 'updatePassword']);

    // Team (solo escritura aquí para no exponer públicamente)
    Route::apiResource('team', TeamMembersController::class)->only(['store', 'update', 'destroy']);

    // Perfil extendido por slug (upsert/delete)
    Route::match(['post', 'patch'], 'team/{slug}/profile', [TeamMemberProfilesController::class, 'upsertBySlug']);
    Route::delete('team/{slug}/profile',                  [TeamMemberProfilesController::class, 'destroyBySlug']);

    // Carrusel (subir/borrar)
    Route::post('carrusel',                               [CarouselController::class, 'store']);
    Route::delete('carrusel/{filename}',                  [CarouselController::class, 'destroy']);

    // InfoBlocks (CRUD + reorder)
    Route::apiResource('info-blocks', InfoBlockController::class)->only(['store', 'update', 'destroy']);
    Route::patch('info-blocks/reorder',                   [InfoBlockController::class, 'reorder']);

    // Settings (actualizar y borrar logo)
    Route::post('settings',                               [SettingsController::class, 'update']);       // multipart
    Route::delete('settings/logo',                        [SettingsController::class, 'destroyLogo']);

    // Practice Areas (CRUD + toggle)
    Route::post('practice-areas', [PracticeAreaController::class, 'store']);
    Route::match(['put', 'patch'], 'practice-areas/{practice_area}', [PracticeAreaController::class, 'update']);
    Route::delete('practice-areas/{practice_area}', [PracticeAreaController::class, 'destroy']);
    Route::post('practice-areas/{practice_area}/toggle', [PracticeAreaController::class, 'toggle']);
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
    Route::get('carrusel',                    [CarouselController::class, 'index']);
    Route::get('carrusel/{filename}/download', [CarouselController::class, 'download']);

    // InfoBlocks (listar y ver)
    Route::apiResource('info-blocks', InfoBlockController::class)->only(['index', 'show']);

    // Settings (público para que el front lea configuraciones)
    Route::get('settings', [SettingsController::class, 'show']);

    // Practice Areas (listar y ver)
    Route::get('practice-areas', [PracticeAreaController::class, 'index']);
    Route::get('practice-areas/{practice_area}', [PracticeAreaController::class, 'show']);
});
