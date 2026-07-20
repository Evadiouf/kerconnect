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

        if ($user && in_array($user->role, ['bailleur', 'proprietaire']) && !$user->inscription_payee) {
            return response()->json([
                'message' => 'Frais d\'inscription non réglés. Veuillez activer votre compte.',
                'code'    => 'INSCRIPTION_REQUIRED',
            ], 403);
        }

        return $next($request);
    }
}
