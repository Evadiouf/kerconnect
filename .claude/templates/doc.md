# Template : Rédaction de document
# Modèle recommandé : /model sonnet
# Usage : un seul document à la fois

---

## En-tête de prompt à copier-coller

```
SUJET     : {de quoi parle ce document — 1 phrase précise}
TYPE      : {README | email | article technique | article scientifique |
             documentation utilisateur | documentation développeur |
             présentation | synthèse | autre}
AUDIENCE  : {développeurs seniors | décideurs non-techniques | jury académique |
             utilisateurs finaux | clients | équipe projet | etc.}
LANGUE    : {français | anglais | autre}
LONGUEUR  : {courte ~200 mots | moyenne ~500 mots | longue > 1000 mots}

SOURCE    : {fichier ou texte de référence, si applicable — laisser vide sinon}
            # Ne charger que les sources explicitement mentionnées ici

INCLURE   : {éléments obligatoires : exemples, schémas, formules, extraits de code,
             tableaux comparatifs, chiffres clés, références bibliographiques}
EXCLURE   : {ce qui ne doit pas apparaître}

NORMES    : {IEEE | APA | ISO | Vancouver | none — préciser si applicable}
            # Vérifier les conventions du domaine avant de rédiger

STYLE     : professionnel — registre d'un spécialiste humain du domaine
            ton adapté à l'audience (technique, décisionnel, pédagogique, etc.)
            éviter : introductions génériques, listes creuses, formulations IA

TÂCHE     :
Rédige {TYPE} sur {SUJET} pour {AUDIENCE}.
Respecte la longueur et les contraintes ci-dessus.
Écris directement le document, sans préambule ni commentaire introductif.
```

---

## Formulations à éviter systématiquement

| À éviter                                    | Alternative                              |
|---------------------------------------------|------------------------------------------|
| "Dans un monde en constante évolution…"     | Commencer par le fait ou le problème     |
| "Il est important de noter que…"            | Énoncer le fait directement              |
| "Cette approche innovante permet de…"       | Décrire ce qu'elle fait précisément      |
| "En conclusion, nous pouvons dire que…"     | Formuler la conclusion directement       |
| "De nombreux experts s'accordent à dire…"   | Citer la source ou l'étude               |
| "Solution robuste et scalable"              | Donner des métriques ou des preuves      |

---

## Exemples de SUJET selon domaine

| Domaine       | Exemple de SUJET                                          |
|---------------|-----------------------------------------------------------|
| ML / IA       | pipeline d'entraînement d'un modèle TTS multilingue       |
| Développement | API d'authentification REST — guide développeur           |
| Recherche     | résumé de la méthodologie expérimentale — conf. NeurIPS   |
| Business      | présentation investisseurs — roadmap produit Q3           |
| Éducation     | cours d'introduction aux réseaux de neurones convolutifs  |
| Juridique     | clause de confidentialité pour contrat freelance          |
| DevOps        | runbook de déploiement — environnement production         |

---

## Notes

- Avant toute rédaction, Claude charge `.claude/context/style.md` si disponible
  pour écrire dans la voix de l'auteur — pas besoin de le demander explicitement
- Si le document nécessite une décision de structure ou d'angle préalable,
  utiliser d'abord [REASONING] avec Opus
- Après le premier jet, utiliser [REVIEW] pour la relecture qualité
- Pour les articles scientifiques : vérifier les conventions de la conférence ou revue cible
