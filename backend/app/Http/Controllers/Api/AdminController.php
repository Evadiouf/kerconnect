<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bien;
use App\Models\Demande;
use App\Models\Paiement;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // ── Dashboard : statistiques globales
    public function dashboard(): JsonResponse
    {
        $stats = [
            'utilisateurs' => [
                'total'        => User::count(),
                'clients'      => User::where('role', 'client')->count(),
                'bailleurs'    => User::whereIn('role', ['bailleur', 'proprietaire'])->count(),
                'admins'       => User::where('role', 'admin')->count(),
                'actifs'       => User::where('is_active', true)->count(),
                'inactifs'     => User::where('is_active', false)->count(),
                'ce_mois'      => User::whereMonth('created_at', now()->month)->count(),
            ],
            'biens' => [
                'total'        => Bien::count(),
                'publies'      => Bien::where('statut', 'publie')->count(),
                'en_attente'   => Bien::where('statut', 'en_attente')->count(),
                'loues'        => Bien::where('statut', 'loue')->count(),
                'vendus'       => Bien::where('statut', 'vendu')->count(),
                'locations'    => Bien::where('nature', 'location')->count(),
                'ventes'       => Bien::where('nature', 'vente')->count(),
            ],
            'demandes' => [
                'total'        => Demande::count(),
                'soumises'     => Demande::where('statut', 'soumise')->count(),
                'acceptees'    => Demande::where('statut', 'acceptee')->count(),
                'refusees'     => Demande::where('statut', 'refusee')->count(),
            ],
            'paiements' => [
                'total'        => Paiement::count(),
                'confirmes'    => Paiement::where('statut', 'confirme')->count(),
                'en_attente'   => Paiement::where('statut', 'en_attente')->count(),
                'montant_total' => Paiement::where('statut', 'confirme')->sum('montant'),
                'ce_mois'      => Paiement::where('statut', 'confirme')->whereMonth('paye_at', now()->month)->sum('montant'),
            ],
        ];

        // Inscriptions des 6 derniers mois
        $inscriptions = collect(range(5, 0))->map(function ($i) {
            $date = now()->subMonths($i);
            return [
                'mois'   => $date->format('M Y'),
                'total'  => User::whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count(),
                'client' => User::where('role', 'client')->whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count(),
                'bailleur' => User::whereIn('role', ['bailleur','proprietaire'])->whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count(),
            ];
        });

        return response()->json(['stats' => $stats, 'inscriptions' => $inscriptions]);
    }

    // ── Liste des utilisateurs
    public function users(Request $request): JsonResponse
    {
        $query = User::query();
        if ($request->role)   $query->where('role', $request->role);
        if ($request->search) $query->where(fn($q) => $q->where('name', 'like', "%{$request->search}%")->orWhere('email', 'like', "%{$request->search}%"));
        $users = $query->latest()->paginate(15);
        return response()->json($users);
    }

    // ── Détail utilisateur
    public function userDetail(string $id): JsonResponse
    {
        $user = User::withCount(['biens' => fn($q) => $q, 'demandes' => fn($q) => $q])->findOrFail($id);
        return response()->json($user);
    }

    // ── Activer / désactiver utilisateur
    public function toggleUser(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de modifier un admin.'], 403);
        }
        $user->update(['is_active' => !$user->is_active]);
        $action = $user->is_active ? 'activé' : 'désactivé';
        return response()->json(['message' => "Compte {$action}.", 'user' => $user->fresh()]);
    }

    // ── Liste annonces (modération)
    public function annonces(Request $request): JsonResponse
    {
        $query = Bien::with('bailleur:id,name,email');
        if ($request->statut) $query->where('statut', $request->statut);
        $biens = $query->latest()->paginate(15);
        return response()->json($biens);
    }

    // ── Publier / retirer une annonce
    public function toggleAnnonce(Request $request, string $id): JsonResponse
    {
        $request->validate(['statut' => 'required|in:publie,retire,en_attente']);
        $bien = Bien::findOrFail($id);
        $bien->update(['statut' => $request->statut]);
        return response()->json(['message' => "Annonce mise à jour : {$request->statut}.", 'bien' => $bien->fresh()]);
    }

    // ── Transactions
    public function transactions(Request $request): JsonResponse
    {
        $query = Paiement::with(['payeur:id,name,email', 'contrat.bien:id,titre']);
        if ($request->statut) $query->where('statut', $request->statut);
        if ($request->mode)   $query->where('mode', $request->mode);
        $paiements = $query->latest()->paginate(20);
        return response()->json($paiements);
    }
}
