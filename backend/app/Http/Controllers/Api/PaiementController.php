<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrat;
use App\Models\Paiement;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaiementController extends Controller
{
    // ── Simuler le coût total (commission incluse) avant de payer
    public function simuler(Request $request): JsonResponse
    {
        $request->validate([
            'contrat_id'  => 'required|exists:contrats,id',
            'montant_base' => 'required|numeric|min:1',
        ]);

        $contrat          = \App\Models\Contrat::findOrFail($request->contrat_id);
        $commissionActive = Setting::get('commission_active', '1') === '1';
        $tauxCommission   = $commissionActive ? $this->tauxCommissionPour($contrat) : 0.0;
        $montantBase      = (float) $request->montant_base;
        $commission       = round($montantBase * $tauxCommission / 100, 2);
        $montantTotal     = $montantBase + $commission;

        return response()->json([
            'montant_base'       => $montantBase,
            'commission_taux'    => $tauxCommission,
            'commission_montant' => $commission,
            'montant_total'      => $montantTotal,
        ]);
    }

    // ── Initier un paiement (commission payée par le client, en sus du loyer)
    public function initier(Request $request): JsonResponse
    {
        $request->validate([
            'contrat_id'      => 'required|exists:contrats,id',
            'mode'            => 'required|in:espece,cheque,wave,orange_money,carte',
            'montant_base'    => 'required|numeric|min:1',
            'caution_montant' => 'nullable|numeric|min:0',
            'libelle'         => 'nullable|string',
            'periode'         => 'nullable|date',
        ]);

        $contrat = Contrat::findOrFail($request->contrat_id);

        $user = $request->user();
        if (!in_array($user->id, [$contrat->bailleur_id, $contrat->locataire_id])) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($contrat->statut !== 'valide') {
            return response()->json([
                'message' => 'Le contrat doit être validé par le bailleur avant tout paiement.',
            ], 422);
        }

        // Commission payée par le client : taux selon la nature du contrat (vente/location)
        $commissionActive = Setting::get('commission_active', '1') === '1';
        $tauxCommission   = $commissionActive ? $this->tauxCommissionPour($contrat) : 0.0;
        $montantBase      = (float) $request->montant_base;
        $cautionMontant   = (float) ($request->caution_montant ?? 0);
        // Commission sur le loyer de base uniquement
        $commission   = round($montantBase * $tauxCommission / 100, 2);
        // 1er paiement : cautionMontant = caution_mois × loyer (loyer du 1er mois déjà inclus)
        // Mois suivants : cautionMontant = 0, on ajoute montantBase seul
        $montantTotal = $cautionMontant > 0
            ? $cautionMontant + $commission
            : $montantBase + $commission;

        $paiement = Paiement::create([
            'contrat_id'         => $contrat->id,
            'payeur_id'          => $user->id,
            'reference'          => 'TRX-' . strtoupper(Str::random(8)),
            'montant'            => $montantTotal,
            'montant_base'       => $montantBase,
            'caution_montant'    => $cautionMontant ?: null,
            'commission_taux'    => $tauxCommission,
            'commission_montant' => $commission,
            'montant_net'        => $cautionMontant > 0 ? $cautionMontant : $montantBase,
            'mode'               => $request->mode,
            'libelle'            => $request->libelle ?? 'Paiement KerConnect',
            'periode'            => $request->periode,
            'statut'             => 'en_attente',
        ]);

        if (in_array($request->mode, ['espece', 'cheque'])) {
            return response()->json([
                'message'          => 'Paiement enregistré. En attente de confirmation bailleur.',
                'paiement'         => $paiement,
                'commission'       => $commission,
                'montant_total'    => $montantTotal,
                'need_confirm'     => true,
            ], 201);
        }

        $paymentUrl = $this->initierPaydunya($paiement, $request->mode);

        return response()->json([
            'message'          => 'Redirection vers le paiement.',
            'paiement'         => $paiement,
            'commission'       => $commission,
            'montant_total'    => $montantTotal,
            'payment_url'      => $paymentUrl,
        ], 201);
    }

    // ── Confirmer un paiement (bailleur pour espèce/chèque)
    public function confirmer(Request $request, string $id): JsonResponse
    {
        $paiement = Paiement::with(['contrat.locataire', 'contrat.bien', 'payeur'])->findOrFail($id);

        if ($paiement->contrat->bailleur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        // La commission a déjà été calculée à l'initiation (payée par le client en sus)
        $montantBase = (float) ($paiement->montant_base ?? $paiement->montant);
        $commission  = (float) ($paiement->commission_montant ?? 0);

        $paiement->update([
            'statut'      => 'confirme',
            'paye_at'     => now(),
            'montant_net' => $montantBase,
        ]);

        // Marquer le bien comme loué/vendu — il disparaît du catalogue public
        if ($paiement->contrat->bien) {
            $statutBien = $paiement->contrat->bien->nature === 'vente' ? 'vendu' : 'loue';
            $paiement->contrat->bien->update(['statut' => $statutBien]);
        }

        // Email de confirmation au client
        try {
            $client = $paiement->contrat->locataire ?? $paiement->payeur;
            if ($client?->email) {
                \Illuminate\Support\Facades\Mail::raw(
                    "Votre paiement de " . number_format($paiement->montant, 0, ',', ' ') . " FCFA a été confirmé (réf. {$paiement->reference}).\n\nLe bailleur a bien reçu votre règlement.\n\nMerci d'utiliser KerConnect.",
                    fn($msg) => $msg->to($client->email)->subject('Paiement confirmé sur KerConnect')
                );
            }
        } catch (\Exception $e) {
            \Log::warning("Email confirmation paiement non envoyé : " . $e->getMessage());
        }

        return response()->json([
            'message'     => 'Paiement confirmé.',
            'paiement'    => $paiement->fresh(),
            'commission'  => $commission,
            'montant_net' => $montantBase,
        ]);
    }

    // ── Webhook PayDunya (confirmation automatique)
    public function webhook(Request $request): JsonResponse
    {
        $secret = config('services.paydunya.secret');

        // Bloquer si le secret n'est pas configuré — ne jamais accepter des callbacks non vérifiés
        if (!$secret) {
            \Log::error('Webhook PayDunya rejeté : PAYDUNYA_SECRET non configuré.');
            return response()->json(['error' => 'Configuration incomplète.'], 503);
        }

        $signature = $request->header('X-PayDunya-Signature') ?? '';
        $expected  = hash_hmac('sha256', $request->getContent(), $secret);
        if (!hash_equals($expected, $signature)) {
            return response()->json(['error' => 'Signature invalide.'], 401);
        }

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

            // Marquer le bien comme loué/vendu — même logique que confirmer()
            $paiement->load('contrat.bien');
            if ($paiement->contrat?->bien) {
                $statutBien = $paiement->contrat->bien->nature === 'vente' ? 'vendu' : 'loue';
                $paiement->contrat->bien->update(['statut' => $statutBien]);
            }
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

    // ── Tous les paiements reçus par le bailleur (avec filtre mois/année pour le rapport)
    // La commission est réservée à l'admin : masquée pour le bailleur/propriétaire.
    public function paiementsBailleur(Request $request): JsonResponse
    {
        $query = Paiement::with(['contrat.bien:id,titre', 'contrat.locataire:id,name', 'payeur:id,name,email'])
            ->whereHas('contrat', fn($q) => $q->where('bailleur_id', $request->user()->id));

        if ($request->filled('month') && $request->filled('year')) {
            $query->where('statut', 'confirme')
                  ->whereMonth('created_at', (int) $request->month)
                  ->whereYear('created_at', (int) $request->year);
            $paiements = $query->latest()->get()->makeHidden(['commission_taux', 'commission_montant']);
            return response()->json(['data' => $paiements]);
        }

        $paiements = $query->latest()->paginate(20);
        $paiements->getCollection()->makeHidden(['commission_taux', 'commission_montant']);
        return response()->json($paiements);
    }

    // ── Paiements en attente de confirmation (bailleur)
    public function enAttente(Request $request): JsonResponse
    {
        $paiements = Paiement::with(['contrat.bien:id,titre'])
            ->whereHas('contrat', fn($q) => $q->where('bailleur_id', $request->user()->id))
            ->whereIn('mode', ['espece', 'cheque'])
            ->where('statut', 'en_attente')
            ->latest()
            ->get()
            ->makeHidden(['commission_taux', 'commission_montant']);
        return response()->json(['data' => $paiements]);
    }

    // ── Paiements du client connecté
    public function mesPaiements(Request $request): JsonResponse
    {
        $paiements = Paiement::with(['contrat.bien:id,titre,adresse,ville'])
            ->where('payeur_id', $request->user()->id)
            ->latest()
            ->paginate(10);
        return response()->json($paiements);
    }

    // ── Taux de commission selon la nature du contrat (vente ou location)
    private function tauxCommissionPour(Contrat $contrat): float
    {
        return $contrat->type === 'vente'
            ? (float) Setting::get('commission_taux_vente', '2')
            : (float) Setting::get('commission_taux_location', '5');
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
