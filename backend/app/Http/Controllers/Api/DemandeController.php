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

        $demande->load(['bien.bailleur', 'demandeur']);

        // Email de notification au bailleur
        try {
            if ($demande->bien?->bailleur?->email) {
                \Illuminate\Support\Facades\Mail::raw(
                    "Nouvelle demande de {$demande->demandeur->name} pour votre bien \"{$demande->bien->titre}\".\n\nConnectez-vous sur KerConnect pour consulter et répondre à cette demande.",
                    fn($msg) => $msg->to($demande->bien->bailleur->email)
                        ->subject('Nouvelle demande sur votre bien — KerConnect')
                );
            }
        } catch (\Exception $e) {
            \Log::warning("Email nouvelle demande non envoyé : " . $e->getMessage());
        }

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
        $demande = Demande::with([
            'bien.bailleur:id,name,email,phone',
            'demandeur:id,name,email,phone',
            'contrat.paiements',
        ])->findOrFail($id);

        $user = $request->user();
        $isBailleurDuBien = $demande->bien?->user_id === $user->id;
        $isDemandeur      = $demande->demandeur_id === $user->id;

        if (!$isBailleurDuBien && !$isDemandeur && $user->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        return response()->json($demande);
    }

    // Notifications : dernières activités de l'utilisateur
    public function notifications(Request $request): JsonResponse
    {
        $user = $request->user();

        if (in_array($user->role, ['bailleur', 'proprietaire'])) {
            $demandes = Demande::with('bien:id,titre')
                ->whereHas('bien', fn($q) => $q->where('user_id', $user->id))
                ->latest()->limit(4)->get()
                ->map(fn($d) => [
                    'id'      => $d->id,
                    'texte'   => "Demande pour « {$d->bien?->titre} »",
                    'statut'  => $d->statut,
                    'date'    => $d->created_at,
                    'lien'    => "/bailleur/demandes/{$d->id}",
                ]);

            $paiements = \App\Models\Paiement::with('contrat.bien:id,titre')
                ->whereHas('contrat', fn($q) => $q->where('bailleur_id', $user->id))
                ->where('statut', 'en_attente')
                ->latest()->limit(3)->get()
                ->map(fn($p) => [
                    'id'      => $p->id,
                    'texte'   => "💰 Paiement en attente — " . number_format($p->montant, 0, ',', ' ') . " FCFA",
                    'statut'  => 'paiement',
                    'date'    => $p->created_at,
                    'lien'    => "/bailleur/paiements",
                ]);

            // Contrats signés par le client en attente de validation bailleur
            $aValider = \App\Models\Contrat::with('bien:id,titre')
                ->where('bailleur_id', $user->id)
                ->whereNotNull('fichier_signe_client')
                ->whereNull('valide_bailleur_at')
                ->latest()->limit(3)->get()
                ->map(fn($c) => [
                    'id'      => $c->id,
                    'texte'   => "✍️ Contrat signé par le client — validez pour autoriser le paiement « {$c->bien?->titre} »",
                    'statut'  => 'signature',
                    'date'    => $c->signe_client_at ?? $c->updated_at,
                    'lien'    => "/bailleur/demandes/{$c->demande_id}",
                ]);

            $items = $demandes->concat($paiements)->concat($aValider)->sortByDesc('date')->values();
        } else {
            $demandes = Demande::with('bien:id,titre')
                ->where('demandeur_id', $user->id)
                ->latest()->limit(4)->get()
                ->map(fn($d) => [
                    'id'      => $d->id,
                    'texte'   => "Demande pour « {$d->bien?->titre} » — {$d->statut}",
                    'statut'  => $d->statut,
                    'date'    => $d->created_at,
                    'lien'    => "/client/demandes/{$d->id}",
                ]);

            // Contrats en attente de signature du client
            $contrats = \App\Models\Contrat::with('bien:id,titre')
                ->where('locataire_id', $user->id)
                ->whereNull('signature_locataire')
                ->latest()->limit(3)->get()
                ->map(fn($c) => [
                    'id'      => $c->id,
                    'texte'   => "✍️ Contrat à signer pour « {$c->bien?->titre} »",
                    'statut'  => 'signature',
                    'date'    => $c->created_at,
                    'lien'    => $c->demande_id ? "/client/demandes/{$c->demande_id}" : "/client/demandes",
                ]);

            $items = $demandes->concat($contrats)->sortByDesc('date')->values();
        }

        return response()->json(['data' => $items]);
    }

    // Bailleur : envoyer un message au client via email
    public function repondreClient(Request $request, string $id): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:2000']);

        $demande = Demande::with(['bien', 'demandeur'])->findOrFail($id);

        // Vérifier que c'est bien le bailleur du bien concerné
        if ($demande->bien?->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $bailleur  = $request->user();
        $demandeur = $demande->demandeur;

        if (!$demandeur?->email) {
            return response()->json(['message' => 'Email du client introuvable.'], 404);
        }

        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Message de {$bailleur->name} (bailleur) concernant votre demande pour \"{$demande->bien->titre}\" :\n\n{$request->message}\n\n---\nRépondre à : {$bailleur->email}",
                function ($m) use ($demandeur, $bailleur, $demande) {
                    $m->to($demandeur->email, $demandeur->name)
                      ->subject("KerConnect — Réponse de {$bailleur->name} pour \"{$demande->bien->titre}\"")
                      ->replyTo($bailleur->email, $bailleur->name);
                }
            );
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de l\'envoi de l\'email.'], 500);
        }

        return response()->json(['message' => 'Message envoyé au client.']);
    }

    // Bailleur : accepter ou refuser
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate(['statut' => 'required|in:acceptee,refusee,en_cours']);

        $demande = Demande::with(['bien', 'demandeur'])->whereHas('bien', fn($q) => $q->where('user_id', $request->user()->id))->findOrFail($id);
        $demande->update(['statut' => $request->statut]);

        // Email au client si demande acceptée
        if ($request->statut === 'acceptee') {
            try {
                if ($demande->demandeur?->email) {
                    \Illuminate\Support\Facades\Mail::raw(
                        "Bonne nouvelle ! Votre demande pour le bien \"{$demande->bien->titre}\" a été acceptée par le bailleur.\n\nConnectez-vous sur KerConnect pour consulter votre contrat et poursuivre la démarche.",
                        fn($msg) => $msg->to($demande->demandeur->email)
                            ->subject('Demande acceptée — KerConnect')
                    );
                }
            } catch (\Exception $e) {
                \Log::warning("Email acceptation demande non envoyé : " . $e->getMessage());
            }
        }

        // Créer le contrat automatiquement lors de l'acceptation
        if ($request->statut === 'acceptee' && !$demande->contrat) {
            \App\Models\Contrat::create([
                'demande_id'   => $demande->id,
                'bien_id'      => $demande->bien_id,
                'bailleur_id'  => $request->user()->id,
                'locataire_id' => $demande->demandeur_id,
                'numero'       => 'CTR-' . date('Y') . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT),
                'type'         => $demande->bien->nature === 'vente' ? 'vente' : 'bail',
                'montant'      => $demande->bien->prix,
                'date_debut'   => now()->toDateString(),
                'statut'       => 'en_attente_signature',
            ]);
        }

        return response()->json([
            'message' => "Demande {$request->statut}.",
            'demande' => $demande->fresh()->load('contrat'),
        ]);
    }

    // Client : envoyer un message au bailleur via email
    public function sendMessage(Request $request, string $id): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:2000']);

        $demande = Demande::with(['bien.bailleur', 'demandeur'])->findOrFail($id);

        // Vérifier que c'est bien le demandeur qui envoie
        if ($demande->demandeur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $bailleur  = $demande->bien?->bailleur;
        $demandeur = $demande->demandeur;

        if (!$bailleur?->email) {
            return response()->json(['message' => 'Email du bailleur introuvable.'], 404);
        }

        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Message de {$demandeur->name} concernant votre bien \"{$demande->bien->titre}\" :\n\n{$request->message}\n\n---\nRépondre à : {$demandeur->email}",
                function ($m) use ($bailleur, $demandeur, $demande) {
                    $m->to($bailleur->email, $bailleur->name)
                      ->subject("KerConnect — Message de {$demandeur->name} pour \"{$demande->bien->titre}\"")
                      ->replyTo($demandeur->email, $demandeur->name);
                }
            );
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de l\'envoi de l\'email.'], 500);
        }

        return response()->json(['message' => 'Message envoyé au bailleur.']);
    }

    public function destroy(string $id): JsonResponse { return response()->json([], 204); }
}
