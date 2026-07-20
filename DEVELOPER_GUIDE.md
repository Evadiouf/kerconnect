# KerConnect — Guide Développeur

Plateforme immobilière numérique sénégalaise développée par **Naratechvision**.  
Contact : contact@naratechvision.com

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Prérequis](#2-prérequis)
3. [Installation & Démarrage](#3-installation--démarrage)
4. [Architecture](#4-architecture)
5. [Conventions critiques](#5-conventions-critiques)
6. [Structure des dossiers](#6-structure-des-dossiers)
7. [Base de données](#7-base-de-données)
8. [Authentification](#8-authentification)
9. [API — Endpoints](#9-api--endpoints)
10. [Flux métier principaux](#10-flux-métier-principaux)
11. [Upload de fichiers](#11-upload-de-fichiers)
12. [Paiements](#12-paiements)
13. [Emails](#13-emails)
14. [Notifications](#14-notifications)
15. [Commission automatique](#15-commission-automatique)
16. [Variables d'environnement](#16-variables-denvironnement)
17. [Comptes de test](#17-comptes-de-test)
18. [Erreurs fréquentes](#18-erreurs-fréquentes)

---

## 1. Vue d'ensemble

KerConnect est une SPA Next.js connectée à une API REST Laravel.  
Elle permet à 4 profils d'utilisateurs d'interagir autour de biens immobiliers :

| Rôle | Description |
|------|-------------|
| `client` | Cherche à louer ou acheter un bien |
| `bailleur` | Propose des biens à la location |
| `proprietaire` | Propose des biens à la vente (même interface que bailleur) |
| `admin` | Gère la plateforme (Hawoly / Naratechvision) |

---

## 2. Prérequis

- **PHP** 8.3+ avec extensions : pdo_mysql, fileinfo, exif, gd, mbstring, openssl
- **Composer** 2.x
- **MySQL** 8.x
- **Node.js** 18+ et **npm** 9+
- **Git**

---

## 3. Installation & Démarrage

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env          # puis configurer (voir section 16)
php artisan key:generate
php artisan migrate
php artisan db:seed           # crée l'admin + paramètres commission
php artisan storage:link      # expose storage/app/public via /storage

# Démarrer avec les limites d'upload correctes
php -d upload_max_filesize=20M -d post_max_size=50M artisan serve
# → http://localhost:8000
```

### Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev
# → http://localhost:3000
```

### Raccourci (scripts bat à la racine)

```
start-backend.bat   → lance php artisan serve
start-frontend.bat  → lance npm run dev
start-dev.bat       → lance les deux en même temps
```

---

## 4. Architecture

```
Browser (Next.js SPA)
        │  fetch / axios
        ▼
Laravel API REST  (/api/v1/...)
        │
        ├── MySQL (données)
        ├── storage/app/public (fichiers : photos, contrats, PDFs)
        └── Gmail SMTP (emails OTP, notifications)
```

**Frontend → Backend** : toutes les requêtes passent par `src/lib/api.ts` (instance Axios avec intercepteur Bearer token).

---

## 5. Conventions critiques

> ⚠️ **Lire absolument avant de toucher au code.**

### 5.1 Next.js 16 — fichier middleware

Dans Next.js 16.2.9 (cette version), le fichier middleware s'appelle **`proxy.ts`** et non `middleware.ts`.  
`proxy.ts` se trouve dans `frontend/src/proxy.ts`.  
Ne pas créer de `middleware.ts` — cela crée un conflit et provoque des boucles infinies de redirection.

### 5.2 Upload de fichiers — utiliser XMLHttpRequest, pas Axios

Axios force `Content-Type: application/json` même sur les FormData, ce qui casse le boundary multipart.  
**Toujours utiliser `XMLHttpRequest` ou `fetch` natif pour tout upload de fichiers.**

```typescript
// ✅ Correct
const fd = new globalThis.FormData()
fd.append('fichier', file)
const res = await fetch(`${base}/v1/...`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  body: fd,
  // PAS de Content-Type → le navigateur le pose avec le bon boundary
})

// ❌ Interdit pour les uploads
await api.post('/v1/...', fd)
```

### 5.3 Authentification — double mécanisme

L'auth repose sur **deux systèmes parallèles** :

| Mécanisme | Usage |
|-----------|-------|
| Token Bearer dans `localStorage` | Toutes les requêtes API axios |
| Cookie `kc_auth=1` + `kc_role={role}` | Protection des routes par `proxy.ts` |

Les deux sont posés/effacés ensemble dans `src/store/auth.store.ts` (`setAuth` / `clearAuth`).  
Si un seul manque → boucle de redirection.

### 5.4 Démarrer le backend avec les bonnes limites

```bash
# ✅
php -d upload_max_filesize=20M -d post_max_size=50M artisan serve

# ❌ (limite PHP par défaut = 2M → photos rejetées)
php artisan serve
```

### 5.5 Statuts des contrats

L'enum accepte exactement ces valeurs — ne pas en inventer d'autres :

```
brouillon → en_attente_signature → signe → valide → resilie
```

Le statut `actif` **n'existe pas** dans cet enum.

### 5.6 Tinker sous PowerShell

PowerShell interprète `$variable` dans les chaînes. Pour exécuter du PHP via tinker :

```bash
# Écrire le code dans un fichier temporaire puis l'exécuter
php artisan tinker --execute="require base_path('script.php');"
```

---

## 6. Structure des dossiers

```
Ker_connect/
├── backend/                    # Laravel 13
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AdminController.php
│   │   │   ├── AlerteController.php
│   │   │   ├── AuthController.php
│   │   │   ├── AvisController.php
│   │   │   ├── BienController.php
│   │   │   ├── ContratController.php
│   │   │   ├── DemandeController.php
│   │   │   ├── PaiementController.php
│   │   │   └── UserController.php
│   │   ├── Http/Middleware/
│   │   │   └── CheckRole.php       # middleware role:client, role:bailleur, etc.
│   │   └── Models/
│   │       ├── Alerte.php
│   │       ├── Avis.php
│   │       ├── Bien.php
│   │       ├── Contrat.php
│   │       ├── Demande.php
│   │       ├── Favori.php
│   │       ├── Paiement.php
│   │       ├── Setting.php         # paramètres plateforme (commission, etc.)
│   │       └── User.php
│   ├── database/migrations/
│   ├── routes/api.php              # toutes les routes API
│   └── storage/app/public/         # fichiers uploadés (lien symbolique → public/storage)
│
├── frontend/                   # Next.js 16.2.9
│   └── src/
│       ├── app/
│       │   ├── admin/          # pages admin
│       │   ├── auth/           # login, register, otp, reset
│       │   ├── bailleur/       # pages bailleur/propriétaire
│       │   ├── biens/          # catalogue public
│       │   ├── client/         # pages client
│       │   ├── location/       # page listing location
│       │   ├── paiement/       # page de paiement
│       │   └── page.tsx        # home
│       ├── components/
│       │   ├── layout/
│       │   │   └── DashboardLayout.tsx   # layout principal avec sidebar + notifs
│       │   └── ui/             # composants réutilisables
│       ├── lib/
│       │   └── api.ts          # instance Axios centrale (intercepteurs auth + 401)
│       ├── store/
│       │   └── auth.store.ts   # Zustand : user, token, setAuth, clearAuth
│       └── proxy.ts            # ⚠️ middleware Next.js 16 (protection routes)
│
└── documentation/
    ├── kerconnect_documentation.pdf    # doc technique complète
    ├── kerconnect_presentation.pdf     # présentation 20 slides (Beamer)
    └── KerConnect_Presentation.pptx   # présentation PowerPoint 18 slides
```

---

## 7. Base de données

### Tables principales

| Table | Rôle clé |
|-------|----------|
| `users` | Tous les profils (role: client/bailleur/proprietaire/admin) |
| `biens` | Annonces immobilières avec photos JSON |
| `demandes` | Demandes de location/achat par les clients |
| `contrats` | Contrats liés à une demande acceptée |
| `paiements` | Transactions avec commission intégrée |
| `otps` | Codes OTP pour vérification email |
| `favoris` | Biens mis en favoris par les clients |
| `settings` | Paramètres plateforme (commission_taux, etc.) |
| `avis` | Notes 1-5 étoiles post-contrat |
| `alertes` | Abonnements aux critères de biens |

### Colonnes importantes — `contrats`

```sql
fichier_contrat        -- PDF modèle envoyé par le bailleur
fichier_signe_client   -- PDF signé renvoyé par le client
signature_bailleur     -- signature textuelle bailleur (legacy)
signature_locataire    -- signature textuelle client (legacy)
signe_client_at        -- date upload doc signé par client
valide_bailleur_at     -- date validation bailleur
statut                 -- enum: brouillon|en_attente_signature|signe|valide|resilie
```

### Colonnes importantes — `paiements`

```sql
montant             -- montant total payé par le client
commission_taux     -- taux au moment du paiement (ex: 5.00)
commission_montant  -- montant prélevé par la plateforme
montant_net         -- montant reçu par le bailleur
```

---

## 8. Authentification

### Flux inscription

```
POST /v1/auth/register
  → OTP 4 chiffres envoyé par email
  → POST /v1/auth/verify-otp  { email, otp }
  → token Sanctum retourné
  → stocké dans localStorage('token') + cookies kc_auth/kc_role
```

### Flux connexion

```
POST /v1/auth/login  { email, password }
  → token + user retournés
  → auth.store.ts::setAuth(user, token) pose le token ET les cookies
```

### Protection des routes (proxy.ts)

```typescript
// Routes protégées : /client/*, /bailleur/*, /admin/*
// Vérifie le cookie kc_auth=1
// Si absent → redirect /auth/login?redirect=...
// Si présent sur /auth/login → redirect vers le dashboard du rôle (kc_role)
// Exception : /auth/login?expired=1 et ?logout ne sont pas redirigés
```

### Gestion du token expiré (api.ts)

```typescript
// Intercepteur 401 : clearAuth() + redirect /auth/login?expired=1
// Flag 'redirecting' pour éviter la boucle
```

---

## 9. API — Endpoints

Toutes les routes sont préfixées `/api/v1/`.

### Auth (public)
```
POST /auth/login
POST /auth/register
POST /auth/verify-otp
POST /auth/resend-otp
POST /auth/forgot-password
POST /auth/reset-password
```

### Biens (public)
```
GET  /biens              ?ville=&nature=&type=&prix_max=&prix_min=
GET  /biens/{id}
```

### Biens (bailleur, auth)
```
GET    /bailleur/biens
GET    /bailleur/biens/{id}
POST   /bailleur/biens        multipart/form-data (XHR obligatoire)
PUT    /bailleur/biens/{id}
DELETE /bailleur/biens/{id}
```

### Demandes
```
GET  /client/demandes
POST /client/demandes
GET  /client/demandes/{id}
POST /client/demandes/{id}/message

GET  /bailleur/demandes
GET  /bailleur/demandes/{id}
PUT  /bailleur/demandes/{id}   { statut: acceptee|refusee }
POST /bailleur/demandes/{id}/message
```

### Contrats
```
GET  /contrats/{id}
POST /contrats/{id}/upload-modele   multipart (bailleur → envoie PDF)
POST /contrats/{id}/upload-signe    multipart (client → renvoie signé)
POST /contrats/{id}/valider         (bailleur → autorise paiement)
```

### Paiements
```
POST /paiements                    { contrat_id, montant, mode, libelle }
POST /paiements/{id}/confirmer     (bailleur → espèces/chèque)
GET  /bailleur/paiements
GET  /bailleur/paiements/en-attente
GET  /bailleur/contrats
```

### Admin
```
GET  /admin/dashboard
GET  /admin/users
PUT  /admin/users/{id}/toggle
DEL  /admin/users/{id}
GET  /admin/annonces
PUT  /admin/annonces/{id}/statut
GET  /admin/transactions
GET  /admin/settings
PUT  /admin/settings    { commission_taux, commission_active }
GET  /admin/commissions
```

### Divers
```
GET    /notifications
POST   /avis            { contrat_id, note, commentaire }
GET    /alertes
POST   /alertes         { ville, nature, prix_max, type_bien }
DELETE /alertes/{id}
GET/POST /favoris
POST   /favoris/toggle
```

---

## 10. Flux métier principaux

### Flux complet location

```
1. Client s'inscrit (OTP email)
2. Client cherche un bien (/location ou /biens)
3. Client soumet une demande → statut: soumise
4. Bailleur voit la demande → clique Accepter
   → statut: acceptee
   → contrat créé automatiquement (statut: en_attente_signature)
5. Bailleur uploade le PDF du contrat sur /bailleur/demandes/{id}
   → email envoyé automatiquement au client
6. Client va sur /client/demandes/{id}
   → télécharge le PDF
   → signe manuscritement
   → uploade le scan signé
   → contrat statut: signe
7. Bailleur reçoit email + notification cloche
   → valide la signature sur /bailleur/demandes/{id}
   → contrat statut: valide
8. Client voit le bouton "Payer" (débloqué uniquement si statut=valide)
9. Client paie (Wave/Espèces/etc.)
   → commission 5% prélevée automatiquement
10. Si espèces/chèque : bailleur confirme sur /bailleur/paiements
```

### Flux OTP

```
register → email OTP 4 chiffres → /auth/verify-otp
forgot-password → email OTP → /auth/verify-otp → /auth/reset-password
```

---

## 11. Upload de fichiers

### Backend

```php
// BienController::store() — photos multiples
$images = [];
foreach ($request->file('photos', []) as $photo) {
    $images[] = $photo->store("biens/{$bien->id}", 'public');
}
$bien->update(['images' => $images]);

// URL publique → url("storage/{$path}")
// storage:link doit avoir été exécuté
```

### Frontend — obligatoire : fetch ou XHR

```typescript
const fd = new globalThis.FormData()
fd.append('photos[]', file)

// Avec XHR (annonce bailleur)
const xhr = new XMLHttpRequest()
xhr.open('POST', `${base}/v1/bailleur/biens`)
xhr.setRequestHeader('Authorization', `Bearer ${token}`)
// PAS de Content-Type → boundary automatique
xhr.send(fd)

// Avec fetch (contrats)
await fetch(`${base}/v1/contrats/${id}/upload-modele`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  body: fd,
})
```

### Affichage des fichiers

```typescript
// Photos biens
`http://localhost:8000/storage/${path}`

// En production : remplacer localhost:8000 par le domaine
```

---

## 12. Paiements

### Modes disponibles

| Mode | Confirmation |
|------|-------------|
| `wave` | Automatique (PayDunya webhook) |
| `orange_money` | Automatique (PayDunya webhook) |
| `carte` | Automatique (PayDunya webhook) |
| `espece` | Manuelle par le bailleur |
| `cheque` | Manuelle par le bailleur |

### Commission automatique

```php
// PaiementController::confirmer()
$taux       = (float) Setting::get('commission_taux', '5');
$commission = round($montant * $taux / 100, 2);
$net        = $montant - $commission;

$paiement->update([
    'commission_taux'    => $taux,
    'commission_montant' => $commission,
    'montant_net'        => $net,
]);
```

### Blocage paiement sans contrat validé

```php
// PaiementController::initier()
if ($contrat->statut !== 'valide') {
    return response()->json(['message' => 'Contrat non validé.'], 422);
}
```

---

## 13. Emails

Configuration dans `backend/.env` :

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=votre@gmail.com
MAIL_PASSWORD=app_password_16_chars   # Mot de passe d'application Gmail
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=votre@gmail.com
MAIL_FROM_NAME="KerConnect"
```

> ⚠️ Utiliser un **mot de passe d'application** Gmail (pas le mot de passe du compte).  
> Activer la validation en 2 étapes → Sécurité → Mots de passe des applications.

Emails envoyés automatiquement :
- Inscription → OTP vérification
- Mot de passe oublié → OTP reset
- Bailleur uploade contrat → email au client
- Client uploade contrat signé → email au bailleur
- Messagerie plateforme bailleur ↔ client

---

## 14. Notifications

### Frontend — polling 30 secondes

```typescript
// DashboardLayout.tsx
useQuery({
  queryKey: ['notifications'],
  queryFn: () => api.get('/v1/notifications').then(r => r.data),
  refetchInterval: 30_000,
})
```

### Backend — DemandeController::notifications()

Retourne selon le rôle :

**Client** :
- Demandes récentes
- Contrats en attente de sa signature (`fichier_contrat` présent, `fichier_signe_client` null)

**Bailleur** :
- Demandes reçues
- Paiements en attente de confirmation
- Contrats signés par le client en attente de validation bailleur

---

## 15. Commission automatique

```php
// Lire/écrire un paramètre
Setting::get('commission_taux', '5');    // lecture
Setting::set('commission_taux', '7.5'); // écriture

// Clés disponibles
commission_taux      // taux en % (ex: "5")
commission_active    // "1" = activée, "0" = désactivée
plateforme_nom       // "KerConnect"
plateforme_email     // "contact@naratechvision.com"
```

L'admin peut modifier ces valeurs depuis `/admin/settings`.

---

## 16. Variables d'environnement

### backend/.env (ne jamais committer)

```env
APP_NAME=KerConnect
APP_ENV=local
APP_KEY=base64:...          # généré par php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kerconnect
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=...
MAIL_PASSWORD=...           # mot de passe d'application 16 chars
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=...
MAIL_FROM_NAME="KerConnect"

PAYDUNYA_MASTER_KEY=...
PAYDUNYA_PRIVATE_KEY=...
PAYDUNYA_TOKEN=...
PAYDUNYA_MODE=test           # ou live en production

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

### frontend/.env.local (ne jamais committer)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 17. Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | demehawoly@gmail.com | KerConnect2026! |
| Bailleur | *(créer via /auth/register avec rôle bailleur)* | — |
| Client | *(créer via /auth/register avec rôle client)* | — |

---

## 18. Erreurs fréquentes

### "The photos.0 failed to upload"
→ Deux causes possibles :
1. Backend lancé sans les options PHP : relancer avec `php -d upload_max_filesize=20M -d post_max_size=50M artisan serve`
2. Utilisation d'axios pour l'upload : remplacer par `XMLHttpRequest` ou `fetch`

### Boucle de redirection infinie sur /auth/login
→ Le cookie `kc_auth` est présent mais le token API est invalide (ou vice-versa).  
→ Vider les cookies et localStorage du navigateur, puis reconnectez.

### "d is not defined" ou variable undefined dans JSX
→ Vérifier qu'aucune variable intermédiaire (ex: `const d = demande`) n'a été supprimée mais que ses références sont encore dans le JSX.

### Contrat non créé après acceptation
→ Vérifier que le statut envoyé est bien `acceptee` (et non `accepté` ou `actif`).  
→ Vérifier les logs Laravel : `storage/logs/laravel.log`

### Page 404 sur une route qui devrait exister
→ Chercher si un import est manquant ou inutilisé (Turbopack peut bloquer la compilation).  
→ Vérifier que le fichier `page.tsx` est bien dans le bon dossier et exporte un `default`.

### Email non envoyé
→ Vérifier `MAIL_PASSWORD` dans `.env` — doit être un mot de passe d'application Gmail (16 chars, pas le mot de passe du compte).  
→ Vérifier que la validation en 2 étapes est activée sur le compte Gmail.

---

## Notes de production

- Remplacer `http://localhost:8000` par le domaine de l'API dans `frontend/.env.local`
- Exécuter `php artisan storage:link` sur le serveur
- Configurer un reverse proxy (Nginx) devant `php artisan serve`
- Passer `PAYDUNYA_MODE=live` pour les vrais paiements
- Activer HTTPS et mettre `SANCTUM_STATEFUL_DOMAINS` à jour

---

*Document maintenu par Naratechvision — contact@naratechvision.com*
