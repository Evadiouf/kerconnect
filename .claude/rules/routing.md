# Routing des modèles — règle universelle
# Charger à la demande : "Lis .claude/rules/routing.md avant de répondre"

---

## Modèle par défaut

/model sonnet ← démarrer TOUJOURS ici, sans exception

---

## Haiku — tâches mécaniques (< 2 min)

**Utiliser quand :**
- Reformater ou convertir un fichier (CSV → JSON, YAML → TOML…)
- Renommer des variables, fonctions, identifiants
- Chercher une valeur ou un pattern dans un fichier
- Générer du boilerplate simple et répétitif
- Corriger une faute de frappe ou de syntaxe évidente
- Traduire un texte court sans analyse contextuelle

**Séquence :**
```
/model haiku → exécuter la tâche → /model sonnet immédiatement après
```

---

## Sonnet — travail courant (80 % du temps)

**Utiliser pour :**
- Rédiger tout document : cahier des charges, spécification, rapport, email, README, article
- Écrire ou modifier du code sur 1 à 3 fichiers
- Écrire des tests unitaires, d'intégration ou de non-régression
- Analyser une erreur connue, un log, un traceback
- Expliquer un concept ou résumer un document
- Préparer un document de suivi, bilan ou clôture de projet
- Toute tâche standard ne nécessitant pas de raisonnement profond

**Commande :**
```
/model sonnet ← défaut — ne pas switcher sans raison explicite
```

---

## Opus — raisonnement profond (exception stricte)

**Utiliser uniquement pour :**
- Décision d'architecture impliquant plus de 3 fichiers ou composants
- Debugging cross-système sans cause évidente après 2 tentatives sur Sonnet
- Analyse de trade-offs avec plusieurs options complexes et interdépendantes
- Lecture et synthèse d'un article de recherche ou document technique dense
- Conception d'un nouveau système ou approche from scratch
- Évaluation de risques sur une décision stratégique majeure

**Séquence obligatoire :**
```
/compact       ← OBLIGATOIRE — nettoyer le contexte avant
/model opus    ← poser la question avec le template [REASONING]
               ← lire et valider la réponse AVANT de continuer
/model sonnet  ← revenir IMMÉDIATEMENT après la réponse d'Opus
/compact       ← nettoyer le contexte Opus
```

> Ne jamais enchaîner deux questions à Opus dans la même session.
> Ne jamais passer directement au code après Opus sans validation humaine.

---

## Règles de transition entre tâches

| Situation                              | Action requise         |
|----------------------------------------|------------------------|
| Changement de sujet ou de tâche        | /clear                 |
| Session dépassant 40 messages          | /compact               |
| Avant tout switch vers Opus            | /compact (obligatoire) |
| Après chaque usage d'Opus              | /model sonnet + /compact |
| Après chaque usage de Haiku            | /model sonnet          |
| Fin de session longue                  | /compact + /usage      |

---

## Coût relatif des modèles

| Modèle | Coût relatif | Usage cible                           |
|--------|-------------|---------------------------------------|
| Haiku  | 1×          | Tâches mécaniques, < 2 min            |
| Sonnet | 5×          | Production courante, 80 % du temps    |
| Opus   | 25×         | Décisions uniquement, sessions courtes|

---

## Checklist anti-gaspillage tokens

- [ ] Chaque prompt cible une seule action sur une seule cible
- [ ] Les fichiers de contexte ne sont chargés que si la tâche le nécessite
- [ ] /clear utilisé à chaque changement de tâche
- [ ] /compact utilisé avant tout switch vers Opus
- [ ] /model sonnet rétabli après chaque Haiku ou Opus
- [ ] CLAUDE.md fait moins de 100 lignes (règles détaillées dans .claude/)
