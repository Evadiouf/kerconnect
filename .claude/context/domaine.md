# Contexte métier — {nom du projet}
# Charger à la demande : "Lis .claude/context/domaine.md avant de répondre"
# Mise à jour : automatique en fin de session ou sur demande explicite

---

## Comment ce fichier se remplit

Il y a deux façons de renseigner ce fichier — les deux sont valides :

1. **Au fil de la session** — Claude apprend le projet par les échanges et les fichiers
   fournis, puis propose en fin de session de consolider ce qu'il a compris ici.

2. **Par extraction directe** — tu fournis un CDC, README, note d'idées ou schéma
   et tu dis : "Remplis domaine.md avec ce que tu comprends." Claude extrait et soumet
   le résultat pour validation avant d'écrire.

> Claude ne remplit jamais une section avec des hypothèses non confirmées.
> Il marque {à confirmer} ce qui n'est pas certain.

---

## Domaine
{Description du domaine métier en 3 à 5 phrases.}
{Ce que ce projet résout, pour qui, dans quel contexte opérationnel.}
{Ce que Claude ne peut pas déduire seul sans ce fichier.}

---

## Vocabulaire spécifique

| Terme       | Définition dans CE projet                            |
|-------------|------------------------------------------------------|
| {terme 1}   | {définition en une phrase — sens précis ici}         |
| {terme 2}   | {définition en une phrase}                           |

---

## Stack technique

| Composant     | Technologie / Version       | Rôle                         |
|---------------|-----------------------------|------------------------------|
| {composant 1} | {langage / framework vX.Y}  | {rôle en 5 mots}             |
| {composant 2} | {service ou outil}          | {rôle en 5 mots}             |

---

## Contraintes métier

Règles que Claude ne doit pas violer sans validation explicite :

- {contrainte 1}
- {contrainte 2}

---

## Contraintes terrain

{Si le projet est déployé dans un contexte particulier : infrastructure limitée,
connectivité instable, contraintes réglementaires locales, équipe réduite, etc.}

| Dimension      | Réalité du projet                                   |
|----------------|-----------------------------------------------------|
| Infrastructure | {ex. "serveur local uniquement, pas de cloud"}      |
| Utilisateurs   | {ex. "non-techniciens, mobile first"}               |
| Maintenance    | {ex. "1 développeur, pas d'ops dédié"}              |

---

## Parties prenantes

| Rôle           | Nom ou équipe        | Périmètre                         |
|----------------|----------------------|-----------------------------------|
| Commanditaire  | {nom}                | Validation finale, budget         |
| Technique      | {nom ou équipe}      | Implémentation, architecture      |
| Utilisateurs   | {profil cible}       | Tests, feedback                   |

---

## Références

| Ressource             | Usage                         | Lien ou chemin          |
|-----------------------|-------------------------------|-------------------------|
| {document 1}          | {ex. "spec de l'API tierce"}  | {lien ou chemin local}  |
| {dépôt existant}      | {ex. "code à ne pas casser"}  | {lien}                  |

---

## Historique des mises à jour

| Date       | Ce qui a été ajouté ou modifié              |
|------------|---------------------------------------------|
| {date}     | {création initiale — source : {fichier}}    |
| {date}     | {ajout : {section} — appris en session}     |
