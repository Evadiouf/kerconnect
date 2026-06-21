<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrat;
use App\Models\Paiement;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaiementController extends Controller
{
    // ── Initier un paiement
    public function initier(Request $request): JsonResponse
    {
        $request->validate([
            'contrat_id' => 'required|exists:contrats,id',
            'mode'       => 'required|in:espece,cheque,wave,orange_money,carte',
            'montant'    => 'required|numeric|min:1',
            'libelle'    => 'nullable|string',
            'periode'    => 'nullable|date',
        ]);

        $contrat = Contrat::findOrFail($request->contrat_id);

        // Vérifier que l'utilisateur est le locataire ou le bailleur
        $user = $request->user();
        if (!in_array($user->id, [$contrat->bailleur_id, $contrat->locataire_id])) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $paiement = Paiement::create([
            'contrat_id'     => $contrat->id,
            'payeur_id'      => $user->id,
            'reference'      => 'TRX-' . strtoupper(Str::random(8)),
            'montant'        => $request->montant,
            'mode'           => $request->mode,
            'libelle'        => $request->libelle ?? 'Paiement KerConnect',
            'periode'        => $request->periode,
            'statut'         => in_array($request->mode, ['espece', 'cheque']) ? 'en_attente' : 'en_attente',
        ]);

        // Pour les modes manuels (espèce, chèque), confirmer directement
        if (in_array($request->mode, ['espece', 'cheque'])) {
            return response()->json([
                'message'    => 'Paiement enregistré. En attente de confirmation bailleur.',
                'paiement'   => $paiement,
                'need_confirm' => true,
            ], 201);
        }

        // Pour Mobile Money / Carte → simulation (en prod: appel PayDunya API)
        $paymentUrl = $this->initierPaydunya($paiement, $request->mode);

        return response()->json([
            'message'     => 'Redirection vers le paiement.',
            'paiement'    => $paiement,
            'payment_url' => $paymentUrl,
        ], 201);
    }

    // ── Confirmer un paiement (bailleur pour espèce/chèque)
    public function confirmer(Request $request, string $id): JsonResponse
    {
        $paiement = Paiement::with('contrat')->findOrFail($id);

        if ($paiement->contrat->bailleur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $paiement->update([
            'statut'  => 'confirme',
            'paye_at' => now(),
        ]);

        return response()->json(['message' => 'Paiement confirmé.', 'paiement' => $paiement->fresh()]);
    }

    // ── Webhook PayDunya (confirmation automatique)
    public function webhook(Request $request): JsonResponse
    {
        $reference = $request->input('custom_data.reference') ?? $request->input('reference');
        $statut    = $request->input('status');

        if (!$reference) {
            return response()->json(['error' => 'Reference manquante.'], 400);
        }

        $paiement = Paiement::where('reference', $reference)->first();
        if (!$paiement) {
            return response()->json(['error' => 'Paiement introuvable.'], 404);
        }

        if ($statut === 'completed') {
            $paiement->update([
                'statut'         => 'confirme',
                'transaction_id' => $request->input('token'),
                'paye_at'        => now(),
            ]);
        } elseif ($statut === 'failed') {
            $paiement->update(['statut' => 'echoue']);
        }

        return response()->json(['received' => true]);
    }

    // ── Historique paiements d'un contrat
    public function historique(Request $request, string $contratId): JsonResponse
    {
        $paiements = Paiement::with('payeur:id,name')
            ->where('contrat_id', $contratId)
            ->latest()->get();
        return response()->json($paiements);
    }

    // ── Générer reçu PDF
    public function recu(Request $request, string $id)
    {
        $paiement = Paiement::with(['contrat.bien', 'contrat.bailleur', 'contrat.locataire', 'payeur'])->findOrFail($id);

        // Vérifier accès
        $user = $request->user();
        if (!in_array($user->id, [$paiement->contrat->bailleur_id, $paiement->contrat->locataire_id])) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $pdf = Pdf::loadView('recus.paiement', ['paiement' => $paiement]);

        return $pdf->download("recu-{$paiement->reference}.pdf");
    }

    // ── Simulation PayDunya (à remplacer par vrai SDK en production)
    private function initierPaydunya(Paiement $paiement, string $mode): string
    {
        // En production : appeler l'API PayDunya
        // $paydunya = new \PayDunya\Setup(...);
        // return $paydunya->invoiceCreate([...]);

        // Simulation : URL de retour avec référence
        $baseUrl = config('app.url');
        return "{$baseUrl}/paiement/callback?ref={$paiement->reference}&mode={$mode}";
    }
}
