# Template : Génération / Modification de code
# Modèle recommandé : /model sonnet
# Usage : 1 prompt = 1 action = 1 cible

---

## En-tête de prompt à copier-coller

```
ACTION       : {ajouter | corriger | refactorer | optimiser | créer | supprimer}
CIBLE        : {chemin/fichier.ext : nom_fonction_ou_classe}
LANGAGE      : {Python | TypeScript | JavaScript | Go | Rust | SQL | autre}

ENTRÉE       : {type + exemple de valeur}
SORTIE       : {type + exemple de valeur attendue}
CAS LIMITES  : {null, liste vide, overflow, timeout, erreur réseau, etc.}
PERFORMANCE  : {contrainte si applicable : < 200ms, < 50MB RAM, etc.}

NE PAS TOUCHER : {autres fonctions, fichiers ou modules à ne pas modifier}
TESTS          : {oui → chemin/vers/tests/ + framework | non}

CODE CONCERNÉ :
```{langage}
{coller uniquement le snippet de la fonction ou classe concernée}
{pas tout le fichier — jamais}
```
```

---

## Règles d'usage

- **1 prompt = 1 action = 1 cible** — une seule fonction ou un seul fichier
- Si la tâche touche plus de 3 fichiers :
  → utiliser d'abord [REASONING] avec Opus pour planifier
  → revenir sur Sonnet et appliquer [CODE] fichier par fichier
- Coller uniquement le snippet pertinent, jamais tout le fichier
- Mentionner explicitement ce qui ne doit pas être modifié
- Si le résultat est incorrect, préciser davantage CAS LIMITES avant de relancer

> Règle de collaboration : ne jamais déployer ou merger du code
> sans relecture et autorisation explicite du binôme humain.
> Si Claude détecte un risque dans la tâche demandée, il le signale avant d'écrire.

---

## Exemples d'ACTION selon domaine

| Domaine      | Exemple de tâche                                                    |
|--------------|---------------------------------------------------------------------|
| ML / IA      | corriger `normalisation.py:roman_to_int` — mauvaise détection       |
| Backend      | ajouter `auth.js:verifyToken` — validation JWT expiré               |
| Frontend     | refactorer `Dashboard.tsx:useEffect` — éliminer re-renders          |
| Data         | optimiser `pipeline.py:load_batch` — réduire empreinte mémoire      |
| Scripting    | créer `convert.py:m4a_to_wav` — conversion audio avec fallback      |
| API          | corriger `routes/users.ts:updateUser` — gestion 404 manquante       |
| Base de données | optimiser `queries/reports.sql:monthly_summary` — index manquant |

---

## Checklist avant de soumettre

- [ ] ACTION clairement définie (pas "améliore" ou "refais")
- [ ] CIBLE = un seul fichier + une seule fonction
- [ ] CAS LIMITES listés explicitement
- [ ] NE PAS TOUCHER renseigné si pertinent
- [ ] Snippet pertinent collé (pas tout le fichier)
- [ ] Framework de test précisé si TESTS = oui
