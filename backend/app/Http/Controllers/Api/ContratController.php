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

        if (\App\Models\Contrat::where('demande_id', $demande->id)->exists()) {
            return response()->json(['message' => 'Un contrat existe déjà pour cette demande.'], 422);
        }

        $contrat = \App\Models\Contrat::create([
            'demande_id'   => $demande->id,
            'bien_id'      => $demande->bien_id,
            'bailleur_id'  => $request->user()->id,
            'locataire_id' => $demande->demandeur_id,
            'numero'       => 'CTR-' . date('Y') . '-' . strtoupper(\Illuminate\Support\Str::random(6)),
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

    public function show(\Illuminate\Http\Request $request, string $id): \Illuminate\Http\JsonResponse
    {
        $contrat = \App\Models\Contrat::with(['bien', 'bailleur:id,name,email', 'locataire:id,name,email', 'paiements'])->findOrFail($id);
        $user = $request->user();
        if ($contrat->bailleur_id !== $user->id && $contrat->locataire_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }
        return response()->json($contrat);
    }

    // Bailleur : envoyer le modèle de contrat (PDF)
    public function uploadModele(\Illuminate\Http\Request $request, string $id): \Illuminate\Http\JsonResponse
    {
        $request->validate(['fichier' => 'required|file|extensions:pdf,doc,docx,odt|max:20480']);

        $contrat = \App\Models\Contrat::with(['locataire', 'bien:id,titre'])->where('bailleur_id', $request->user()->id)->findOrFail($id);
        $path = (new \App\Services\CloudinaryService())->upload(
            $request->file('fichier'),
            "contrats/{$contrat->id}/modele"
        );

        $contrat->update([
            'fichier_contrat' => $path,
            'statut'          => 'en_attente_signature',
        ]);

        // Notifier le client par email
        if ($contrat->locataire?->email) {
            try {
                \Illuminate\Support\Facades\Mail::raw(
                    "Bonjour {$contrat->locataire->name},\n\nLe bailleur vous a envoyé le contrat pour le bien \"{$contrat->bien?->titre}\".\n\nConnectez-vous à la plateforme KerConnect pour :\n1. Télécharger le contrat\n2. Le signer manuscritement\n3. Le renvoyer en PDF via la plateforme\n\nRéférence contrat : {$contrat->numero}\nMontant : " . number_format($contrat->montant, 0, ',', ' ') . " FCFA\n\nCordialement,\nL'équipe KerConnect",
                    function ($m) use ($contrat) {
                        $m->to($contrat->locataire->email, $contrat->locataire->name)
                          ->subject("Votre contrat est prêt à signer sur KerConnect");
                    }
                );
            } catch (\Exception $e) {}
        }

        return response()->json([
            'message'  => 'Modèle de contrat envoyé au client.',
            'url'      => $path,
            'contrat'  => $contrat->fresh(),
        ]);
    }

    // Client : uploader le contrat signé (PDF/image)
    public function uploadSigne(\Illuminate\Http\Request $request, string $id): \Illuminate\Http\JsonResponse
    {
        $request->validate(['fichier' => 'required|file|extensions:pdf,doc,docx,odt,jpg,jpeg,png,gif,webp,heic,heif|max:20480']);

        $contrat = \App\Models\Contrat::with(['bailleur', 'locataire', 'bien:id,titre'])
            ->where('locataire_id', $request->user()->id)->findOrFail($id);
        $path = (new \App\Services\CloudinaryService())->upload(
            $request->file('fichier'),
            "contrats/{$contrat->id}/signe"
        );

        $contrat->update([
            'fichier_signe_client' => $path,
            'signe_client_at'      => now(),
            'statut'               => 'signe',
        ]);

        // Notifier le bailleur par email
        if ($contrat->bailleur?->email) {
            try {
                \Illuminate\Support\Facades\Mail::raw(
                    "Bonjour {$contrat->bailleur->name},\n\n{$contrat->locataire->name} a signé et renvoyé le contrat pour \"{$contrat->bien?->titre}\".\n\nConnectez-vous à KerConnect pour :\n1. Consulter le document signé\n2. Valider la signature pour autoriser le paiement\n\nRéférence : {$contrat->numero}\n\nCordialement,\nL'équipe KerConnect",
                    function ($m) use ($contrat) {
                        $m->to($contrat->bailleur->email, $contrat->bailleur->name)
                          ->subject("{$contrat->locataire->name} a signé votre contrat sur KerConnect");
                    }
                );
            } catch (\Exception $e) {}
        }

        return response()->json([
            'message' => 'Document signé envoyé au bailleur.',
            'url'     => $path,
            'contrat' => $contrat->fresh(),
        ]);
    }

    // Bailleur : valider le contrat signé par le client
    public function valider(\Illuminate\Http\Request $request, string $id): \Illuminate\Http\JsonResponse
    {
        $contrat = \App\Models\Contrat::where('bailleur_id', $request->user()->id)->findOrFail($id);

        if (!$contrat->fichier_signe_client) {
            return response()->json(['message' => 'Le client n\'a pas encore envoyé son contrat signé.'], 422);
        }

        $contrat->update([
            'statut'              => 'valide',
            'valide_bailleur_at'  => now(),
        ]);

        return response()->json(['message' => 'Contrat validé. Le client peut maintenant payer.', 'contrat' => $contrat->fresh()]);
    }

    public function mesContrats(\Illuminate\Http\Request $request): \Illuminate\Http\JsonResponse
    {
        $contrats = \App\Models\Contrat::with(['bien:id,titre,adresse,ville', 'bailleur:id,name'])
            ->where('locataire_id', $request->user()->id)
            ->latest()
            ->paginate(10);
        return response()->json($contrats);
    }

    public function mesContratsRecu(\Illuminate\Http\Request $request): \Illuminate\Http\JsonResponse
    {
        $contrats = \App\Models\Contrat::with([
            'bien:id,titre,adresse,ville',
            'locataire:id,name,email,phone',
            'paiements',
        ])
            ->where('bailleur_id', $request->user()->id)
            ->latest()
            ->paginate(20);
        return response()->json($contrats);
    }
}
