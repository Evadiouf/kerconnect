<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BienController;
use App\Http\Controllers\Api\ContratController;
use App\Http\Controllers\Api\DemandeController;
use App\Http\Controllers\Api\FavoriController;
use App\Http\Controllers\Api\InscriptionController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ── Webhook PayDunya (public, pas d'auth)
Route::post('/v1/paiements/webhook', [PaiementController::class, 'webhook']);

// ── Routes publiques Auth
Route::prefix('v1/auth')->group(function () {
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/verify-otp',      [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp',      [AuthController::class, 'resendOtp']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);

    // Google OAuth
    Route::get('/google/redirect', [AuthController::class, 'googleRedirect']);
    Route::get('/google/callback', [AuthController::class, 'googleCallback']);
});

// ── Routes publiques Biens (catalogue)
Route::prefix('v1')->group(function () {
    Route::get('/biens',      [BienController::class, 'index']);
    Route::get('/biens/{id}', [BienController::class, 'show']);
});

// ── Routes protégées
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Compte utilisateur — suppression
    Route::delete('/account', [UserController::class, 'destroy']);

    // Frais d'inscription bailleur/propriétaire
    Route::get('/inscription/frais',   [InscriptionController::class, 'frais']);
    Route::post('/inscription/payer',  [InscriptionController::class, 'payer']);

    // Simuler coût paiement (commission incluse)
    Route::get('/paiements/simuler', [PaiementController::class, 'simuler']);

    // Contrats — lecture + signature (bailleur + client)
    Route::get('/contrats/{id}',                  [ContratController::class, 'show']);
    Route::post('/contrats/{id}/signer',          [ContratController::class, 'signer']);
    Route::post('/contrats/{id}/upload-modele',   [ContratController::class, 'uploadModele']);
    Route::post('/contrats/{id}/upload-signe',    [ContratController::class, 'uploadSigne']);
    Route::post('/contrats/{id}/valider',         [ContratController::class, 'valider']);

    // Paiements
    Route::post('/paiements',                        [PaiementController::class, 'initier']);
    Route::post('/paiements/{id}/confirmer',         [PaiementController::class, 'confirmer']);
    Route::get('/paiements/{id}/recu',               [PaiementController::class, 'recu']);
    Route::get('/contrats/{contratId}/paiements',    [PaiementController::class, 'historique']);

    // Compte utilisateur (tous rôles)
    Route::put('/account',          [UserController::class, 'update']);
    Route::put('/account/password', [UserController::class, 'changePassword']);

    // Notifications (tous rôles)
    Route::get('/notifications',             [DemandeController::class, 'notifications']);

    // Avis / notes
    Route::post('/avis',                     [\App\Http\Controllers\Api\AvisController::class, 'store']);
    Route::get('/avis/{userId}',             [\App\Http\Controllers\Api\AvisController::class, 'index']);

    // Alertes biens (client)
    Route::get('/alertes',                   [\App\Http\Controllers\Api\AlerteController::class, 'index']);
    Route::post('/alertes',                  [\App\Http\Controllers\Api\AlerteController::class, 'store']);
    Route::delete('/alertes/{id}',           [\App\Http\Controllers\Api\AlerteController::class, 'destroy']);

    // Favoris (tous rôles)
    Route::get('/favoris',                   [FavoriController::class, 'index']);
    Route::post('/favoris/toggle',           [FavoriController::class, 'toggle']);
    Route::get('/favoris/check/{bienId}',    [FavoriController::class, 'check']);

    // Contact public (formulaire conseiller)
    Route::post('/contact', [\App\Http\Controllers\Api\ContactController::class, 'store']);

    // Espace client
    Route::middleware('role:client')->prefix('client')->group(function () {
        Route::get('/demandes',            [DemandeController::class, 'mesDemandes']);
        Route::post('/demandes',           [DemandeController::class, 'store']);
        Route::get('/demandes/{id}',        [DemandeController::class, 'show']);
        Route::post('/demandes/{id}/message', [DemandeController::class, 'sendMessage']);
        Route::get('/biens',               [BienController::class, 'index']);
        Route::get('/contrats',            [ContratController::class, 'mesContrats']);
        Route::get('/paiements',           [PaiementController::class, 'mesPaiements']);
    });

    // Espace bailleur
    Route::middleware(['role:bailleur,proprietaire', 'inscription'])->prefix('bailleur')->group(function () {
        Route::get('/biens',               [BienController::class, 'mesBiens']);
        Route::get('/biens/{id}',          [BienController::class, 'showBailleur']);
        Route::post('/biens',              [BienController::class, 'store']);
        Route::put('/biens/{id}',          [BienController::class, 'update']);
        Route::delete('/biens/{id}',       [BienController::class, 'destroy']);
        Route::get('/demandes',            [DemandeController::class, 'demandesBailleur']);
        Route::get('/demandes/{id}',       [DemandeController::class, 'show']);
        Route::put('/demandes/{id}',            [DemandeController::class, 'update']);
        Route::post('/demandes/{id}/message',   [DemandeController::class, 'repondreClient']);
        Route::post('/contrats',                [ContratController::class, 'store']);
        Route::get('/contrats',                 [ContratController::class, 'mesContratsRecu']);
        Route::get('/paiements',                [PaiementController::class, 'paiementsBailleur']);
        Route::get('/paiements/en-attente',     [PaiementController::class, 'enAttente']);
    });

    // Espace admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard',              [\App\Http\Controllers\Api\AdminController::class, 'dashboard']);
        Route::get('/users',                  [\App\Http\Controllers\Api\AdminController::class, 'users']);
        Route::get('/users/{id}',             [\App\Http\Controllers\Api\AdminController::class, 'userDetail']);
        Route::put('/users/{id}/toggle',      [\App\Http\Controllers\Api\AdminController::class, 'toggleUser']);
        Route::put('/users/{id}/verifier',    [\App\Http\Controllers\Api\AdminController::class, 'verifierUser']);
        Route::delete('/users/{id}',          [\App\Http\Controllers\Api\AdminController::class, 'deleteUser']);
        Route::get('/annonces',               [\App\Http\Controllers\Api\AdminController::class, 'annonces']);
        Route::put('/annonces/{id}/statut',   [\App\Http\Controllers\Api\AdminController::class, 'toggleAnnonce']);
        Route::get('/transactions',           [\App\Http\Controllers\Api\AdminController::class, 'transactions']);
        Route::get('/settings',               [\App\Http\Controllers\Api\AdminController::class, 'getSettings']);
        Route::put('/settings',               [\App\Http\Controllers\Api\AdminController::class, 'updateSettings']);
        Route::get('/commissions',            [\App\Http\Controllers\Api\AdminController::class, 'commissions']);
        // Gestion des abonnements en attente
        Route::get('/inscriptions/en-attente',        [InscriptionController::class, 'enAttente']);
        Route::post('/inscriptions/{user}/confirmer', [InscriptionController::class, 'confirmer']);
    });
});
