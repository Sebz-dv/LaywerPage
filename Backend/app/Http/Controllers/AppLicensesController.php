<?php

namespace App\Http\Controllers;

use App\Models\AppLicenses;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppLicensesController extends Controller
{
    public function status()
    {
        $clientKey = config('app.client_key');

        $row = DB::table('app_licenses')->where('client_key', $clientKey)->first();

        // Si no existe registro, por seguridad: NO pagado
        if (!$row) {
            return response()->json([
                'paid' => false,
                'reason' => 'license_not_found',
            ]);
        }

        $paidUntilOk = true;
        if ($row->paid_until) {
            $paidUntilOk = now()->lt($row->paid_until);
        }

        $paid = (bool)$row->is_paid && $paidUntilOk;

        return response()->json([
            'paid' => $paid,
            'paid_until' => $row->paid_until,
            'reason' => $paid ? null : ($paidUntilOk ? 'not_paid' : 'expired'),
        ]);
    }

    public function setStatus(Request $request)
    {
        $token = $request->header('X-Billing-Token') ?? $request->input('token');
        if (!$token || $token !== config('app.billing_token')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $clientKey = config('app.client_key');

        $paid = filter_var($request->input('paid'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($paid === null) {
            return response()->json(['message' => 'paid must be true/false'], 422);
        }

        $paidUntil = $request->input('paid_until'); // "2026-01-31 23:59:59" por ejemplo

        DB::table('app_licenses')->updateOrInsert(
            ['client_key' => $clientKey],
            [
                'is_paid' => $paid,
                'paid_until' => $paidUntil,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return response()->json(['ok' => true, 'paid' => $paid, 'paid_until' => $paidUntil]);
    }

    public function toggleFromBrowser(Request $request)
    {
        $token = $request->query('token');
        if (!$token || $token !== config('app.billing_token')) {
            abort(401, 'Unauthorized');
        }

        $paid = $request->query('paid'); // "1" o "0"
        if (!in_array($paid, ['0', '1'], true)) {
            abort(422, 'paid must be 0 or 1');
        }

        $paidUntil = $request->query('paid_until'); // opcional

        $clientKey = config('app.client_key');

        DB::table('app_licenses')->updateOrInsert(
            ['client_key' => $clientKey],
            [
                'is_paid' => $paid === '1',
                'paid_until' => $paidUntil ?: null,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return response("OK. paid={$paid} paid_until={$paidUntil}", 200)
            ->header('Content-Type', 'text/plain');
    }
}
