<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateFileUpload
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    // Types MIME autorisés — liste blanche stricte
    private const ALLOWED_MIME = [
        'image/jpeg', 'image/png', 'image/webp',
        'video/mp4',
        'application/pdf',
    ];

    // Extensions autorisées correspondantes
    private const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'pdf'];

    // Tailles max par type (en bytes)
    private const MAX_SIZES = [
        'image' => 5 * 1024 * 1024,   // 5 Mo
        'video' => 50 * 1024 * 1024,  // 50 Mo
        'application' => 10 * 1024 * 1024, // 10 Mo (PDF)
    ];

    public function handle(Request $request, Closure $next): Response
    {
        foreach ($request->allFiles() as $files) {
            $files = is_array($files) ? $files : [$files];
            foreach ($files as $file) {
                $mime = $file->getMimeType();
                $ext  = strtolower($file->getClientOriginalExtension());

                // Vérifier MIME type
                if (!in_array($mime, self::ALLOWED_MIME)) {
                    return response()->json([
                        'message' => "Type de fichier non autorisé : {$mime}. Formats acceptés : JPG, PNG, WEBP, MP4, PDF."
                    ], 422);
                }

                // Vérifier extension
                if (!in_array($ext, self::ALLOWED_EXT)) {
                    return response()->json([
                        'message' => "Extension non autorisée : .{$ext}"
                    ], 422);
                }

                // Vérifier taille
                $type    = explode('/', $mime)[0];
                $maxSize = self::MAX_SIZES[$type] ?? (5 * 1024 * 1024);
                if ($file->getSize() > $maxSize) {
                    $maxMb = $maxSize / (1024 * 1024);
                    return response()->json([
                        'message' => "Fichier trop volumineux. Maximum : {$maxMb} Mo."
                    ], 422);
                }
            }
        }

        return $next($request);
    }
}
