<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alerte;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlerteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $alertes = Alerte::where('user_id', $request->user()->id)->get();
        return response()->json($alertes);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'ville'     => 'nullable|string',
            'nature'    => 'nullable|in:location,vente',
            'prix_max'  => 'nullable|numeric|min:0',
            'type_bien' => 'nullable|string',
        ]);

        $alerte = Alerte::create([
            ...$request->only(['ville', 'nature', 'prix_max', 'type_bien']),
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Alerte créée.', 'alerte' => $alerte], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        Alerte::where('id', $id)->where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'Alerte supprimée.']);
    }
}
