<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bien;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BienController extends Controller
{
    // ── Liste publique (avec filtres)
    public function index(Request $request): JsonResponse
    {
        $query = Bien::with('bailleur:id,name,phone')
            ->where('statut', 'publie');

        if ($request->nature) $query->where('nature', $request->nature);
        if ($request->type)   $query->where('type', $request->type);
        if ($request->ville)  $query->where('ville', 'like', "%{$request->ville}%");
        if ($request->prix_max) $query->where('prix', '<=', $request->prix_max);

        $biens = $query->latest()->paginate(12);
        return response()->json($biens);
    }

    // ── Detail public
    public function show(string $id): JsonResponse
    {
        $bien = Bien::with('bailleur:id,name,phone')->findOrFail($id);
        return response()->json($bien);
    }

    // ── Biens du bailleur connecté
    public function mesBiens(Request $request): JsonResponse
    {
        $biens = Bien::where('user_id', $request->user()->id)->latest()->paginate(10);
        return response()->json($biens);
    }

    // ── Créer annonce
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'titre'       => 'required|string|max:255',
            'type'        => 'required|string',
            'nature'      => 'required|in:location,vente',
            'prix'        => 'required|numeric|min:0',
            'adresse'     => 'required|string',
            'ville'       => 'required|string',
            'description' => 'nullable|string',
            'surface'     => 'nullable|numeric',
            'chambres'    => 'nullable|integer|min:0',
            'salles_bain' => 'nullable|integer|min:0',
            'equipements' => 'nullable|array',
        ]);

        $bien = Bien::create([
            ...$request->only(['titre','type','nature','prix','description','adresse','ville','surface','chambres','salles_bain','equipements']),
            'user_id' => $request->user()->id,
            'statut'  => 'en_attente',
        ]);

        return response()->json(['message' => 'Annonce créée, en attente de validation.', 'bien' => $bien], 201);
    }

    // ── Modifier annonce
    public function update(Request $request, string $id): JsonResponse
    {
        $bien = Bien::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();

        $bien->update($request->only(['titre','type','nature','prix','description','adresse','ville','surface','chambres','salles_bain','equipements']));

        return response()->json(['message' => 'Annonce mise à jour.', 'bien' => $bien]);
    }

    // ── Retirer annonce
    public function destroy(Request $request, string $id): JsonResponse
    {
        $bien = Bien::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
        $bien->update(['statut' => 'retire']);
        return response()->json(['message' => 'Annonce retirée.']);
    }
}
