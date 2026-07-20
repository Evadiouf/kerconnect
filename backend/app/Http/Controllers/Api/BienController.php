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

    // ── Detail bailleur (tous statuts, propriétaire uniquement)
    public function showBailleur(Request $request, string $id): JsonResponse
    {
        $bien = Bien::with('bailleur:id,name,phone')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
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
            'titre'          => 'required|string|max:255',
            'type'           => 'required|string',
            'nature'         => 'required|in:location,vente',
            'prix'           => 'required|numeric|min:0',
            'caution_mois'   => 'nullable|integer|min:1|max:6',
            'adresse'        => 'required|string',
            'ville'          => 'required|string',
            'description'    => 'nullable|string',
            'surface'        => 'nullable|numeric',
            'chambres'       => 'nullable|integer|min:0',
            'salles_bain'    => 'nullable|integer|min:0',
            'equipements'    => 'nullable|array',
            'photos.*'       => 'nullable|image|max:5120',
            'video'          => 'nullable|mimetypes:video/mp4,video/mpeg,video/quicktime|max:51200',
            'contrat_modele' => 'nullable|mimes:pdf|max:10240',
        ]);

        $bien = Bien::create([
            ...$request->only(['titre','type','nature','prix','caution_mois','description','adresse','ville','surface','chambres','salles_bain','equipements']),
            'user_id' => $request->user()->id,
            'statut'  => 'publie',
        ]);

        $images = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $images[] = $photo->store("biens/{$bien->id}/photos", 'public');
            }
        }

        $videoPath = null;
        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store("biens/{$bien->id}", 'public');
        }

        $contratPath = null;
        if ($request->hasFile('contrat_modele')) {
            $contratPath = $request->file('contrat_modele')->store("biens/{$bien->id}", 'public');
        }

        if ($images || $videoPath || $contratPath) {
            $bien->update([
                'images'         => $images ?: null,
                'video'          => $videoPath,
                'contrat_modele' => $contratPath,
            ]);
        }

        // Notifier les utilisateurs ayant une alerte correspondante
        $this->notifierAlertes($bien);

        return response()->json(['message' => 'Annonce publiée avec succès.', 'bien' => $bien], 201);
    }

    // ── Modifier annonce
    public function update(Request $request, string $id): JsonResponse
    {
        $bien = Bien::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();

        $request->validate([
            'photos.*'       => 'nullable|image|max:5120',
            'video'          => 'nullable|mimetypes:video/mp4,video/mpeg,video/quicktime|max:51200',
            'contrat_modele' => 'nullable|mimes:pdf|max:10240',
        ]);

        $bien->update($request->only(['titre','type','nature','prix','caution_mois','description','adresse','ville','surface','chambres','salles_bain','equipements']));

        if ($request->hasFile('photos')) {
            $images = [];
            foreach ($request->file('photos') as $photo) {
                $images[] = $photo->store("biens/{$bien->id}/photos", 'public');
            }
            $bien->update(['images' => $images]);
        }

        if ($request->hasFile('video')) {
            $bien->update(['video' => $request->file('video')->store("biens/{$bien->id}", 'public')]);
        }

        if ($request->hasFile('contrat_modele')) {
            $bien->update(['contrat_modele' => $request->file('contrat_modele')->store("biens/{$bien->id}", 'public')]);
        }

        return response()->json(['message' => 'Annonce mise à jour.', 'bien' => $bien->fresh()]);
    }

    // ── Envoyer des alertes email aux clients intéressés
    private function notifierAlertes(Bien $bien): void
    {
        $alertes = \App\Models\Alerte::with('user:id,name,email')
            ->where('active', true)
            ->where('nature', $bien->nature)
            ->where(function ($q) use ($bien) {
                $q->whereNull('ville')->orWhere('ville', 'like', "%{$bien->ville}%");
            })
            ->where(function ($q) use ($bien) {
                $q->whereNull('prix_max')->orWhere('prix_max', '>=', $bien->prix);
            })
            ->where(function ($q) use ($bien) {
                $q->whereNull('type_bien')->orWhere('type_bien', 'like', "%{$bien->type}%");
            })
            ->get();

        foreach ($alertes as $alerte) {
            if (!$alerte->user?->email) continue;
            try {
                \Illuminate\Support\Facades\Mail::raw(
                    "Bonjour {$alerte->user->name},\n\nUn nouveau bien correspond à votre alerte !\n\n" .
                    "📍 {$bien->titre}\n" .
                    "📌 {$bien->adresse}, {$bien->ville}\n" .
                    "💰 " . number_format((float) $bien->prix, 0, ',', ' ') . " FCFA" . ($bien->nature === 'location' ? '/mois' : '') . "\n\n" .
                    "Consultez-le sur KerConnect : " . config('app.url') . "/biens/{$bien->id}\n\n" .
                    "Cordialement,\nL'équipe KerConnect",
                    fn($m) => $m->to($alerte->user->email, $alerte->user->name)
                                ->subject("KerConnect — Nouveau bien : {$bien->titre}")
                );
            } catch (\Exception $e) {
                \Log::warning("Alerte email non envoyée : " . $e->getMessage());
            }
        }
    }

    // ── Supprimer définitivement une annonce
    public function destroy(Request $request, string $id): JsonResponse
    {
        $bien = Bien::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();

        // Supprimer les fichiers stockés
        if ($bien->images) {
            foreach ($bien->images as $path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
            }
        }
        if ($bien->video)          \Illuminate\Support\Facades\Storage::disk('public')->delete($bien->video);
        if ($bien->contrat_modele) \Illuminate\Support\Facades\Storage::disk('public')->delete($bien->contrat_modele);

        $bien->delete();
        return response()->json(['message' => 'Annonce supprimée définitivement.']);
    }
}
