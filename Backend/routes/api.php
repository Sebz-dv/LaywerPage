<?php

use Illuminate\Support\Facades\Route;
// routes/api.php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CarouselController;
use App\Http\Controllers\InfoBlockController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TeamMemberProfilesController;
use App\Http\Controllers\TeamMembersController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login',    [AuthController::class, 'login']);

Route::post('refresh',  [AuthController::class, 'refresh'])->middleware('jwt.cookie');
Route::post('logout',   [AuthController::class, 'logout'])->middleware('jwt.cookie');

Route::middleware(['jwt.cookie', 'auth:api'])->group(function () {
    Route::get('me',        [AuthController::class, 'me']);
    // Perfil
    Route::get('profile',          [ProfileController::class, 'show']);
    Route::put('profile',          [ProfileController::class, 'update']);
    Route::put('profile/password', [ProfileController::class, 'updatePassword']);
});

Route::apiResource('team', TeamMembersController::class)->only([
    'index',
    'show',
    'store',
    'update',
    'destroy'
]);

Route::get('/team/{slug}/profile', [TeamMemberProfilesController::class, 'showBySlug']);
Route::match(['post', 'patch'], '/team/{slug}/profile', [TeamMemberProfilesController::class, 'upsertBySlug']);
Route::delete('/team/{slug}/profile', [TeamMemberProfilesController::class, 'destroyBySlug']);

Route::get('/carrusel',   [CarouselController::class, 'index']);
Route::post('/carrusel',  [CarouselController::class, 'store']);
Route::delete('/carrusel/{filename}', [CarouselController::class, 'destroy']);
Route::get('/carrusel/{filename}/download', [CarouselController::class, 'download']);

Route::apiResource('info-blocks', InfoBlockController::class);
Route::patch('info-blocks/reorder', [InfoBlockController::class, 'reorder']);

Route::get('/settings', [SettingsController::class, 'show']);
Route::post('/settings', [SettingsController::class, 'update']);       // multipart
Route::delete('/settings/logo', [SettingsController::class, 'destroyLogo']);
