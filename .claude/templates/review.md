# Template : Revue / Audit qualité
# Modèle recommandé : /model sonnet
# Usage : relecture de code, document, spécification ou architecture

---

## En-tête de prompt à copier-coller

```
TYPE_REVUE  : {code | document | spécification | architecture | sécurité}
CIBLE       : {chemin/fichier.ext ou titre du document}
OBJECTIF    : {ce que cette revue doit évaluer — sécurité, conformité, lisibilité, etc.}
AUDIENCE    : {qui va agir sur le résultat de cette revue}

CRITÈRES    :
- {critère 1 : ex. "conformité au style guide PEP 8"}
- {critère 2 : ex. "gestion complète des cas d'erreur"}
- {critère 3 : ex. "absence de données sensibles en clair"}

NE PAS ÉVALUER : {aspects explicitement hors périmètre de cette revue}

CONTENU À ANALYSER :
```
{coller ici le code, le document ou l'extrait à réviser}
```
```

---

## Grilles de revue par type

### Revue de code

| Dimension          | Questions de vérification                                         |
|--------------------|-------------------------------------------------------------------|
| Correction         | Le code fait-il ce qu'il est censé faire ?                       |
| Cas limites        | Les valeurs nulles, listes vides, timeouts sont-ils gérés ?      |
| Sécurité           | Injection, auth, secrets en clair, surface d'attaque ?            |
| Performance        | Complexité algorithmique, appels inutiles, fuites mémoire ?       |
| Lisibilité         | Les noms sont-ils expressifs ? La logique est-elle claire ?       |
| Testabilité        | Le code est-il découplé et testable unitairement ?                |
| Conformité         | Respect du style guide, des conventions du projet ?               |
| Maintenabilité     | Un nouveau développeur comprend-il sans contexte supplémentaire ? |

### Revue de document

| Dimension          | Questions de vérification                                         |
|--------------------|-------------------------------------------------------------------|
| Clarté             | Un lecteur sans contexte comprend-il l'essentiel en 2 min ?      |
| Structure          | La progression logique est-elle évidente ?                        |
| Précision          | Les affirmations sont-elles vérifiables et sourçables ?           |
| Exhaustivité       | Aucun point critique n'est-il omis ?                              |
| Style              | Absence de formulations creuses ou génériques ?                   |
| Audience           | Registre et densité adaptés au lecteur cible ?                    |
| Conformité         | Respect des normes du domaine (IEEE, APA, ISO…) ?                |
| Actionnabilité     | Le lecteur sait-il quoi faire après lecture ?                     |

### Revue d'architecture

| Dimension          | Questions de vérification                                         |
|--------------------|-------------------------------------------------------------------|
| Faisabilité        | L'architecture est-elle réalisable avec les ressources disponibles? |
| Scalabilité        | Tient-elle sous charge 2×, 10× le volume actuel ?                |
| Sécurité           | Authentification, autorisation, chiffrement, isolation ?          |
| Résilience         | Points de défaillance unique (SPOF) identifiés et mitigés ?      |
| Maintenabilité     | Les composants sont-ils suffisamment découplés ?                  |
| Cohérence          | Les décisions sont-elles cohérentes entre elles ?                 |
| Décisions ADR      | Les choix non évidents sont-ils documentés ?                      |

---

## Format de sortie attendu

La revue doit être structurée ainsi :

```
## Synthèse
{2–3 phrases : état général, point fort, point critique principal}

## Points positifs
- {ce qui est bien fait et pourquoi}

## Points à corriger (classés par priorité)

### Critique — à corriger avant livraison
- {problème} → {action corrective suggérée}

### Important — à corriger prochainement
- {problème} → {action corrective suggérée}

### Mineur — à améliorer si temps le permet
- {problème} → {suggestion}

## Recommandations globales
{1–3 recommandations d'ensemble si applicable}
```

---

## Notes

- Une revue = un seul fichier ou document à la fois
- Prioriser les points critiques — ne pas noyer l'essentiel dans les détails mineurs
- Proposer des corrections, pas seulement des constats
- Si la revue révèle un problème d'architecture → passer au template [REASONING]
