<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckInscriptionPayee
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && in_array($user->role, ['bailleur', 'proprietaire'])) {
            if (!$user->inscription_payee) {
                return response()->json([
                    'message' => 'Frais d\'inscription non réglés. Veuillez activer votre compte.',
                    'code'    => 'INSCRIPTION_REQUIRED',
                ], 403);
            }

            if ($user->forfait === 'starter' && $user->starter_expire_at?->isPast()) {
                return response()->json([
                    'message' => 'Votre période d\'essai de 30 jours est terminée. Passez à Pro ou Pro Max pour continuer.',
                    'code'    => 'STARTER_EXPIRED',
                ], 403);
            }
        }

        return $next($request);
    }
}
