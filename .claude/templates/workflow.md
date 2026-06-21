# Workflow — Séquence type d'une session Claude Code
# Version 2.0

---

## Phase 1 · Démarrage de session

```
/model sonnet    ← modèle par défaut, toujours commencer ici
/usage           ← vérifier les tokens disponibles avant une longue session
```

Si le projet a un contexte métier spécifique :
```
"Lis .claude/context/domaine.md avant de répondre"
```

---

## Phase 2 · Travail courant (Sonnet)

```
→ [CODE]      pour tout code à écrire ou modifier (1–3 fichiers)
→ [DOC]       pour tout document à rédiger
→ [SPEC]      pour cahier des charges, SFD, STD
→ [REPORT]    pour rapport d'analyse ou bilan intermédiaire
→ [REVIEW]    pour revue de code, audit qualité, relecture
→ [CLOSEOUT]  pour clôture de projet ou de sprint
→ [REASONING] uniquement si décision complexe → passer à Opus d'abord
```

**Règle absolue :** formuler le prompt complet AVANT d'appuyer sur Entrée.
Un prompt mal structuré coûte plus en aller-retours qu'en temps de préparation.

> Claude peut signaler un risque ou proposer une alternative avant d'exécuter.
> Lire sa réponse avant de continuer.

---

## Phase 3 · Décision complexe (Opus)

```
/compact         ← OBLIGATOIRE avant de passer à Opus
/model opus

→ Utiliser le template [REASONING]
→ Lire la réponse ENTIÈREMENT
→ Valider explicitement : "ok, on part sur cette option"
   ou "non, on prend l'alternative B"

/model sonnet    ← revenir IMMÉDIATEMENT après la réponse
/compact         ← nettoyer le contexte Opus

→ Implémenter avec [CODE], [DOC] ou [SPEC]
```

> Ne jamais passer au développement directement après Opus
> sans avoir lu, compris et validé la recommandation.

---

## Phase 4 · Cycle de production d'un document professionnel

```
1. [REASONING] sur Opus (si document stratégique ou complexe)
   → Définir structure, audience, contenu clé, angle

2. [DOC] ou [SPEC] sur Sonnet
   → Produire le premier jet complet

3. [REVIEW] sur Sonnet
   → Relecture qualité, conformité, style

4. Correction ciblée
   → Un prompt par point de correction identifié
```

---

## Phase 5 · Cycle de développement

```
1. [REASONING] sur Opus (si architecture > 3 fichiers)
   → Plan d'implémentation validé par l'humain

2. [SPEC] sur Sonnet
   → Spécification technique si nécessaire

3. [CODE] sur Sonnet
   → Un fichier ou une fonction à la fois

4. [REVIEW] sur Sonnet
   → Relecture code, sécurité, tests

5. Merge/déploiement
   → Uniquement après autorisation explicite
```

---

## Phase 6 · Transition entre tâches

```
/rename {nom-descriptif-de-la-tâche}    ← nommer la session pour la retrouver
/clear                                   ← repartir sur un contexte propre
/model sonnet                            ← reset du modèle au défaut
```

Ne jamais enchaîner deux tâches différentes dans la même session sans /clear.
Le contexte accumulé coûte des tokens sur chaque message suivant.

---

## Phase 7 · Fin de session

```
/usage           ← bilan tokens consommés
/compact         ← si la session était longue
/rename          ← nommer la session si ce n'est pas déjà fait
```

---

## Résumé des coûts relatifs

| Modèle | Coût relatif | Usage recommandé                        |
|--------|-------------|------------------------------------------|
| Haiku  | 1×          | Tâches mécaniques rapides (< 2 min)      |
| Sonnet | 5×          | Production courante (80 % du temps)      |
| Opus   | 25×         | Décisions uniquement, sessions courtes   |

---

## Checklist anti-gaspillage tokens

- [ ] CLAUDE.md fait moins de 100 lignes
- [ ] Les fichiers de contexte détaillés sont dans .claude/context/
- [ ] Les règles détaillées sont dans .claude/rules/ (pas dans CLAUDE.md)
- [ ] /clear utilisé à chaque changement de tâche
- [ ] /compact utilisé avant tout switch vers Opus
- [ ] /model sonnet rétabli après chaque Haiku ou Opus
- [ ] Chaque prompt cible une seule action sur une seule cible

## Checklist collaboration et qualité

- [ ] La recommandation d'Opus a été lue et validée avant d'implémenter
- [ ] Aucun code déployé sans autorisation explicite
- [ ] Les risques signalés par Claude ont été pris en compte
- [ ] Les secrets et clés API sont dans des variables d'environnement
- [ ] Le document produit a été relu avec la grille qualité (collaboration.md §3)
- [ ] Les formulations creuses ont été éliminées (collaboration.md §5)
