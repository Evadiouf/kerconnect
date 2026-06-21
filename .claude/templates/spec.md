# Template : Spécification — Cahier des charges / SFD / STD
# Modèle recommandé : /model sonnet (après [REASONING] sur Opus si > 3 composants)
# Normes de référence : IEEE 830, ISO/IEC 29148, IEEE 1016

---

## En-tête de prompt à copier-coller

```
TYPE_SPEC    : {CDC | SFD | STD | ADR}
               # CDC = Cahier des charges
               # SFD = Spécification fonctionnelle
               # STD = Spécification technique
               # ADR = Architecture Decision Record

PROJET       : {nom et description en 2 phrases}
VERSION      : {v0.1 — première rédaction | vX.Y — révision}
AUDIENCE     : {équipe technique | maîtrise d'ouvrage | client | jury}
LANGUE       : {français | anglais}

PÉRIMÈTRE    :
- Ce qui est inclus  : {fonctionnalités, modules ou décisions couverts}
- Ce qui est exclus  : {hors périmètre explicite}

CONTRAINTES  :
- Techniques     : {langages, frameworks, performances, compatibilités}
- Métier         : {règles, réglementations, SLA, normes sectorielles}
- Ressources     : {budget, délais, équipe}

SOURCES      :
- {fichier ou document 1 — rôle en 5 mots}
- {fichier ou document 2 — rôle en 5 mots}
# Maximum 3 sources — ne charger que celles-ci

TÂCHE        :
Rédige {TYPE_SPEC} pour {PROJET}.
Respecte la structure standard du type de document demandé.
Chaque exigence est numérotée, traçable et testable.
Écris directement le document sans préambule.
```

---

## Structures standard par type

### Cahier des charges (CDC) — IEEE 830 / ISO/IEC 29148
```
1. Objet et périmètre
2. Contexte et enjeux
3. Objectifs du projet
4. Exigences fonctionnelles (EF-XXX)
5. Exigences non fonctionnelles (ENF-XXX)
   - Performance, sécurité, disponibilité, maintenabilité
6. Contraintes techniques et organisationnelles
7. Livrables attendus
8. Jalons et planning indicatif
9. Critères d'acceptation
10. Annexes (glossaire, parties prenantes)
```

### Spécification fonctionnelle (SFD)
```
1. Introduction et références
2. Acteurs et rôles
3. Cas d'usage (UC-XXX)
   - Acteur, préconditions, scénario nominal, scénarios alternatifs, postconditions
4. Règles métier (RM-XXX)
5. Flux de données et interfaces
6. Gestion des erreurs et cas limites
7. Maquettes ou wireframes (si disponibles)
8. Matrice de traçabilité EF ↔ UC
```

### Spécification technique (STD)
```
1. Architecture cible (C4 : Context, Container, Component)
2. Choix technologiques et justification
3. Modèle de données
4. API : endpoints, payload, codes de retour
5. Sécurité : authentification, autorisation, chiffrement
6. Performance : cibles, stratégies de cache, limites
7. Déploiement et infrastructure
8. Monitoring et observabilité
9. Décisions d'architecture (ADR intégrés ou référencés)
10. Dépendances et risques techniques
```

### Architecture Decision Record (ADR) — format MADR
```
# ADR-XXX — {Titre de la décision}

**Date :** {YYYY-MM-DD}
**Statut :** {Proposé | Accepté | Remplacé par ADR-YYY | Obsolète}
**Décideurs :** {noms ou rôles}

## Contexte
{Situation qui nécessite une décision.}

## Décision
{Ce qui a été décidé.}

## Alternatives considérées
| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| A      |           |               |
| B      |           |               |

## Conséquences
- Positives : …
- Négatives ou risques : …

## Références
{Liens, benchmarks, études ayant éclairé la décision.}
```

---

## Conventions de numérotation des exigences

| Préfixe | Type                           |
|---------|--------------------------------|
| EF-XXX  | Exigence fonctionnelle         |
| ENF-XXX | Exigence non fonctionnelle     |
| UC-XXX  | Cas d'usage                    |
| RM-XXX  | Règle métier                   |
| ADR-XXX | Architecture Decision Record   |
| RQ-XXX  | Risque qualifié                |

---

## Checklist avant de livrer une spécification

- [ ] Chaque exigence est numérotée et formulée avec un verbe d'obligation (doit, devra)
- [ ] Les exigences non fonctionnelles ont des seuils mesurables (pas "rapide" mais "< 200ms")
- [ ] Le périmètre exclus est explicite
- [ ] La matrice de traçabilité est présente (SFD)
- [ ] Les ADR documentent les décisions non évidentes (STD)
- [ ] Le document a été relu avec la grille qualité de collaboration.md §3
