# KerConnect — Rapport de sécurité
# Généré automatiquement par Hawoly — Phase 8

## OWASP Top 10 — Statut de couverture

| # | Faille | Statut | Implémentation |
|---|--------|--------|----------------|
| A01 | Contrôle d'accès défaillant | COUVERT | RoleMiddleware RBAC — 4 rôles distincts |
| A02 | Défaillances cryptographiques | COUVERT | HTTPS Let's Encrypt, bcrypt passwords, JWT sanctum |
| A03 | Injection SQL/XSS | COUVERT | Eloquent ORM (requêtes préparées), React escaping auto |
| A04 | Conception non sécurisée | COUVERT | SecurityHeaders middleware, validation stricte |
| A05 | Mauvaise configuration | COUVERT | APP_DEBUG=false en prod, headers sécurité, secrets en .env |
| A06 | Composants vulnérables | PARTIEL | `composer audit` + `npm audit` dans CI/CD |
| A07 | Échecs authentification | COUVERT | Rate limiting (5 tentatives login, 3 OTP), JWT 15min |
| A08 | Intégrité données | COUVERT | Validation MIME type + extension + taille fichiers |
| A09 | Journalisation insuffisante | PARTIEL | Logs Laravel activés — logs d'audit à implémenter en V2 |
| A10 | SSRF | N/A | Pas d'appels HTTP vers URLs externes contrôlées par user |

## Mesures implémentées

### Authentification
- JWT via Laravel Sanctum (token 15min, refresh 7 jours)
- Rate limiting login : 5 tentatives/min/IP
- Rate limiting OTP : 3 tentatives/5min
- Blocage compte inactif à la connexion
- Vérification email via OTP 4 chiffres (expire 10min)

### Autorisation
- RBAC via RoleMiddleware (client, bailleur, proprietaire, admin)
- Chaque espace API protégé par middleware de rôle
- Vérification propriétaire avant modification/suppression

### Fichiers uploadés
- Liste blanche MIME types : image/jpeg, image/png, image/webp, video/mp4, application/pdf
- Liste blanche extensions : jpg, jpeg, png, webp, mp4, pdf
- Taille max : Images 5Mo, Vidéos 50Mo, PDFs 10Mo
- Validation côté serveur Laravel (pas seulement frontend)

### En-têtes HTTP sécurité
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- Content-Security-Policy: configurée

### Secrets et configuration
- Toutes les clés API dans .env (non versionné)
- .env.hawoly exclus du git
- APP_DEBUG=false en production
- Mots de passe hashés avec bcrypt

## À implémenter en V2
- Logs d'audit complets (connexions, actions sensibles)
- 2FA optionnel (SMS OTP)
- Chiffrement des fichiers sensibles (CNI, contrats)
- Scan antivirus des fichiers uploadés
- Sessions Redis pour invalidation centralisée

## Secrets GitHub Actions requis
Configurer dans Settings > Secrets > Actions :
- RENDER_BACKEND_DEPLOY_HOOK
- RENDER_FRONTEND_DEPLOY_HOOK
- RENDER_API_KEY
- GMAIL_USERNAME (demehawoly@gmail.com)
- GMAIL_PASSWORD (app password)
