<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options',    'nosniff');
        $response->headers->set('X-Frame-Options',           'DENY');
        $response->headers->set('X-XSS-Protection',          '1; mode=block');
        $response->headers->set('Referrer-Policy',            'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy',         'camera=(), microphone=(), geolocation=()');
        $response->headers->set('Strict-Transport-Security',  'max-age=31536000; includeSubDomains');

        // CSP adapté à Next.js + API
        $response->headers->set('Content-Security-Policy',
            "default-src 'self'; " .
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " .
            "style-src 'self' 'unsafe-inline'; " .
            "img-src 'self' data: https://res.cloudinary.com; " .
            "connect-src 'self' https://api.paydunya.com; " .
            "frame-ancestors 'none';"
        );

        // Supprimer les headers qui révèlent l'infrastructure
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}
