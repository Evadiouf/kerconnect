<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ContratController extends Controller
{
    // Bailleur : créer un contrat après acceptation demande
    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'demande_id' => 'required|exists:demandes,id',
            'montant'    => 'required|numeric|min:0',
            'date_debut' => 'required|date',
            'date_fin'   => 'nullable|date|after:date_debut',
            'type'       => 'required|in:bail,vente',
        ]);

        $demande = \App\Models\Demande::with('bien')->findOrFail($request->demande_id);

        $contrat = \App\Models\Contrat::create([
            'demande_id'   => $demande->id,
            'bien_id'      => $demande->bien_id,
            'bailleur_id'  => $request->user()->id,
            'locataire_id' => $demande->demandeur_id,
            'numero'       => 'CTR-' . date('Y') . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT),
            'type'         => $request->type,
            'montant'      => $request->montant,
            'date_debut'   => $request->date_debut,
            'date_fin'     => $request->date_fin,
            'statut'       => 'en_attente_signature',
        ]);

        return response()->json(['message' => 'Contrat créé.', 'contrat' => $contrat], 201);
    }

    // Signer le contrat (bailleur ou locataire)
    public function signer(Request $request, string $id): \Illuminate\Http\JsonResponse
    {
        $request->validate(['signature' => 'required|string|min:2']);

        $contrat = \App\Models\Contrat::findOrFail($id);
        $user    = $request->user();

        if ($contrat->bailleur_id === $user->id) {
            $contrat->update(['signature_bailleur' => $request->signature, 'signe_bailleur_at' => now()]);
        } elseif ($contrat->locataire_id === $user->id) {
            $contrat->update(['signature_locataire' => $request->signature, 'signe_locataire_at' => now()]);
        } else {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($contrat->signature_bailleur && $contrat->signature_locataire) {
            $contrat->update(['statut' => 'signe']);
        }

        return response()->json(['message' => 'Signature enregistrée.', 'contrat' => $contrat->fresh()]);
    }

    public function show(string $id): \Illuminate\Http\JsonResponse
    {
        $contrat = \App\Models\Contrat::with(['bien', 'bailleur:id,name,email', 'locataire:id,name,email', 'paiements'])->findOrFail($id);
        return response()->json($contrat);
    }
}
