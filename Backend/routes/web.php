<?php

use App\Http\Controllers\AppLicensesController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/billing/toggle', [AppLicensesController::class, 'toggleFromBrowser']);
