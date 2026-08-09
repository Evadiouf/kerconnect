<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bien;
use App\Services\CloudinaryService;
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
            'photos.*'       => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,bmp,heic,heif,avif,tiff|max:30720',
            'video'          => 'nullable|file|mimes:mp4,mov,avi,mkv,webm,3gp,m4v,wmv,flv,mpeg,mpg|max:102400',
            'contrat_modele' => 'nullable|file|mimes:pdf,doc,docx,odt|max:20480',
        ]);

        // ── Vérifier la limite d'annonces actives selon le forfait
        $user    = $request->user();
        $forfait = $user->forfait ?? 'starter';

        // Forfait expiré → revient aux droits Starter
        if ($forfait !== 'starter' && $user->forfait_expire_at?->isPast()) {
            $forfait = 'starter';
        }

        $limites     = ['starter' => 2, 'pro' => 15, 'agence' => PHP_INT_MAX];
        $limite      = $limites[$forfait] ?? 2;
        $forfaitNom  = match($forfait) { 'pro' => 'Pro', 'agence' => 'Pro Max', default => 'Starter' };

        if ($limite !== PHP_INT_MAX) {
            $actives = Bien::where('user_id', $user->id)->whereIn('statut', ['publie', 'loue'])->count();
            if ($actives >= $limite) {
                return response()->json([
                    'message' => "Limite atteinte : le forfait {$forfaitNom} autorise {$limite} annonce(s) active(s) maximum. Passez à un forfait supérieur pour en publier davantage.",
                    'code'    => 'LIMITE_ANNONCES',
                ], 422);
            }
        }

        $bien = Bien::create([
            ...$request->only(['titre','type','nature','prix','caution_mois','description','adresse','ville','surface','chambres','salles_bain','equipements']),
            'user_id' => $request->user()->id,
            'statut'  => 'publie',
        ]);

        $cloudinary = new CloudinaryService();

        $images = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $images[] = $cloudinary->upload($photo, "biens/{$bien->id}/photos");
            }
        }

        $videoPath = null;
        if ($request->hasFile('video')) {
            $videoPath = $cloudinary->upload($request->file('video'), "biens/{$bien->id}");
        }

        $contratPath = null;
        if ($request->hasFile('contrat_modele')) {
            $contratPath = $cloudinary->upload($request->file('contrat_modele'), "biens/{$bien->id}");
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
            'photos.*'       => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,bmp,heic,heif,avif,tiff|max:30720',
            'video'          => 'nullable|file|mimes:mp4,mov,avi,mkv,webm,3gp,m4v,wmv,flv,mpeg,mpg|max:102400',
            'contrat_modele' => 'nullable|file|mimes:pdf,doc,docx,odt|max:20480',
        ]);

        $bien->update($request->only(['titre','type','nature','prix','caution_mois','description','adresse','ville','surface','chambres','salles_bain','equipements']));

        $cloudinary = new CloudinaryService();

        if ($request->hasFile('photos')) {
            $images = [];
            foreach ($request->file('photos') as $photo) {
                $images[] = $cloudinary->upload($photo, "biens/{$bien->id}/photos");
            }
            $bien->update(['images' => $images]);
        }

        if ($request->hasFile('video')) {
            $bien->update(['video' => $cloudinary->upload($request->file('video'), "biens/{$bien->id}")]);
        }

        if ($request->hasFile('contrat_modele')) {
            $bien->update(['contrat_modele' => $cloudinary->upload($request->file('contrat_modele'), "biens/{$bien->id}")]);
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
                                ->subject("Nouveau bien sur KerConnect : {$bien->titre}")
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

        $cloudinary = new CloudinaryService();
        if ($bien->images)         $cloudinary->deleteMany($bien->images);
        if ($bien->video)          $cloudinary->delete($bien->video);
        if ($bien->contrat_modele) $cloudinary->delete($bien->contrat_modele);

        $bien->delete();
        return response()->json(['message' => 'Annonce supprimée définitivement.']);
    }
}
