<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    // ── Login
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $key = 'login:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json(['message' => 'Trop de tentatives. Réessayez dans 1 minute.'], 429);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 60);
            return response()->json(['message' => 'Identifiants incorrects.'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Compte désactivé. Contactez le support.'], 403);
        }

        RateLimiter::clear($key);

        // Connexion admin : confirmation obligatoire par email
        if ($user->role === 'admin') {
            $loginToken = Str::random(64);
            $user->update([
                'admin_login_token'            => hash('sha256', $loginToken),
                'admin_login_token_expires_at' => now()->addMinutes(15),
            ]);

            $frontendUrl  = config('app.frontend_url', 'http://localhost:3000');
            $confirmUrl   = "{$frontendUrl}/auth/admin/confirm/{$loginToken}";
            $adminEmail   = config('mail.admin_email', 'contact@naratechvision.com');

            try {
                Mail::raw(
                    "Bonjour,\n\nUne tentative de connexion a été détectée sur le compte administrateur KerConnect.\n\nCliquez sur le lien ci-dessous pour confirmer et accéder au tableau de bord :\n\n{$confirmUrl}\n\nCe lien expire dans 15 minutes.\n\nSi vous n'êtes pas à l'origine de cette connexion, ignorez cet email — votre compte reste protégé.\n\nL'équipe KerConnect",
                    fn($msg) => $msg->to($adminEmail)->subject('Confirmation de connexion administrateur KerConnect')
                );
            } catch (\Exception $e) {
                \Log::error("Email confirmation admin non envoyé : " . $e->getMessage());
            }

            return response()->json([
                'pending_admin_confirmation' => true,
                'message'                   => 'Un lien de confirmation a été envoyé à l\'email administrateur. Vérifiez contact@naratechvision.com.',
            ]);
        }

        $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
            'role'  => $user->role,
        ]);
    }

    // ── Register
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
            'role'                  => 'required|in:client,bailleur,proprietaire',
            'phone'                 => 'nullable|string|max:20',
            'ninea'                 => 'nullable|string|max:50',
            'registre_commerce'     => 'nullable|string|max:100',
            'adresse_structure'     => 'nullable|string|max:255',
            'type_bien'             => 'nullable|string|max:255',
            'contrat_location'      => 'nullable|file|mimes:jpeg,jpg,png,pdf,mp4|max:10240',
        ]);

        $contratPath = null;
        if ($request->hasFile('contrat_location')) {
            $contratPath = $request->file('contrat_location')->store('contrats_inscription', 'public');
        }

        $user = User::create([
            'name'               => $request->name,
            'email'              => $request->email,
            'password'           => Hash::make($request->password),
            'role'               => $request->role,
            'phone'              => $request->phone,
            'ninea'              => $request->ninea,
            'registre_commerce'  => $request->registre_commerce,
            'adresse_structure'  => $request->adresse_structure,
            'type_bien'          => $request->type_bien,
            'contrat_location'   => $contratPath,
        ]);

        // Envoyer OTP de vérification
        $otp = $this->generateAndSendOtp($user->email, 'verification');

        $response = [
            'message' => 'Compte créé. Vérifiez votre email pour le code OTP.',
            'user'    => $user,
        ];

        return response()->json($response, 201);
    }

    // ── Vérification OTP
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:4',
            'type'  => 'required|in:verification,reset_password',
        ]);

        $key = 'otp:' . $request->email;
        if (RateLimiter::tooManyAttempts($key, 3)) {
            return response()->json(['message' => 'Trop de tentatives OTP. Demandez un nouveau code.'], 429);
        }

        $otp = Otp::where('email', $request->email)
            ->where('code', $request->code)
            ->where('type', $request->type)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otp) {
            RateLimiter::hit($key, 300);
            return response()->json(['message' => 'Code OTP invalide ou expiré.'], 422);
        }

        $otp->update(['used' => true]);
        RateLimiter::clear($key);

        if ($request->type === 'verification') {
            User::where('email', $request->email)->update(['email_verified_at' => now()]);
        }

        return response()->json(['message' => 'OTP vérifié avec succès.', 'verified' => true]);
    }

    // ── Renvoyer OTP
    public function resendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'type'  => 'required|in:verification,reset_password',
        ]);

        $otp = $this->generateAndSendOtp($request->email, $request->type);

        return response()->json(['message' => 'Nouveau code OTP envoyé.']);
    }

    // ── Mot de passe oublié
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|exists:users,email']);
        $otp = $this->generateAndSendOtp($request->email, 'reset_password');
        return response()->json(['message' => 'Code OTP envoyé à votre email.']);
    }

    // ── Réinitialiser mot de passe
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Vérifier qu'un OTP reset_password a bien été validé dans les 15 dernières minutes
        $otpVerifie = Otp::where('email', $request->email)
            ->where('type', 'reset_password')
            ->where('used', true)
            ->where('updated_at', '>=', now()->subMinutes(15))
            ->exists();

        if (!$otpVerifie) {
            return response()->json([
                'message' => 'Vérifiez votre code OTP avant de réinitialiser votre mot de passe.',
            ], 403);
        }

        User::where('email', $request->email)->update([
            'password' => Hash::make($request->password),
        ]);

        // Supprimer les OTP reset_password de cet email
        Otp::where('email', $request->email)->where('type', 'reset_password')->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }

    // ── Confirmation login admin via lien email
    public function confirmAdminLogin(Request $request, string $token): JsonResponse
    {
        $hashed = hash('sha256', $token);

        $user = User::where('role', 'admin')
            ->where('admin_login_token', $hashed)
            ->where('admin_login_token_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Lien invalide ou expiré. Reconnectez-vous.',
            ], 401);
        }

        // Invalider le token après usage (usage unique)
        $user->update([
            'admin_login_token'            => null,
            'admin_login_token_expires_at' => null,
        ]);

        $jwtToken = $user->createToken('admin_auth', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $jwtToken,
            'role'  => $user->role,
        ]);
    }

    // ── Logout
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    // ── Utilisateur connecté
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    // ── Google OAuth — Redirect
    public function googleRedirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    // ── Google OAuth — Callback
    public function googleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/auth/login?error=google_failed');
        }

        // Trouver ou créer l'utilisateur
        $user = User::where('email', $googleUser->getEmail())->first();

        if (!$user) {
            $user = User::create([
                'name'              => $googleUser->getName(),
                'email'             => $googleUser->getEmail(),
                'password'          => bcrypt(str()->random(32)),
                'role'              => 'client',
                'email_verified_at' => now(),
                'is_active'         => true,
            ]);
        } elseif (!$user->email_verified_at) {
            $user->update(['email_verified_at' => now()]);
        }

        $token = $user->createToken('google-auth')->plainTextToken;

        // Redirect vers le frontend avec token
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect("{$frontendUrl}/auth/google/success?token=" . urlencode($token) . "&user=" . urlencode(json_encode([
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ])));
    }

    // ── Générer et envoyer OTP (retourne le code pour usage interne)
    private function generateAndSendOtp(string $email, string $type): string
    {
        $code = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);

        Otp::where('email', $email)->where('type', $type)->where('used', false)->delete();

        Otp::create([
            'email'      => $email,
            'code'       => $code,
            'type'       => $type,
            'expires_at' => now()->addMinutes(10),
        ]);

        // Tenter l'envoi email — ne pas bloquer si échec en local
        try {
            Mail::raw(
                "Votre code KerConnect : {$code}\n\nCe code expire dans 10 minutes.",
                fn($msg) => $msg->to($email)->subject('Code de vérification KerConnect')
            );
        } catch (\Exception $e) {
            // En local sans serveur mail configuré, on continue silencieusement
            \Log::warning("Email OTP non envoyé pour {$email}: " . $e->getMessage());
        }

        return $code;
    }
}
