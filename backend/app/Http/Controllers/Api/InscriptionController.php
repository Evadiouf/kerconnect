<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class InscriptionController extends Controller
{
    // ── Retourner le montant des frais et le statut de paiement
    public function frais(Request $request): JsonResponse
    {
        $montant = (float) Setting::get('frais_inscription', '10000');
        $user    = $request->user();

        return response()->json([
            'montant'           => $montant,
            'inscription_payee' => $user->inscription_payee,
            'inscription_at'    => $user->inscription_at,
            'forfait'           => $user->forfait,
            'role'              => $user->role,
        ]);
    }

    // ── Payer les frais d'inscription
    public function payer(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!in_array($user->role, ['bailleur', 'proprietaire'])) {
            return response()->json([
                'message' => "Les frais d'inscription ne s'appliquent qu'aux bailleurs et propriétaires.",
            ], 422);
        }

        if ($user->inscription_payee) {
            return response()->json([
                'message'           => "Frais d'inscription déjà réglés.",
                'inscription_payee' => true,
            ]);
        }

        $request->validate([
            'mode'    => 'required|in:espece,cheque,wave,orange_money,carte,starter',
            'forfait' => 'required|in:starter,pro,agence',
        ]);

        $forfait = $request->input('forfait', 'starter');

        // Starter gratuit → activation immédiate sans validation admin
        if ($forfait === 'starter') {
            $user->update([
                'inscription_payee' => true,
                'inscription_at'    => now(),
                'forfait'           => 'starter',
                'starter_expire_at' => now()->addDays(30),
            ]);
            return response()->json([
                'message'           => 'Compte Starter activé. Vous disposez de 30 jours d\'essai.',
                'inscription_payee' => true,
                'en_attente'        => false,
            ]);
        }

        // Pro / Pro Max → demande soumise, attente de confirmation admin
        $user->update([
            'inscription_at' => now(),
            'forfait'        => $forfait,
            // inscription_payee reste false jusqu'à confirmation admin
        ]);

        // Notification à l'admin
        $forfaitLabel = match($forfait) { 'pro' => 'Pro', 'agence' => 'Pro Max', default => 'Starter' };
        try {
            $adminEmail = config('mail.admin_email', 'contact@naratechvision.com');
            Mail::raw(
                "Nouvelle demande d'abonnement\n\nBailleur : {$user->name} ({$user->email})\nForfait : {$forfaitLabel}\nTéléphone : {$user->phone}\nDate : " . now()->format('d/m/Y H:i') . "\n\nConnectez-vous à l'espace admin pour confirmer.",
                fn($msg) => $msg->to($adminEmail)->subject("Nouvelle demande abonnement {$forfaitLabel} de {$user->name}")
            );
        } catch (\Exception $e) {
            Log::warning("Notification admin inscription non envoyée : " . $e->getMessage());
        }

        return response()->json([
            'message'    => 'Demande soumise. Vous recevrez un email de confirmation sous 24h.',
            'en_attente' => true,
        ]);
    }

    // ── Liste des bailleurs en attente de confirmation (admin)
    public function enAttente(): JsonResponse
    {
        $pending = User::whereIn('role', ['bailleur', 'proprietaire'])
            ->where(fn($q) => $q->where('inscription_payee', false)->orWhereNull('inscription_payee'))
            ->whereNotNull('inscription_at')
            ->orderByDesc('inscription_at')
            ->get(['id', 'name', 'email', 'phone', 'role', 'forfait', 'inscription_at', 'created_at']);

        return response()->json(['data' => $pending]);
    }

    // ── Confirmer l'inscription d'un bailleur (admin)
    public function confirmer(Request $request, User $user): JsonResponse
    {
        if (!in_array($user->role, ['bailleur', 'proprietaire'])) {
            return response()->json(['message' => "Cet utilisateur n'est pas bailleur."], 422);
        }

        if ($user->inscription_payee) {
            return response()->json(['message' => 'Compte déjà actif.', 'inscription_payee' => true]);
        }

        $expireAt     = in_array($user->forfait, ['pro', 'agence']) ? now()->addMonth() : null;
        $forfaitLabel = match($user->forfait) { 'pro' => 'Pro', 'agence' => 'Pro Max', default => 'Starter' };

        $user->update([
            'inscription_payee' => true,
            'forfait_expire_at' => $expireAt,
        ]);

        // Email de confirmation au bailleur
        $loginUrl = config('app.frontend_url', 'http://localhost:3000') . '/auth/login';
        try {
            Mail::raw(
                "Bonjour {$user->name},\n\nVotre compte KerConnect est maintenant actif avec le forfait {$forfaitLabel} !\n\nAccédez à votre espace bailleur :\n{$loginUrl}\n\nCommencez à publier vos annonces dès maintenant.\n\nL'équipe KerConnect",
                fn($msg) => $msg->to($user->email)->subject("Votre compte KerConnect est activé - Forfait {$forfaitLabel}")
            );
        } catch (\Exception $e) {
            Log::warning("Email confirmation inscription non envoyé pour {$user->email}: " . $e->getMessage());
        }

        return response()->json([
            'message'           => "Compte de {$user->name} activé. Email envoyé.",
            'inscription_payee' => true,
        ]);
    }
}
