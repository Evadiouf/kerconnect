<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Avis;
use App\Models\Contrat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvisController extends Controller
{
    // Laisser un avis après un contrat validé
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'contrat_id'  => 'required|exists:contrats,id',
            'note'        => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string|max:500',
        ]);

        $contrat = Contrat::findOrFail($request->contrat_id);
        $user    = $request->user();

        // Vérifier que l'utilisateur est partie prenante
        if (!in_array($user->id, [$contrat->bailleur_id, $contrat->locataire_id])) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        // Vérifier que le contrat est validé
        if ($contrat->statut !== 'valide') {
            return response()->json(['message' => 'Vous ne pouvez noter qu\'après validation du contrat.'], 422);
        }

        // Déterminer qui note qui
        if ($user->id === $contrat->locataire_id) {
            $cibleId = $contrat->bailleur_id;
            $type    = 'client_note_bailleur';
        } else {
            $cibleId = $contrat->locataire_id;
            $type    = 'bailleur_note_client';
        }

        // Vérifier qu'il n'a pas déjà noté
        if (Avis::where('contrat_id', $contrat->id)->where('auteur_id', $user->id)->exists()) {
            return response()->json(['message' => 'Vous avez déjà laissé un avis pour ce contrat.'], 422);
        }

        $avis = Avis::create([
            'contrat_id'  => $contrat->id,
            'auteur_id'   => $user->id,
            'cible_id'    => $cibleId,
            'note'        => $request->note,
            'commentaire' => $request->commentaire,
            'type'        => $type,
        ]);

        // Recalculer la note moyenne de la cible
        $noteMoyenne = Avis::where('cible_id', $cibleId)->avg('note');
        \App\Models\User::where('id', $cibleId)->update(['note_moyenne' => round($noteMoyenne, 1)]);

        return response()->json(['message' => 'Avis enregistré.', 'avis' => $avis], 201);
    }

    // Avis reçus par un utilisateur
    public function index(Request $request, string $userId): JsonResponse
    {
        $avis = Avis::with('auteur:id,name')
            ->where('cible_id', $userId)
            ->latest()->paginate(10);
        return response()->json($avis);
    }
}
