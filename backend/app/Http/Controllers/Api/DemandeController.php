<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DemandeController extends Controller
{
    public function index(): JsonResponse { return response()->json([]); }

    // Client : soumettre une demande
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'bien_id'           => 'required|exists:biens,id',
            'type'              => 'required|in:location,achat,visite',
            'prenom_nom'        => 'required|string',
            'telephone'         => 'nullable|string',
            'description'       => 'nullable|string',
            'date_emmenagement' => 'nullable|date',
            'duree_souhaitee'   => 'nullable|string',
            'date_visite'       => 'nullable|date',
            'heure_visite'      => 'nullable|string',
        ]);

        $demande = Demande::create([
            ...$request->only(['bien_id','type','prenom_nom','telephone','description','date_emmenagement','duree_souhaitee','date_visite','heure_visite']),
            'demandeur_id' => $request->user()->id,
            'statut'       => 'soumise',
        ]);

        return response()->json(['message' => 'Demande soumise.', 'demande' => $demande->load('bien:id,titre,nature,prix')], 201);
    }

    // Client : mes demandes
    public function mesDemandes(Request $request): JsonResponse
    {
        $demandes = Demande::with('bien:id,titre,nature,prix,adresse,ville')
            ->where('demandeur_id', $request->user()->id)
            ->latest()->paginate(10);
        return response()->json($demandes);
    }

    // Bailleur : demandes reçues
    public function demandesBailleur(Request $request): JsonResponse
    {
        $demandes = Demande::with(['bien:id,titre,nature,prix', 'demandeur:id,name,email,phone'])
            ->whereHas('bien', fn($q) => $q->where('user_id', $request->user()->id))
            ->latest()->paginate(10);
        return response()->json($demandes);
    }

    // Détail d'une demande
    public function show(Request $request, string $id): JsonResponse
    {
        $demande = Demande::with(['bien', 'demandeur:id,name,email,phone', 'contrat'])->findOrFail($id);
        return response()->json($demande);
    }

    // Bailleur : accepter ou refuser
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate(['statut' => 'required|in:acceptee,refusee,en_cours']);

        $demande = Demande::whereHas('bien', fn($q) => $q->where('user_id', $request->user()->id))->findOrFail($id);
        $demande->update(['statut' => $request->statut]);

        return response()->json(['message' => "Demande {$request->statut}.", 'demande' => $demande]);
    }

    public function destroy(string $id): JsonResponse { return response()->json([], 204); }
}
