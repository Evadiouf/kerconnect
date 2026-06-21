# Template : Rapport d'analyse / Bilan intermédiaire
# Modèle recommandé : /model sonnet
# Usage : rapport d'analyse, bilan de sprint, rapport d'étape, étude comparative

---

## En-tête de prompt à copier-coller

```
TYPE_RAPPORT : {analyse | bilan de sprint | rapport d'étape | étude comparative |
                audit | post-mortem | rapport d'incident | note de synthèse}
SUJET        : {objet précis du rapport en 1 phrase}
PÉRIODE      : {dates ou itération couverte, si applicable}
AUDIENCE     : {équipe technique | direction | client | parties prenantes}
LANGUE       : {français | anglais}
LONGUEUR     : {courte ~300 mots | standard ~800 mots | complète > 1500 mots}

DONNÉES      :
- {source 1 : metrics, logs, résultats, données brutes}
- {source 2 : compte-rendu, retours, observations}
# Lire UNIQUEMENT les sources listées ici

STRUCTURE    : {IMRaD | SCQA | personnalisée}
               # IMRaD : Introduction, Méthodes, Résultats, Discussion
               # SCQA : Situation, Complication, Question, Réponse (business)
               # Personnalisée : préciser les sections voulues

INCLURE      : {éléments obligatoires : tableaux, métriques, recommandations,
                plan d'action, comparaisons, causes identifiées}

TÂCHE        :
Rédige {TYPE_RAPPORT} sur {SUJET} pour {AUDIENCE}.
Structure selon {STRUCTURE}.
Appuie chaque conclusion sur les données fournies.
Écris directement le rapport sans préambule.
```

---

## Structures standard par type de rapport

### Rapport d'analyse (IMRaD — scientifique / technique)
```
Résumé (Abstract)       — objectif, méthode, résultat principal, conclusion
1. Introduction          — contexte, problème, objectif de l'analyse
2. Méthodes              — données, outils, protocole, limites méthodologiques
3. Résultats             — faits observés, métriques, tableaux, sans interprétation
4. Discussion            — interprétation, causes, comparaison aux attentes
5. Conclusion            — réponse à la question initiale, prochaines étapes
Références              — sources citées
```

### Rapport d'étape / bilan de sprint (SCQA — business)
```
1. Situation             — état au début de la période
2. Avancement            — ce qui a été livré, métriques clés
3. Obstacles             — problèmes rencontrés, causes identifiées
4. Décisions prises      — arbitrages, changements de direction
5. Prochaines étapes     — objectifs période suivante, actions assignées
6. Indicateurs           — tableau de bord (budget, délai, qualité, risques)
```

### Post-mortem / Rapport d'incident
```
1. Résumé exécutif       — quoi, quand, impact, durée
2. Chronologie           — timeline détaillée des événements
3. Causes racines        — analyse 5 Why ou diagramme Ishikawa
4. Impact                — utilisateurs affectés, données, SLA, coût
5. Mesures correctives   — court terme (déjà appliquées) et long terme (planifiées)
6. Leçons apprises       — ce que l'équipe retient
7. Actions de suivi      — responsable + deadline pour chaque action
```

### Étude comparative
```
1. Contexte et objectif
2. Critères d'évaluation (pondérés si pertinent)
3. Analyse par option    — une section par alternative
4. Tableau comparatif synthétique
5. Recommandation motivée
6. Conditions de révision de la décision
```

---

## Règles de rédaction d'un rapport

- Chaque conclusion est **étayée par une donnée** — jamais d'affirmation sans preuve
- Les métriques ont des unités, des périodes et une source
- Les recommandations sont **actionnables** : qui fait quoi avant quelle date
- Distinguer faits (ce qui s'est passé) et interprétations (pourquoi)
- Le résumé exécutif doit tenir seul, sans lire le reste

---

## Checklist avant de livrer un rapport

- [ ] Chaque conclusion s'appuie sur une donnée ou observation
- [ ] Les métriques ont des unités et des périodes
- [ ] Les recommandations sont actionnables (responsable + date)
- [ ] Le résumé est compréhensible sans lire le reste
- [ ] Aucune formulation creuse ou non sourcée
- [ ] Relu avec la grille qualité de collaboration.md §3
